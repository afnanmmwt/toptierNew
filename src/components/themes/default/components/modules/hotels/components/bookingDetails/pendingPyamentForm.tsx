// components/booking/PendingPaymentForm.tsx
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import useCountries from '@hooks/useCountries';
import { useAppDispatch } from '@lib/redux/store';
import { hotel_booking } from '@src/actions';
import { useRouter } from 'next/navigation';
import Select from '@components/core/select';
import { AccordionInfoCard } from '@components/core/accordians/accordian';
import useDictionary from '@hooks/useDict';
import useLocale from '@hooks/useLocale';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

export default function PendingPaymentForm({ invoiceData }: { invoiceData: any }) {
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Parse invoiceData safely
  const parsedInvoice = typeof invoiceData === 'string' ? JSON.parse(invoiceData) : invoiceData;
  const bookingReference = parsedInvoice.booking_ref_no;
  const user_data = typeof parsedInvoice.user_data === 'string' ? JSON.parse(parsedInvoice.user_data) : parsedInvoice.user_data;
  const guest = typeof parsedInvoice.guest === 'string' ? JSON.parse(parsedInvoice.guest) : parsedInvoice.guest;
  const room_data = typeof parsedInvoice.room_data === 'string' ? JSON.parse(parsedInvoice.room_data) : parsedInvoice.room_data;
  const booking_data = typeof parsedInvoice.booking_data === 'string' ? JSON.parse(parsedInvoice.booking_data) : parsedInvoice.booking_data;

  const adults = parseInt(parsedInvoice.adults) || 0;
  const children = parseInt(parsedInvoice.childs) || 0;

  // =============== FORM STATE ===============
  const [formData, setFormData] = useState({
    firstName: user_data?.first_name || '',
    lastName: user_data?.last_name || '',
    address: user_data?.address || '',
    email: user_data?.email || '',
    nationality: parsedInvoice.nationality || '',
    currentCountry: parsedInvoice.country || '',
    phoneCountryCode: parsedInvoice.phone_country_code || '+1',
    phoneNumber: parsedInvoice.phone || '',
    cardName: '',
    acceptPolicy: false,
  });

  const [travellers, setTravellers] = useState(
    guest.map((g: any) => ({
      title: g.title || dict?.bookingForm?.titles?.mr || 'Mr',
      firstName: g.first_name || '',
      lastName: g.last_name || '',
      age: g.age || '',
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  // =============== HOOKS ===============
  const { countries: rawCountries } = useCountries();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const router = useRouter();



  // Country data - useMemo to prevent recreating on every render
  const excludedCodes = ['0', '381', '599'];
  const countryList = useMemo(() => {
    return Array.isArray(rawCountries)
      ? rawCountries
          .map((c: any) => ({
            iso: c.iso || c.code || '',
            name: c.nicename || c.name || '',
            phonecode: c.phonecode?.toString() || '0',
          }))
          .filter((c) => c.iso && c.name && !excludedCodes.includes(c.phonecode))
      : [];
  }, [rawCountries]);

  const countryOptions = useMemo(() =>
    countryList.map((c) => ({
      value: c.iso,
      label: c.name,
      iso: c.iso,
      phonecode: c.phonecode,
    })), [countryList]
  );

  const phoneCodeOptions = useMemo(() =>
    countryList.map((c) => ({
      value: `+${c.phonecode}`,
      label: `+${c.phonecode}`,
      iso: c.iso,
      phonecode: `${c.phonecode}`,
    })), [countryList]
  );

  // =============== EFFECTS ===============
  // useEffect(() => {
  //   if (bookingReference) {
  //     dispatch(setBookingReference(bookingReference));
  //   }
  // }, [bookingReference, dispatch]);

  useEffect(() => {
    const country = countryList.find((c) => c.iso === formData.currentCountry);
    if (country && formData.phoneCountryCode !== `+${country.phonecode}`) {
      setFormData((prev) => ({ ...prev, phoneCountryCode: `+${country.phonecode}` }));
    }
  }, [formData.currentCountry, countryList]);

  // =============== VALIDATION ===============
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = dict?.bookingForm?.errors?.firstNameRequired || 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = dict?.bookingForm?.errors?.lastNameRequired || 'Last name is required';
    if (!formData.address.trim()) newErrors.address = dict?.bookingForm?.errors?.addressRequired || 'Address is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = dict?.bookingForm?.errors?.invalidEmail || 'Invalid email';
    if (!formData.nationality) newErrors.nationality = dict?.bookingForm?.errors?.nationalityRequired || 'Nationality is required';
    if (!formData.currentCountry) newErrors.currentCountry = dict?.bookingForm?.errors?.currentCountryRequired || 'Country is required';
    if (!formData.phoneCountryCode) newErrors.phoneCountryCode = dict?.bookingForm?.errors?.countryCodeRequired || 'Country code is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = dict?.bookingForm?.errors?.phoneNumberRequired || 'Phone number is required';
    if (!formData.cardName.trim()) newErrors.cardName = dict?.bookingForm?.errors?.cardNameRequired || 'Cardholder name is required';
    if (!formData.acceptPolicy) newErrors.acceptPolicy = dict?.bookingForm?.errors?.acceptPolicyRequired || 'Please accept terms and conditions';

    travellers.forEach((t: any, i: any) => {
      if (i < adults && !t.title.trim()) newErrors[`travellers.${i}.title`] = dict?.bookingForm?.errors?.titleRequired || 'Title is required';
      if (!t.firstName.trim()) newErrors[`travellers.${i}.firstName`] = dict?.bookingForm?.errors?.firstNameRequired || 'First name is required';
      if (!t.lastName.trim()) newErrors[`travellers.${i}.lastName`] = dict?.bookingForm?.errors?.lastNameRequired || 'Last name is required';
    });

    if (travellers.length === 0) {
      newErrors.travellers = dict?.bookingForm?.errors?.atLeastOneTraveller || 'At least one traveller required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============== HANDLERS ===============
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleTravellerChange = (index: number, field: string, value: string) => {
    setTravellers((prev: any) =>
      prev.map((t: any, i: any) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =============== UTILS ===============
  const sanitizeNumber = (value: any) => {
    if (value == null) return '0';
    return String(value).replace(/,/g, '');
  };

  // =============== SUBMIT ===============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill all required fields');
      return;
    }
    // Check Stripe is loaded
    if (!stripe || !elements) {
      toast.error('Payment system not loaded. Please refresh and try again.');
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found. Please refresh and try again.');
      return;
    }
    setIsProcessingPayment(true);
    try {
      // Step 1: Prepare booking payload
      const guestPayload = travellers.map((traveller: any, index: number) => ({
        traveller_type: index < adults ? 'adults' : 'child',
        title: traveller.title || 'Mr',
        first_name: traveller.firstName || '',
        last_name: traveller.lastName || '',
        nationality: parsedInvoice.nationality || '',
        age: '',
        dob_day: '',
        dob_month: '',
        dob_year: '',
      }));

      const roomPayload = room_data.map((r: any) => ({
        ...r,
        room_price_per_night: sanitizeNumber(r.room_price_per_night),
        room_actual_price_per_night: sanitizeNumber(r.room_actual_price_per_night),
        total_markup_price: sanitizeNumber(r.total_markup_price),
        total_actual_price: sanitizeNumber(r.total_actual_price),
        cc_fee: sanitizeNumber(r.cc_fee),
      }));

      const bookingPayload = {
        booking_ref_no: bookingReference,
        booking_date: parsedInvoice.booking_date,
        booking_status: 'pending',
        booking_nights: parsedInvoice.booking_nights,
        price_original: sanitizeNumber(parsedInvoice.price_original),
        price_markup: sanitizeNumber(parsedInvoice.price_markup),
        actual_price: sanitizeNumber(parsedInvoice.price_original),
        toptier_fee: '0',
        agent_fee: sanitizeNumber(parsedInvoice.agent_fee || '0'),
        vat: 0,
        tax: parsedInvoice.tax ? parsedInvoice.tax : "0",
        gst: 0,
        net_profit: sanitizeNumber(parsedInvoice.net_profit),
        subtotal: sanitizeNumber(parsedInvoice.subtotal),
        supplier_cost: sanitizeNumber(parsedInvoice.supplier_cost),
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        address: formData.address,
        phone_country_code: formData.phoneCountryCode,
        phone: formData.phoneNumber,
        country: parsedInvoice.country,
        nationality: parsedInvoice.nationality,
        stars: parsedInvoice.stars,
        hotel_id: parsedInvoice.hotel_id,
        hotel_name: parsedInvoice.hotel_name,
        hotel_phone: parsedInvoice.hotel_phone,
        hotel_email: parsedInvoice.hotel_email,
        hotel_website: parsedInvoice.hotel_website,
        hotel_address: parsedInvoice.hotel_address,
        hotel_img: parsedInvoice.hotel_img,
        location: parsedInvoice.location,
        location_cords: parsedInvoice.location_cords,
        room_data: roomPayload,
        checkin: parsedInvoice.checkin,
        checkout: parsedInvoice.checkout,
        adults,
        childs: children,
        child_ages: '',
        currency_original: parsedInvoice.currency_original,
        currency_markup: parsedInvoice.currency_markup,
        payment_date: '',
        payment_status: 'unpaid',
        payment_gateway: 'stripe',
        module_type: 'hotels',
        pnr: '',
        transaction_id: '',
        user_id: parsedInvoice.user_id,
        user_data: {
          user_id: user_data?.user_id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          email: formData.email,
          phone: formData.phoneNumber,
          nationality: parsedInvoice.nationality,
          country_code: parsedInvoice.nationality,
        },
        guest: guestPayload,
        card: {
          name: formData.cardName,
          number: '',
          expiry: '',
          cvv: '',
          zip: '',
        },
        supplier: parsedInvoice.supplier,
        supplier_id: parsedInvoice.supplier_id,
        supplier_payment_status: 'unpaid',
        supplier_due_date: parsedInvoice.supplier_due_date,
        agent_commission_status: 'pending',
        agent_payment_type: 'pending',
        agent_payment_status: 'pending',
        agent_id: parsedInvoice.agent_id,
        booking_note: '',
        cancellation_terms: '',
        cancellation_request: '0',
        cancellation_status: '0',
        cancellation_response: '',
        booking_data,
        booking_response: '',
        error_response: '',
        iata: '',
      };

      // Step 2: Create payment intent
      const paymentRes = await fetch('/api/paymentIntent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: sanitizeNumber(parsedInvoice.price_markup),
          currency: parsedInvoice.currency_markup,
          booking_ref_no: bookingReference,
          module_type: parsedInvoice.supplier,
          email: formData.email,
        }),
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const paymentData = await paymentRes.json();

      const { clientSecret, success_url } = paymentData;

      if (!clientSecret) {
        throw new Error('Payment client secret not received');
      }

      // Step 3: Confirm card payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.cardName,
            email: formData.email
          },
        },
      });

      if (result.error) {
        console.error(' Payment failed:', result.error);
        throw new Error(result.error.message || 'Payment failed');
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment did not succeed');
      }


      // Step 4: Create booking record
      const bookingResponse = await hotel_booking(bookingPayload as any);


      if (!bookingResponse || bookingResponse.error) {
        // Payment succeeded but booking failed - this needs manual intervention

        toast.warning('Payment processed but booking creation failed. Please contact support with reference: ' + bookingReference);
        // Still redirect to success page as payment was taken
        if (success_url) {
          router.replace(success_url);
        }
        return;
      }

      // Step 5: Success - redirect to success page
      toast.success('Booking confirmed successfully!');

      if (success_url) {
       window.location.href=success_url
      } else {
        router.push('/booking-success?ref=' + bookingReference);
      }

    } catch (error: any) {
      console.error(' Payment/Booking error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const getCountryByIso = (iso: string) => countryList.find((c) => c.iso === iso);

  const [isTitleOpen, setIsTitleOpen] = useState<number | null>(null);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titles = [
    dict?.bookingForm?.titles?.mr || 'Mr',
    dict?.bookingForm?.titles?.mrs || 'Mrs',
    dict?.bookingForm?.titles?.ms || 'Ms',
    dict?.bookingForm?.titles?.dr || 'Dr',
  ];
  const [isCountryListOpen, setIsCountryListOpen] = useState<boolean>(false);
  const [isPhoneCodeListOpen, setIsPhoneCodeListOpen] = useState<boolean>(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <div className="mb-12">
        <h3 className="text-xl text-[#0F172BE5] font-semibold mb-2">
          {dict?.bookingForm?.personalInformation?.title || 'Personal Information'}
        </h3>
        <p className="text-[#0F172B66] font-medium text-base mb-4">
          {dict?.bookingForm?.personalInformation?.subtitle || 'Enter your personal details'}
        </p>
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full max-w-2xl">
            <label htmlFor="firstName" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.personalInformation?.firstNameLabel || 'First Name'}
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div className="w-full max-w-2xl">
            <label htmlFor="lastName" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.personalInformation?.lastNameLabel || 'Last Name'}
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div className="w-full max-w-2xl">
            <label htmlFor="address" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.personalInformation?.addressLabel || 'Address'}
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleInputChange}
              className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="flex flex-col gap-3 mb-12">
        <h3 className="text-xl text-[#0F172BE5] font-semibold">
          {dict?.bookingForm?.contactInformation?.title || 'Contact Information'}
        </h3>
        <p className="text-[#0F172B66] text-base font-medium">
          {dict?.bookingForm?.contactInformation?.subtitle || 'Enter your contact details'}
        </p>
        <div className="w-full max-w-2xl">
          <label htmlFor="email" className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.contactInformation?.emailLabel || 'Email'}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="block border mb-4 border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div className="w-full max-w-2xl">
          <label className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.contactInformation?.nationalityLabel || 'Nationality'}
          </label>
          <div className="border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none bg-gray-100 cursor-not-allowed flex items-center gap-2">
            {getCountryByIso(formData.nationality) && (
              <Icon
                icon={`flagpack:${getCountryByIso(formData.nationality)?.iso.toLowerCase()}`}
                width="24"
                height="18"
              />
            )}
            <span>{getCountryByIso(formData.nationality)?.name || formData.nationality}</span>
          </div>
          {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
        </div>
        <div className="w-full max-w-2xl">
          <label className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.contactInformation?.currentCountryLabel || 'Current Country'}
          </label>
          <Select
            options={countryOptions}
            placeholder={dict?.bookingForm?.contactInformation?.currentCountryLabel || 'Current Country'}
            isSearchable
            value={countryOptions.find((opt) => opt.value === formData.currentCountry) || null}
            onChange={(option: any) => handleSelectChange('currentCountry', option?.value || '')}
            className="w-full"
            classNames={{
              control: () =>
                'border border-gray-300 cursor-pointer rounded-xl px-3 py-3.5 flex items-center min-h-[44px] text-base focus:ring-1 focus:ring-[#163C8C] focus:border-[#163C8C] shadow-none',
              valueContainer: () => 'flex items-center gap-2 px-1',
              singleValue: () => 'flex items-center gap-2 text-gray-800 font-medium truncate',
              placeholder: () => 'text-gray-400 font-normal',
              indicatorsContainer: () => (locale?.startsWith('ar') ? 'absolute left-4' : 'absolute right-4'),
            }}
            onMenuOpen={() => setIsCountryListOpen(true)}
            onMenuClose={() => setIsCountryListOpen(false)}
            components={{
              Option: ({ data, ...props }) => (
                <div
                  {...props.innerProps}
                  className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
                >
                  <Icon icon={`flagpack:${data.iso?.toLowerCase()}`} width="22" height="16" className="rounded-sm" />
                  <span>{data.label}</span>
                </div>
              ),
              SingleValue: ({ data }) => (
                <div className="flex items-center gap-2 truncate">
                  <Icon icon={`flagpack:${data.iso?.toLowerCase()}`} width="22" height="16" className="rounded-sm" />
                  <span>{data.label}</span>
                </div>
              ),
              DropdownIndicator: () => (
                <Icon
                  icon="mdi:keyboard-arrow-down"
                  width="24"
                  height="24"
                  className={`text-gray-600 transition duration-100 ease-in-out ${
                    isCountryListOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              ),
              IndicatorSeparator: () => null,
            }}
          />
          {errors.currentCountry && <p className="text-red-500 text-sm mt-1">{errors.currentCountry}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:max-w-42">
            <label className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.contactInformation?.phoneCodeLabel || 'Country Code'}
            </label>
            <Select
              options={phoneCodeOptions}
              placeholder={dict?.bookingForm?.contactInformation?.phoneCodeLabel || 'Code'}
              isSearchable
              value={phoneCodeOptions.find((opt) => opt.value === formData.phoneCountryCode) || null}
              onChange={(option: any) => handleSelectChange('phoneCountryCode', option?.value || '')}
              className="w-full"
              classNames={{
                control: () =>
                  'border border-gray-300 cursor-pointer rounded-xl px-3 py-3.5 flex items-center min-h-[44px] text-base focus:ring-1 focus:ring-[#163C8C] focus:border-[#163C8C] shadow-none',
                valueContainer: () => 'flex items-center gap-2 px-1',
                singleValue: () => 'flex items-center justify-between text-gray-800 font-medium',
                placeholder: () => 'text-gray-400 font-normal',
                indicatorsContainer: () => (locale?.startsWith('ar') ? 'absolute left-4' : 'absolute right-4'),
              }}
              onMenuOpen={() => setIsPhoneCodeListOpen(true)}
              onMenuClose={() => setIsPhoneCodeListOpen(false)}
              components={{
                Option: ({ data, ...props }) => (
                  <div
                    {...props.innerProps}
                    className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
                  >
                    <Icon icon={`flagpack:${data.iso?.toLowerCase()}`} width="22" height="16" className="rounded-sm" />
                    <span>+{data.phonecode}</span>
                  </div>
                ),
                SingleValue: ({ data }) => (
                  <div className="flex items-center justify-between gap-2 truncate">
                    <Icon icon={`flagpack:${data.iso?.toLowerCase()}`} width="22" height="16" className="rounded-sm" />
                    <span>+{data.phonecode}</span>
                  </div>
                ),
                DropdownIndicator: () => (
                  <Icon
                    icon="mdi:keyboard-arrow-down"
                    width="24"
                    height="24"
                    className={`text-gray-600 transition duration-100 ease-in-out ${
                      isPhoneCodeListOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                ),
                IndicatorSeparator: () => null,
              }}
            />
            {errors.phoneCountryCode && <p className="text-red-500 text-sm mt-1">{errors.phoneCountryCode}</p>}
          </div>
          <div className="w-full sm:max-w-122">
            <label htmlFor="phoneNumber" className="block text-base font-medium text-[#5B697E] mb-2">
              {dict?.bookingForm?.contactInformation?.phoneNumberLabel || 'Phone Number'}
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="block border border-gray-300 rounded-xl px-3 py-3.5 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>
        </div>
      </div>

      {/* Travelers Information */}
      <div className="flex flex-col gap-3 mb-12">
        <h3 className="text-xl text-[#0F172BE5] font-semibold">
          {dict?.bookingForm?.travelersInformation?.title || 'Travelers Information'}
        </h3>
        <p className="text-[#0F172B66] text-base font-medium mb-4">
          {dict?.bookingForm?.travelersInformation?.subtitle || 'Enter traveler details'}
        </p>


 {travellers.map((traveller:any, index:any) => (
          <div key={index} className="space-y-4 mb-3">
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
                  <>
                    <label className="block text-base font-medium text-[#5B697E] mb-2">
                      {dict?.bookingForm?.travelersInformation?.titleLabel}
                    </label>
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
                        {traveller.title || `Select ${dict?.bookingForm?.travelersInformation?.titleLabel}`}
                        <Icon
                          icon="material-symbols:keyboard-arrow-up"
                          width="24"
                          height="24"
                          className={`h-5 w-5 text-gray-500 transition-transform ${
                            isTitleOpen === index ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      </button>
                      {isTitleOpen === index && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow">
                          {titles.map((title, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                handleTravellerChange(index, 'title', title);
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
                    {errors[`travellers.${index}.title`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`travellers.${index}.title`]}</p>
                    )}
                  </>
                ) : (
                  <>
                    <label className="block text-base font-medium text-[#5B697E] mb-2">
                      {dict?.bookingForm?.travelersInformation?.ageLabel || 'Child Age'}
                    </label>
                    <input
                      type="text"
                      value={`N/A`}
                      disabled
                      className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </>
                )}
              </div>
              <div className="w-full">
                <label className="block text-base font-medium text-[#5B697E] mb-2">
                  {dict?.bookingForm?.personalInformation?.firstNameLabel}
                </label>
                <input
                  type="text"
                  value={traveller.firstName}
                  onChange={(e) => handleTravellerChange(index, 'firstName', e.target.value)}
                  className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
                />
                {errors[`travellers.${index}.firstName`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`travellers.${index}.firstName`]}</p>
                )}
              </div>
              <div className="w-full">
                <label className="block text-base font-medium text-[#5B697E] mb-2">
                  {dict?.bookingForm?.personalInformation?.lastNameLabel}
                </label>
                <input
                  type="text"
                  value={traveller.lastName}
                  onChange={(e) => handleTravellerChange(index, 'lastName', e.target.value)}
                  className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
                />
                {errors[`travellers.${index}.lastName`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`travellers.${index}.lastName`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card Information */}
      <div className="flex flex-col gap-3 mb-12">
        <h3 className="text-xl text-[#0F172BE5] font-semibold">
          {dict?.bookingForm?.paymentMethod?.cardInformationTitle}
        </h3>
        <div className="w-full max-w-2xl">
          <label className="block text-base font-medium text-[#5B697E] mb-2">
            {dict?.bookingForm?.paymentMethod?.cardholderNameLabel}
          </label>
          <input
            name="cardName"
            type="text"
            value={formData.cardName}
            onChange={handleInputChange}
            placeholder="John Doe"
            className="block border border-gray-300 rounded-xl px-3 py-4 text-base w-full outline-none focus:border-[#163C8C] focus:ring-1 focus:ring-[#163C8C]"
          />
          {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
        </div>
        <div className="w-full max-w-2xl">
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
        {parsedInvoice.cancellation_terms && (
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
                  dangerouslySetInnerHTML={{ __html: parsedInvoice.cancellation_terms }}
                />
              </div>
            </AccordionInfoCard>
          </>
        )}
        <label className="flex gap-2 items-start">
          <input
            type="checkbox"
            checked={formData.acceptPolicy}
            onChange={(e) => setFormData((prev) => ({ ...prev, acceptPolicy: e.target.checked }))}
            className="w-5 h-5 rounded border border-[#0F172B66] mt-0.5 focus:ring-[#163C8C] focus:border-[#163C8C]"
          />
          <span className="text-[#0F172B66] text-base font-medium">
            {dict?.bookingForm?.cancellationPolicy?.acceptText}{' '}
            <span className="text-[#163C8C] underline cursor-pointer hover:text-[#0f2d6b]">
              {dict?.bookingForm?.cancellationPolicy?.termsAndConditions}
            </span>
          </span>
        </label>
        {errors.acceptPolicy && <p className="text-red-500 text-sm mt-1">{errors.acceptPolicy}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessingPayment}
        className={`w-full text-lg text-white py-3 font-medium rounded-lg mt-5 transition-colors focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 ${
          isProcessingPayment
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#163C8C] hover:bg-[#0f2d6b] cursor-pointer focus:ring-[#163C8C]'
        }`}
      >
        {isProcessingPayment ? (
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
