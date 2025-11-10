// components/booking/BookingForm.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import useCountries from '@hooks/useCountries';
import { useAppDispatch, useAppSelector } from '@lib/redux/store';
import { hotel_booking } from '@src/actions';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Select from '@components/core/select';
import { AccordionInfoCard } from '@components/core/accordians/accordian';
import useDictionary from '@hooks/useDict'; //  Add this
import useLocale from '@hooks/useLocale';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useUser } from '@hooks/use-user';
import { country, setBookingReference } from '@lib/redux/base';
import { toast } from 'react-toastify';
// Get dict for error messages
const useBookingFormSchema = (dict: any) => {
  return z.object({
    firstName: z.string().min(1, dict?.bookingForm?.errors?.firstNameRequired),
    lastName: z.string().min(1, dict?.bookingForm?.errors?.lastNameRequired),
    address: z.string().min(1, dict?.bookingForm?.errors?.addressRequired),
    email: z.string().email(dict?.bookingForm?.errors?.invalidEmail),
    nationality: z.string().min(1, dict?.bookingForm?.errors?.nationalityRequired),
    currentCountry: z.string().min(1, dict?.bookingForm?.errors?.currentCountryRequired),
    phoneCountryCode: z.string().min(1, dict?.bookingForm?.errors?.countryCodeRequired),
    phoneNumber: z
      .string()
      .min(1, dict?.bookingForm?.errors?.phoneNumberRequired || "Phone number is required"),


    travellers: z
      .array(
        z.object({
          title: z.string().min(1, dict?.bookingForm?.errors?.titleRequired),
          firstName: z.string().min(1, dict?.bookingForm?.errors?.firstNameRequired),
          lastName: z.string().min(1, dict?.bookingForm?.errors?.lastNameRequired),
          age: z.string().optional(),
        })
      )
      .min(1, dict?.bookingForm?.errors?.atLeastOneTraveller),
    // paymentMethod: z.string().min(1, dict?.bookingForm?.errors?.paymentMethodRequired),

    // Payment Card Fields (conditionally required)
    cardName: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
    cardZip: z.string().optional(),

    acceptPolicy: z
      .boolean()
      .refine((val) => val === true, {
        message: dict?.bookingForm?.errors?.acceptPolicyRequired,
      }),
  }).superRefine((data, ctx) => {
    const { cardName, cardNumber, cardExpiry, cardCvv, cardZip } = data;

    // if (paymentMethod === 'credit_card') {
    if (!cardName || cardName.trim() === '') {
      ctx.addIssue({
        path: ['cardName'],
        message: dict?.bookingForm?.errors?.cardNameRequired || 'Cardholder name is required',
        code: 'custom',
      });
      // }

      if (!cardNumber || !/^\d{13,19}$/.test(cardNumber.replace(/\s+/g, ''))) {
        ctx.addIssue({
          path: ['cardNumber'],
          message: dict?.bookingForm?.errors?.invalidCardNumber || 'Invalid card number',
          code: 'custom',
        });
      }

      if (!cardExpiry || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardExpiry)) {
        ctx.addIssue({
          path: ['cardExpiry'],
          message: dict?.bookingForm?.errors?.invalidCardExpiry || 'Invalid expiration date (MM/YY)',
          code: 'custom',
        });
      }

      if (!cardCvv || !/^\d{3,4}$/.test(cardCvv)) {
        ctx.addIssue({
          path: ['cardCvv'],
          message: dict?.bookingForm?.errors?.invalidCardCvv || 'Invalid CVV (3-4 digits)',
          code: 'custom',
        });
      }

      if (!cardZip || !/^\d{5}(?:[-\s]\d{4})?$/.test(cardZip)) {
        ctx.addIssue({
          path: ['cardZip'],
          message: dict?.bookingForm?.errors?.invalidCardZip || 'Invalid ZIP code',
          code: 'custom',
        });
      }
    }
  });
};

