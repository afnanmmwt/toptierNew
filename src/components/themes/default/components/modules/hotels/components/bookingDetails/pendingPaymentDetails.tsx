"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import StripeProvider from "@lib/stripeProvider";
import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";
import getCurrencySymbol from "@src/utils/getCurrencySymbals";
import PendingPaymentForm from "./pendingPyamentForm";

export default function PendingPaymentDetails({ invoiceData }: { invoiceData: any }) {
  const router = useRouter();
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  if (!invoiceData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No booking details found.
      </div>
    );
  }

  // ✅ Parse nested JSON fields safely
  const bookingData = (() => {
    try {
      return JSON.parse(invoiceData.booking_data || "{}");
    } catch {
      return {};
    }
  })();

  const roomData = (() => {
    try {
      return JSON.parse(invoiceData.room_data || "[]")[0];
    } catch {
      return {};
    }
  })();

  const userData = (() => {
    try {
      return JSON.parse(invoiceData.user_data || "{}");
    } catch {
      return {};
    }
  })();

  const guestList = (() => {
    try {
      return JSON.parse(invoiceData.guest || "[]");
    } catch {
      return [];
    }
  })();

  const {
    hotel_name,
    hotel_address,
    hotel_img,
    checkin,
    checkout,
    adults,
    childs,
    booking_nights,
    currency_original,
    price_markup,
    subtotal,
  } = invoiceData;

  const roomName = roomData?.room_name || "Standard Room";
  const roomPrice = roomData?.room_price_per_night || 0;
  const total = subtotal || price_markup;

  return (
    <section className="bg-[#F9FAFB] w-full">
      <div className="min-h-screen w-full max-w-[1200px] mx-auto justify-between flex flex-col md:flex-row lg:flex-row p-4 md:p-6 lg:p-12 mb-6 gap-8 appHorizantalSpacing">
        {/* Left Section — Form */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 cursor-pointer rounded-full bg-gray-50 border border-[#CACACA] flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <svg
                width="16"
                height="14"
                viewBox="0 0 16 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={locale === "ar" ? "rotate-180" : ""}
              >
                <path
                  d="M1 7L15 7M1 7L7 1M1 7L7 13"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="text-3xl font-extrabold text-[#0F172B]">
              {dict?.bookingDetails?.pageTitle || "Booking Details"}
            </h2>
          </div>

          <div className="border-b border-[#CACACA] mb-8"></div>

          <StripeProvider>
            <PendingPaymentForm  invoiceData={invoiceData}/>
          </StripeProvider>
        </div>

        {/* Right Section — Summary */}
        <div className="w-full sm:max-w-full md:max-w-95 lg:max-w-95 border border-[#CACACA] shadow rounded-xl p-5 h-fit">
          {/* Hotel Info */}
          <div className="flex gap-3 items-center mb-2">
            <Image
              src={
                hotel_img ||
                "https://toptiertravel.vip/uploads/7xd0llauy5gkwcgwk.jpg"
              }
              alt="Hotel"
              width={200}
              height={200}
              className="w-19 h-18 rounded-md object-cover"
            />
            <div>
              <h4 className="font-semibold text-[#0F172B] text-base">
                {hotel_name}
              </h4>
              <h3 className="font-semibold text-gray-500 text-xs">
                {hotel_address}
              </h3>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full max-w-xl space-y-4 text-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold text-[#0F172B]">
                {dict?.bookingDetails?.bookingSummary || "Booking Summary"}
              </h2>
              <span className="text-sm text-gray-500">{currency_original}</span>
            </div>

            <div className="space-y-3 text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {dict?.bookingDetails?.roomName || "Room"}
                </span>
                <span className="font-semibold text-[#0F172B]">{roomName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {dict?.bookingDetails?.checkinDate || "Check-in"}
                </span>
                <span className="font-semibold text-[#0F172B]">{checkin}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {dict?.bookingDetails?.checkoutDate || "Check-out"}
                </span>
                <span className="font-semibold text-[#0F172B]">{checkout}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {dict?.bookingDetails?.nights || "Nights"}
                </span>
                <span className="font-semibold text-[#0F172B]">
                  {booking_nights}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {dict?.bookingDetails?.guests || "Guests"}
                </span>
                <span className="font-semibold text-[#0F172B]">
                  {adults} {dict?.bookingDetails?.adults || "Adults"}
                  {childs > 0
                    ? `, ${childs} ${dict?.bookingDetails?.children || "Children"}`
                    : ""}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {dict?.bookingDetails?.roomPrice || "Room Price"}
                </span>
                <div className="flex items-center gap-1">
                  <span>{getCurrencySymbol(currency_original)}</span>
                  <span className="text-gray-900">
                    {Number(roomPrice).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-300 pt-3 mt-2">
                <span className="text-lg font-semibold text-[#0F172B]">
                  {dict?.bookingDetails?.total || "Total"}
                </span>
                <span className="text-lg font-bold text-[#163C8C]">
                  {getCurrencySymbol(currency_original)}{" "}
                  {Number(String(total).replace(/,/g, "")).toLocaleString(
                    "en-US",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