export type BookingFormValues = z.infer<ReturnType<typeof useBookingFormSchema>>;
export default function BookingForm(){
  const { locale } =useLocale();
  const { data: dict } = useDictionary(locale as any);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const bookingSchema = useBookingFormSchema(dict);
  interface User {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    address1: string;
    country_code: string;
    phone_country_code: string;
    phone: string;
    // Add other fields if needed
  }
  const { user } = useUser();

  // Cast to known type (safe because you've verified the structure)
  const typedUser = user as User | null | undefined;
// =========== SET DEFAULT VALUSE FOR FORM =================
  const defaultValues: BookingFormValues = {
    firstName: typedUser?.first_name || '',
    lastName: typedUser?.last_name || '',
    address: typedUser?.address1 || '',
    email: typedUser?.email || '',
    nationality:  "US",
    currentCountry: "US",
    phoneCountryCode: "1",
    phoneNumber: typedUser?.phone || '',
    travellers: [{ title: dict?.bookingForm?.titles?.mr, firstName: '', lastName: '', age: '' }],
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardZip: '',
    acceptPolicy: false,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookingFormValues>({
    defaultValues,
    resolver: zodResolver(bookingSchema),
  });

  const { fields } = useFieldArray({
    control,
    name: 'travellers',
  });
// ============== ALL HOOKS CALL ===================
  const { countries: rawCountries } = useCountries();
  const { payment_gateways } = useAppSelector((state:any) => state.appData?.data);
  const selectedRoom = useAppSelector((state:any) => state.root.selectedRoom);
    const hasAutoSaved = useRef(false);
  const { option } = selectedRoom || {};

  const {
bookingReference
} = useAppSelector((state:any) => state.root);
  // const bookingReference_no=useAppSelector((state:any)=> state.root)
  const stripe = useStripe();
  const elements = useElements();
  const dispatch=useAppDispatch()

  // const [bookingReference, setBookingReference] = useState<string>(
  //   new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14)
  // );
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { hotelDetails } = selectedRoom || {};
  const [isTitleOpen, setIsTitleOpen] = useState<number | null>(null);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titles = [
    dict?.bookingForm?.titles?.mr,
    dict?.bookingForm?.titles?.mrs,
    dict?.bookingForm?.titles?.ms,
    dict?.bookingForm?.titles?.dr,
  ];
  const [isCountryListOpen, setIsCountryListOpen] = useState<boolean>(false);
  const [isPhoneCodeListOpen, setIsPhoneCodeListOpen] = useState<boolean>(false);
  const curruntBooking = localStorage.getItem('hotelSearchForm');
  const saveBookingData = curruntBooking ? JSON.parse(curruntBooking) : {};
  const { adults = 0, children = 0, nationality, checkin, checkout } = saveBookingData;
  const travelers = adults + children;
//================ EXTRACTING VALUES FROM OPTIONS =================
  const { price, id: option_id, currency: booking_currency, extrabeds_quantity, extrabed_price, markup_price_per_night,subtotal,cc_fee,markup_type,markup_amout,net_profit,markup_price,quantity, per_day,children_ages, service_fee, child, currency } = selectedRoom?.option || {};

// ============= AGENT FEEE ==================
const agent_fee=markup_type ==="user_markup" ? markup_amout : ""
 const inDate = new Date(checkin);
    const outDate = new Date(checkout);
    const total_nights = Math.ceil(
      (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  //=============== ROOM DATA =========================
 const sanitizeNumber = (value:any) => {
  if (value === null || value === undefined) return "0";
  return String(value).replace(/,/g, "");
};
 const booking_data = selectedRoom?.option || {};
  const modified_booking_data = {
  ...booking_data,
  quantity: quantity,
  price: sanitizeNumber(booking_data.price),
  per_day: sanitizeNumber(booking_data.per_day),
  markup_price: sanitizeNumber(markup_price),
  markup_price_per_night: sanitizeNumber(markup_price_per_night),
  service_fee: sanitizeNumber(booking_data.service_fee),
  extrabed_price: sanitizeNumber(booking_data.extrabed_price),
  markup_amount: sanitizeNumber(booking_data.markup_amount),
  subtotal: sanitizeNumber(booking_data.subtotal),
  subtotal_per_night: sanitizeNumber(booking_data.subtotal_per_night),
  cc_fee: sanitizeNumber(booking_data.cc_fee),
  net_profit: sanitizeNumber(booking_data.net_profit),
};
  //==================== EXTRACTING HOTEL RELATED DATA ==================
  const {
    id: hotel_id,
    address: hotel_address,
    name: hotel_name,
    supplier_name,
    supplier_id,
    stars,
    img: hotel_image,
    city: hotel_location,
    country: hotel_country,
    hotel_email,
    hotel_phone,
    hotel_website,
  } = selectedRoom?.hotelDetails || {};



  const excludedCodes = ['0', '381', '599'];
  const countryList = Array.isArray(rawCountries)
    ? rawCountries
      .map((c: any) => ({
        iso: c.iso || c.code || '',
        name: c.nicename || c.name || '',
        phonecode: c.phonecode?.toString() || '0',
      }))
      .filter((c) => c.iso && c.name && !excludedCodes.includes(c.phonecode))
    : [];


  // options for SELECT DROPDOWN
  const countryOptions = countryList.map((c) => ({
    value: c.iso,
    label: c.name,
    iso: c.iso,
    phonecode: c.phonecode,
  }));
  // const phoneCodeOptions = countryList.map((c) => ({
  //   value: `+${c.phonecode}`,
  //   label: `+${c.phonecode}`,
  //   iso: c.iso,
  //   phonecode: `${c.phonecode}`,
  // }));

  const phoneCodeOptions = countryList.map((c) => {
  const iso = c.phonecode === "1" ? "US" : c.iso;
  return {
    value: `+${c.phonecode}`,
    label: `+${c.phonecode}`,
    iso, //  overridden for +1
    phonecode: `${c.phonecode}`,
  };
});
useEffect(() => {
  if (!bookingReference) {
    const ref_no = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    dispatch(setBookingReference(ref_no));
  }
}, [bookingReference, dispatch]);

  const currentCountry = watch('currentCountry');
  useEffect(() => {
    if (currentCountry) {
      const country = countryList.find((c) => c.iso === currentCountry);
      if (country) {
        setValue('phoneCountryCode', `+${country.phonecode}`);
      }
    }
  }, [currentCountry, countryList, setValue]);

  useEffect(() => {
    if (nationality) {
      setValue('nationality', nationality);
    }
    if (travelers > 0) {
      const initialTravellers = Array.from({ length: travelers }, () => ({
        title: dict?.bookingForm?.titles?.mr,
        firstName: '',
        lastName: '',

      }));
      setValue('travellers', initialTravellers);
    }
  }, [setValue, nationality, travelers, dict]);


  //================= AUTO SAVE BOOKING DATA ===================
 useEffect(() => {
    // Guard: Only run once, only if user exists, and only if not already saved
    if (!user || hasAutoSaved.current) return;

    const {
      firstName,
      lastName,
      address,
      nationality,
      currentCountry,
      email,
      phoneCountryCode,
      phoneNumber,
    } = defaultValues;

    // Build guest payload
    const guestPayload = Array.from({ length: travelers }, (_, index) => ({
      traveller_type: index < adults ? 'adults' : 'child',
      title: dict?.bookingForm?.titles?.mr || 'Mr',
      first_name: '',
      last_name: '',
      nationality: nationality || '',
      age: '',
      dob_day: '',
      dob_month: '',
      dob_year: '',
    }));

    // Build booking payload


const bookingPayload = {
  booking_ref_no: bookingReference,
  booking_date: new Date().toISOString().split("T")[0],
  booking_status: "pending",

  // 🔹 Price and financials
  price_original: sanitizeNumber(price || 0),
  price_markup: sanitizeNumber(markup_price || 0),
  supplier_cost: sanitizeNumber(price || 0),
  toptier_fee: sanitizeNumber("0"),
  agent_fee: sanitizeNumber(agent_fee || 0),
  vat: sanitizeNumber(0),
  tax: sanitizeNumber(0),
  gst: sanitizeNumber(0),
  net_profit: sanitizeNumber(net_profit || 0),
  subtotal: sanitizeNumber(subtotal || 0),


  // 🔹 Customer info
  first_name: firstName || "",
  last_name: lastName || "",
  email: email || "",
  address: address || "",
  phone_country_code: phoneCountryCode || "+92",
  phone: phoneNumber || "000-000-000",
  country: currentCountry || "UNITED ARAB EMIRATES",

  // 🔹 Hotel info
  stars: stars || 0,
  hotel_id: hotel_id || "",
  hotel_name: hotel_name || "",
  hotel_phone: hotel_phone || "",
  hotel_email: hotel_email || "",
  hotel_website: hotel_website || "",
  hotel_address: hotel_address || "",
  hotel_img: hotel_image?.[0] || "",
  location: hotel_location || "",
  location_cords: hotel_address || "",

  // 🔹 Room info

   room_data :[
  {
    room_id: option_id,
    room_name: selectedRoom?.room?.name || "",
    room_price_per_night:  sanitizeNumber(markup_price_per_night),
    room_quantity: quantity || 1,
    room_extrabed_price: sanitizeNumber(extrabed_price || 0),
    room_extrabed: extrabeds_quantity || 0,
    room_actual_price_per_night: sanitizeNumber(per_day),
    total_nights: total_nights,
    total_markup_price: sanitizeNumber(markup_price),
    total_actual_price: sanitizeNumber(price),
    cc_fee: sanitizeNumber(cc_fee || 0),
  }
],

  checkin: checkin || "10-10-2025",
  checkout: checkout || "14-10-2025",
  booking_nights: total_nights,

  adults: adults || 0,
  childs: children || 0,
  child_ages: children_ages,

  currency_original: booking_currency || "USD",
  currency_markup: booking_currency || "USD",

  payment_date: "",
  payment_gateway: "stripe",
  cancellation_request: "0",
  cancellation_status: "0",
  cancellation_response: "",
  cancellation_date: "",
  cancellation_error: "",

  booking_data: modified_booking_data,
  payment_status: "unpaid",
  supplier: supplier_name || "",
  transaction_id: "",
  user_id: "",
  user_data: {
    user_id: user?.user_id,
    first_name: firstName || "",
    last_name: lastName || "",
    address: address || "",
    email: email || "",
    phone: phoneNumber || "",
    nationality: nationality || "pk",
    country_code: nationality || "pk",
  },
  guest: guestPayload,

  nationality: nationality || "",
  module_type: "hotels",
  pnr: "",
  booking_response: "",
  error_response: "",

  agent_id: "",
  booking_note: "",
  supplier_payment_status: "unpaid",
  supplier_due_date: new Date().toISOString().split("T")[0],
  cancellation_terms: "",
  supplier_id: supplier_id || "",
  supplier_payment_type: "",
  customer_payment_type: "",
  iata: "",
  agent_commission_status: "pending",
  agent_payment_type: "pending",
  agent_payment_status: "pending",
  agent_payment_date: "",

  card: {
    name: "",
    number: "",
    expiry: "",
    cvv: "",
    zip: "",
  },
};



    // ✅ FIX: Mark as saved BEFORE API call to prevent race conditions
    hasAutoSaved.current = true;
    // Hit the API
    hotel_booking(bookingPayload as any)
      .then(response => {
        setBookingReference(response.booking_ref_no);
      })
      .catch(error => {
        toast.error(' Pre-booking API failed:', error);
        // Reset flag on error so it can retry
        hasAutoSaved.current = false;
      });
  }, []); //  FIX:
  //================ SUBMIT BOOKING ======================
  const onSubmit = async (data: BookingFormValues) => {
    if (!data) return;
    setIsProcessingPayment(true);
    setIsPending(true);
    try {
      const {
        firstName,
        lastName,
        address,
        nationality,
        currentCountry,
        email,
        phoneCountryCode,
        phoneNumber,
        travellers,
        cardName,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardZip,
      } = data;

      //  Fix guest type to 'child' not 'childs'
      const guestPayload = (travellers || []).map((traveller: any, index: number) => ({
        traveller_type: index < adults ? 'adults' : 'child',
        title: traveller.title || '',
        first_name: traveller.firstName || '',
        last_name: traveller.lastName || '',
        nationality: nationality || '',
        age: '',
        dob_day: '',
        dob_month: '',
        dob_year: '',
      }));
const bookingPayload = {
  // 🔹 Core booking details
  booking_ref_no: bookingReference,
  booking_date: new Date().toISOString().split("T")[0],
  booking_status: "pending",
  booking_nights: total_nights,

  // 🔹 Price and financials
    price_original: sanitizeNumber(price || 0),
  price_markup: sanitizeNumber(markup_price || 0),
  supplier_cost: sanitizeNumber(price || 0),

  actual_price:sanitizeNumber(price || 0),
  toptier_fee: "0",
  agent_fee: agent_fee || "0",
  vat: 0,
  tax: 0,
  gst: 0,
  net_profit: net_profit || 0,
  subtotal: subtotal || 0,
  supplier_id: supplier_id || "",
  supplier_payment_type: "",
  customer_payment_type: "",
  supplier_payment_status: "unpaid",
  supplier_due_date: new Date().toISOString().split("T")[0],
  agent_commission_status: "pending",
  agent_payment_type: "pending",
  agent_payment_status: "pending",
  agent_payment_date: "",
  iata: "",
  agent_id: "",

  // 🔹 Customer info
  first_name: firstName || "",
  last_name: lastName || "",
  email: email || "",
  address: address || "",
  phone_country_code: phoneCountryCode || "+92",
  phone: phoneNumber || "000-000-000",
  country: currentCountry || "UNITED ARAB EMIRATES",
  nationality: nationality || "",

  // 🔹 Hotel info
  stars: stars || 0,
  hotel_id: hotel_id || "",
  hotel_name: hotel_name || "",
  hotel_phone: hotel_phone || "",
  hotel_email: hotel_email || "",
  hotel_website: hotel_website || "",
  hotel_address: hotel_address || "",
  hotel_img: hotel_image?.[0] || "",
  location: hotel_location || "",
  location_cords: hotel_address || "",

  // 🔹 Room info
   room_data :[
  {
    room_id: option_id,
    room_name: selectedRoom?.room?.name || "",
    room_price_per_night:  sanitizeNumber(markup_price_per_night),
    room_quantity: quantity || 1,
    room_extrabed_price: sanitizeNumber(extrabed_price || 0),
    room_extrabed: extrabeds_quantity || 0,
    room_actual_price_per_night: sanitizeNumber(markup_price_per_night),
    total_nights: total_nights,
    total_markup_price: sanitizeNumber(markup_price),
    total_actual_price: sanitizeNumber(price),
    cc_fee: sanitizeNumber(cc_fee || 0),
  }
],
  // 🔹 Dates and stay info
  checkin: checkin || "10-10-2025",
  checkout: checkout || "14-10-2025",
  adults: adults || 0,
  childs: children || 0,
  child_ages: children_ages,

  // 🔹 Currency
  currency_original: booking_currency || "USD",
  currency_markup: booking_currency || "USD",

  // 🔹 Payment and booking meta
  payment_date: "",
  payment_status: "unpaid",
  payment_gateway: "",
  module_type: "hotels",
  pnr: "",
  transaction_id: "",
  user_id: "",

  // 🔹 Cancellation info
  cancellation_request: "0",
  cancellation_status: "0",
  cancellation_response: "",
  cancellation_date: "",
  cancellation_error: "",
  cancellation_terms: "",

  // 🔹 Booking data & API responses
  booking_data: modified_booking_data,
  booking_response: "",
  error_response: "",

  // 🔹 Notes & additional metadata
  booking_note: "",

  // 🔹 Supplier
  supplier: supplier_name || "",

  // 🔹 Nested user data
  user_data: {
user_id: user?.user_id,
    first_name: firstName || "",
    last_name: lastName || "",
    address: address || "",
    email: email || "",
    phone: phoneNumber || "",
    nationality: nationality || "pk",
    country_code: nationality || "pk",
  },

  // 🔹 Guest info
  guest: guestPayload || [],

  // 🔹 Card info
  card: {
    name: cardName || "",
    number: cardNumber || "",
    expiry: cardExpiry || "",
    cvv: cardCvv || "",
    zip: cardZip || "",
  },
};



      //  Run hotel booking and paymentIntent API in parallel for performance
      const [bookingResponse, paymentRes] = await Promise.all([

        hotel_booking(bookingPayload as any),
        fetch("/api/paymentIntent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: sanitizeNumber(markup_price) || 0,
            currency: booking_currency,
            booking_ref_no: bookingReference,   //bookingReference,
            module_type: supplier_name,
            email,
          }),
        }),
      ]);

      const bookingData = await bookingResponse;
      const paymentData = await paymentRes.json();

      const { clientSecret, success_url } = paymentData;

      if (!stripe || !elements) {
        alert("Stripe not initialized");
        setIsProcessingPayment(false);
        setIsPending(false);
        return;
      }

      if (!clientSecret) {
        toast.error("Missing clientSecret from payment API:");
        toast.error("Payment setup failed. Please try again.");
        setIsProcessingPayment(false);
        setIsPending(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        alert("Card element not found");
        setIsProcessingPayment(false);
        setIsPending(false);
        return;
      }
      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardName,
            email,
          },
        },
      });

      if (result.error) {
        console.error("Payment failed:", result.error.message);
        alert(`Payment failed: ${result.error.message}`);
        setIsProcessingPayment(false);
        setIsPending(false);
      } else if (result.paymentIntent?.status === 'succeeded') {
         dispatch(setBookingReference(''));
        router.replace(success_url);
      } else {
        alert("Payment did not succeed. Please try again.");
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error("Payment process error:", error);
      alert("An error occurred. Please try again.");
      setIsProcessingPayment(false);
      setIsPending(false);
    }
  };


  const getCountryByIso = (iso: string) => countryList.find((c) => c.iso === iso);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information */}
      <div className="mb-12">
        <h3 className="text-xl text-[#0F172BE5] font-semibold mb-2">
          {dict?.bookingForm?.personalInformation?.title}
        </h3>
        <p className="text-[#0F172B66] font-medium text-base mb-4">
          {dict?.bookingForm?.personalInformation?.subtitle}
        </p>
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full ">
            <label htmlFor="firstName" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.personalInformation?.firstNameLabel}
            </label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="firstName"
                  type="text"
                  className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
                />
              )}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div className="w-full ">
            <label htmlFor="lastName" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.personalInformation?.lastNameLabel}
            </label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="lastName"
                  type="text"
                  className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
                />
              )}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
          <div className="w-full ">
            <label htmlFor="address" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.personalInformation?.addressLabel}
            </label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="address"
                  type="text"
                  className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
                />
              )}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="flex flex-col gap-3 mb-12">
        <h3 className="text-xl text-[#0F172BE5] font-semibold">
          {dict?.bookingForm?.contactInformation?.title}
        </h3>
        <p className="text-[#0F172B66] text-base font-medium">
          {dict?.bookingForm?.contactInformation?.subtitle}
        </p>
        <div className="w-full ">
          <label htmlFor="email" className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.contactInformation?.emailLabel}
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="email"
                type="email"
                className="block border mb-4 border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
              />
            )}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="w-full ">
          <label htmlFor="nationality" className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.contactInformation?.nationalityLabel}
          </label>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => {
              const country = getCountryByIso(field.value);
              return (
                <div className="border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none bg-gray-100 cursor-not-allowed flex items-center gap-2">
                  {country && (
                    <Icon icon={`flagpack:${country.iso.toLowerCase()}`} width="24" height="18" />
                  )}
                  <span>{country?.name || field.value}</span>
                </div>
              );
            }}
          />
          {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality.message}</p>}
        </div>

        <div className="w-full ">
          <label htmlFor="currentCountry" className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.contactInformation?.currentCountryLabel || "Current Country"}
          </label>
          <Controller
            name="currentCountry"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={countryOptions}
                placeholder={dict?.bookingForm?.contactInformation?.currentCountryLabel || "Current Country"}
                isSearchable
                onChange={(option: any) => field.onChange(option?.value || '')}
                value={countryOptions.find((opt) => opt.value === field.value) || null}
                className="w-full"
                classNames={{
                  control: () =>
                    'border border-gray-300 cursor-pointer rounded-xl px-3 py-3.5 flex items-center min-h-[44px] text-base focus:ring-1 focus:ring-[#163C8C] focus:border-[#163C8C] shadow-none',
                  valueContainer: () => 'flex items-center gap-2 px-1',
                  singleValue: () =>
                    'flex items-center gap-2 text-gray-800 font-medium truncate',
                  placeholder: () => 'text-gray-400 font-normal',
                  // ✅ ONLY CHANGE: arrow position based on locale
                  indicatorsContainer: () =>
                    locale?.startsWith('ar') ? 'absolute left-4' : 'absolute right-4',
                }}
                onMenuOpen={() => setIsCountryListOpen(true)}
                onMenuClose={() => setIsCountryListOpen(false)}
                components={{
                  Option: ({ data, ...props }) => (
                    <div
                      {...props.innerProps}
                      className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
                    >
                      <Icon
                        icon={`flagpack:${data.iso?.toLowerCase()}`}
                        width="22"
                        height="16"
                        className="rounded-sm"
                      />
                      <span>{data.label}</span>
                    </div>
                  ),
                  SingleValue: ({ data }) => (
                    <div className="flex items-center gap-2 truncate">
                      <Icon
                        icon={`flagpack:${data.iso?.toLowerCase()}`}
                        width="22"
                        height="16"
                        className="rounded-sm"
                      />
                      <span>{data.label}</span>
                    </div>
                  ),
                  // ✅ ONLY CHANGE: keep arrow rotation, but no margin tricks
                  DropdownIndicator: () => (
                    <Icon
                      icon="mdi:keyboard-arrow-down"
                      width="24"
                      height="24"
                      className={`text-gray-600 transition duration-100 ease-in-out ${isCountryListOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                    />
                  ),
                  IndicatorSeparator: () => null,
                }}
              />
            )}
          />
          {errors.currentCountry && <p className="text-red-500 text-sm mt-1">{errors.currentCountry.message}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:max-w-50">
            <label htmlFor="phoneCountryCode" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.contactInformation?.phoneCodeLabel || "Country Code"}
            </label>
            <Controller
              name="phoneCountryCode"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={phoneCodeOptions}
                  placeholder={dict?.bookingForm?.contactInformation?.phoneCodeLabel || "Country Code"}
                  isSearchable
                  onChange={(option: any) => field.onChange(option?.value || '')}
                  value={phoneCodeOptions.find((opt) => opt.value === field.value) || null}
                  className="w-full"
                  classNames={{
                    control: () =>
                      'border border-gray-300 cursor-pointer rounded-xl px-3 py-3.5 flex items-center min-h-[44px] text-base focus:ring-1 focus:ring-[#163C8C] focus:border-[#163C8C] shadow-none',
                    valueContainer: () => 'flex items-center gap-2 px-1',
                    singleValue: () => 'flex items-center justify-between text-gray-800 font-medium',
                    placeholder: () => 'text-gray-400 font-normal',
                    //  ONLY CHANGE: arrow position
                    indicatorsContainer: () =>
                      locale?.startsWith('ar') ? 'absolute left-4' : 'absolute right-4',
                  }}
                  onMenuOpen={() => setIsPhoneCodeListOpen(true)}
                  onMenuClose={() => setIsPhoneCodeListOpen(false)}
                  components={{
                    Option: ({ data, ...props }) => (
                      <div
                        {...props.innerProps}
                        className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
                      >
                        <Icon
                          icon={`flagpack:${data.iso?.toLowerCase()}`}
                          width="22"
                          height="16"
                          className="rounded-sm"
                        />
                        <span>+{data.phonecode}</span>
                      </div>
                    ),
                    SingleValue: ({ data }) => (
                      <div className="flex items-center justify-between gap-2 truncate">
                        <Icon
                          icon={`flagpack:${data.iso?.toLowerCase()}`}
                          width="22"
                          height="16"
                          className="rounded-sm"
                        />
                        <span>+{data.phonecode}</span>
                      </div>
                    ),
                    DropdownIndicator: () => (
                      <Icon
                        icon="mdi:keyboard-arrow-down"
                        width="24"
                        height="24"
                        className={`text-gray-600 transition duration-100 ease-in-out ${isPhoneCodeListOpen ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    ),
                    IndicatorSeparator: () => null,
                  }}
                />
              )}
            />
            {errors.phoneCountryCode && <p className="text-red-500 text-sm mt-1">{errors.phoneCountryCode.message}</p>}
          </div>

          <div className="w-full sm:max-w-122">
            <label htmlFor="phoneNumber" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.contactInformation?.phoneNumberLabel || "Phone Number"}
            </label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="phoneNumber"
                  type="tel"
                  className="block border border-gray-300 rounded-xl px-3 py-3.5 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
                />
              )}
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
          </div>
        </div>
      </div>

      {/* Travelers Information */}
      <div className="flex flex-col gap-3 mb-12">
        <h3 className="text-xl text-[#0F172BE5] font-semibold">
          {dict?.bookingForm?.travelersInformation?.title}
        </h3>
        <p className="text-[#0F172B66] text-base font-medium mb-4">
          {dict?.bookingForm?.travelersInformation?.subtitle}
        </p>
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 mb-3">
            <div className="flex justify-between items-center">
              <h4 className="text-lg text-[#0F172BE5] font-medium">
                {index < adults
                  ? `${dict?.bookingForm?.travelersInformation?.adultTraveller} ${index + 1}`
                  : `${dict?.bookingForm?.travelersInformation?.childTraveller} ${index - adults + 1}`}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_1.5fr] gap-4">
              <div className="w-full">
                {index < adults ? (
                  // 🔹 Adults — show title dropdown as usual
                  <>
                    <label
                      htmlFor={`travellers.${index}.title`}
                      className="block text-base font-medium text-[#5B697E] mb-2"
                    >
                      {dict?.bookingForm?.travelersInformation?.titleLabel}
                    </label>
                    <Controller
                      name={`travellers.${index}.title`}
                      control={control}
                      render={({ field }) => (
                        <div
                          className="relative"
                          ref={(el) => {
                            titleRefs.current[index] = el;
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setIsTitleOpen(isTitleOpen === index ? null : index)}
                            className="flex cursor-pointer items-center justify-between w-full px-3 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:border-[#163C8C]"
                          >
                            {field.value || `Select ${dict?.bookingForm?.travelersInformation?.titleLabel}`}
                            <Icon
                              icon="material-symbols:keyboard-arrow-up"
                              width="24"
                              height="24"
                              className={`h-5 w-5 text-gray-500 transition-transform ${isTitleOpen === index ? 'rotate-0' : 'rotate-180'
                                }`}
                            />
                          </button>
                          {isTitleOpen === index && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow">
                              {titles.map((title) => (
                                <div
                                  key={title}
                                  onClick={() => {
                                    field.onChange(title);
                                    setIsTitleOpen(null);
                                  }}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  {title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </>
                ) : (
                  // 🔹 Children — show disabled input with age
                  <>
                    <label
                      className="block text-base font-medium text-[#5B697E] mb-2"
                    >
                      {dict?.bookingForm?.travelersInformation?.ageLabel || "Child Age"}
                    </label>
                    <input
                      type="text"
                      value={`${option?.children_ages?.split(',')[index - adults]?.trim() || ''} years`}
                      disabled
                      className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </>
                )}

                {errors.travellers?.[index]?.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.travellers[index].title?.message}</p>
                )}
              </div>
              <div className="w-full">
                <label htmlFor={`travellers.${index}.firstName`} className="block text-base font-medium text-[#5B697E] mb-2">
                  {dict?.bookingForm?.personalInformation?.firstNameLabel}
                </label>
                <Controller
                  name={`travellers.${index}.firstName`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id={`travellers.${index}.firstName`}
                      type="text"
                      className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
                    />
                  )}
                />
                {errors.travellers?.[index]?.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.travellers[index].firstName?.message}</p>
                )}
              </div>
              <div className="w-full">
                <label htmlFor={`travellers.${index}.lastName`} className="block text-base font-medium text-[#5B697E] mb-2">
                  {dict?.bookingForm?.personalInformation?.lastNameLabel}
                </label>
                <Controller
                  name={`travellers.${index}.lastName`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id={`travellers.${index}.lastName`}
                      type="text"
                      className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
                    />
                  )}
                />
                {errors.travellers?.[index]?.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.travellers[index].lastName?.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Payment Method */}
      <div className="flex flex-col gap-3 mb-12 w-full">
        <h3 className="text-xl text-[#0F172BE5] font-semibold">
          {dict?.bookingForm?.paymentMethod?.title}
        </h3>
        <p className="text-[#0F172B66] text-base font-medium">
          {dict?.bookingForm?.paymentMethod?.subtitle}
        </p>
      </div>

      {/* Card Information */}
      <div className="flex flex-col gap-3 mb-12">
        <h3 className="text-xl text-[#0F172BE5] font-semibold">
          {dict?.bookingForm?.paymentMethod?.cardInformationTitle}
        </h3>
        <div className="w-full ">
          <label className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.paymentMethod?.cardholderNameLabel}
          </label>
          <Controller
            name="cardName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="John Doe"
                className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
              />
            )}
          />
          {errors.cardName && (
            <p className="text-red-500 text-sm mt-1">{errors.cardName.message}</p>
          )}
        </div>
        <div className="w-full ">
          <label className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.paymentMethod?.cardDetailsLabel}
          </label>
          <div className="border border-gray-300 rounded-xl px-3 py-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                  },
                  invalid: { color: '#9e2146' },
                },
              }}
            />
          </div>
        </div>
      </div>




      {/* Cancellation Policy */}
      <div className="flex flex-col gap-4 mt-3">


        {hotelDetails?.cancellation !== "" && (
          <>
            <h3 className="text-xl text-[#0F172BE5] font-semibold">
              {dict?.bookingForm?.cancellationPolicy?.title}
            </h3>
            <AccordionInfoCard
              title={dict?.bookingForm?.cancellationPolicy?.title}
              showDescription={false}
              showLeftIcon={false}
              titleClassName="text-red-500"
            >
              <div className="bg-red-100 text-red-500 p-4 w-full rounded-lg">
                <p
                  className="text-[#0F172B66] text-base font-medium"
                  dangerouslySetInnerHTML={{ __html: hotelDetails.cancellation }}
                />
              </div>
            </AccordionInfoCard>
          </>
        )}

        <Controller
          name="acceptPolicy"
          control={control}
          render={({ field }) => (
            <label className="flex gap-2 items-start">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-5 h-5 rounded border border-[#0F172B66] mt-0.5 focus:ring-[#163C8C] focus:border-[#163C8C]"
              />
              <span className="text-[#0F172B66] text-base font-medium">
                {dict?.bookingForm?.cancellationPolicy?.acceptText}{' '}
                <span className="text-[#163C8C] underline cursor-pointer hover:text-[#0f2d6b]">
                  {dict?.bookingForm?.cancellationPolicy?.termsAndConditions}
                </span>
              </span>
            </label>
          )}
        />
        {errors.acceptPolicy && <p className="text-red-500 text-sm mt-1">{errors.acceptPolicy.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || isProcessingPayment} //  Block during booking OR payment
        className={`w-full text-lg text-white py-3 font-medium rounded-lg mt-5 transition-colors focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 ${(isPending || isProcessingPayment)
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-[#163C8C] hover:bg-[#0f2d6b] cursor-pointer focus:ring-[#163C8C]'
          }`}
      >
        {(isPending || isProcessingPayment) ? (
          <>
            <Icon icon="svg-spinners:ring-resize" width="20" height="20" className="text-white" />
            {dict?.bookingForm?.buttons?.processing}
          </>
        ) : (
          dict?.bookingForm?.buttons?.confirmAndBook
        )}
      </button>
    </form>
  );
}
