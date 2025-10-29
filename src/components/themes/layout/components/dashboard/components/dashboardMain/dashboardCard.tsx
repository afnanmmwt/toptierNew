"use client";

import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";
import React, { useState } from "react";

// === Card data shape + mapper ===
type RoomItem = {
  room_name?: string;
  room_price?: string;
  room_qaunitity?: string;

  [k: string]: unknown;
};

type BookingCardData = {
  first_name?: string;
  last_name?: string;
  hotel_name?: string;
  checkin?: string;
  checkout?: string;
  hotel_address?: string;
  hotel_img?: string;
  hotel_email?: string;
  hotel_phone?: string;
  hotel_website?: string;
  location?: string;
  payment_status?: string;
  booking_status?: string;
  booking_id?: string;
  booking_ref_no?: string;
  pnr?: string;
  supplier?: string;
  service?: string;
  price_markup?: string;
  currency_markup?: string;
  booking_date?: string;
  email?: string;
  phone?: string;
  country?: string;
  adults: string;
  childs: string;
  booking_reference?: string;
  guest?: string | any[];

  // API sometimes returns this as a JSON string (array of rooms)
  room_data?: string | RoomItem[];
};

// Optional utility function (can be used in parent)
export const toCardData = (b: any): BookingCardData => ({
  first_name: b.first_name ?? "",
  last_name: b.last_name ?? "",
  hotel_name: b.hotel_name ?? "",
  checkin: b.checkin ?? "",
  checkout: b.checkout ?? "",
  hotel_address: b.hotel_address ?? "",
  hotel_img: b.hotel_img ?? "",
  hotel_email: b.hotel_email ?? "",
  hotel_phone: b.hotel_phone ?? "",
  hotel_website: b.hotel_website ?? "",
  location: b.location ?? "",
  payment_status: b.payment_status ?? "",
  booking_status: b.booking_status ?? "",
  booking_id: String(b.booking_id ?? ""),
  booking_ref_no: b.booking_ref_no ?? "",
  pnr: b.pnr ?? "",
  supplier: b.supplier ?? "",
  service: b.service ?? "",
  price_markup: String(b.price_markup ?? ""),
  currency_markup: b.currency_markup ?? "",
  booking_date: b.booking_date ?? "",
  email: b.email ?? "",
  phone: b.phone ?? "",
  country: b.country ?? "",
  adults: String(b.adults ?? ""),
  childs: String(b.childs ?? ""),
  room_data: b.room_data,
  guest: b.guest, // keep raw; we parse safely in the component
});
// ======================== CARD COMPONENT ========================
const DashboardCard = ({ data }: { data: BookingCardData }) => {
  const [open, setOpen] = useState(false);
  const ref = data?.booking_ref_no || data?.booking_id;
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  // Name display: if too long, show only first name (with truncate via CSS)
  const fullName = `${(data.first_name || "").trim()} ${(
    data.last_name || ""
  ).trim()}`.trim();
  const displayName =
    fullName.length > 20 ? (data.first_name || "").trim() : fullName;

  // Parse room_data safely (stringified JSON array or array)
  let roomInfo: RoomItem | null = null;
  try {
    if (typeof data.room_data === "string") {
      const arr = JSON.parse(data.room_data);
      if (Array.isArray(arr) && arr.length) roomInfo = arr[0] as RoomItem;
    } else if (Array.isArray(data.room_data) && data.room_data.length) {
      roomInfo = data.room_data[0];
    }
  } catch {
    roomInfo = null;
  }

  return (
    <div className="">
      {/* CARD */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
        style={{ height: "320px" }}
      // onClick={() => setOpen(true)}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {data.hotel_img ? (
            <img
              src={data.hotel_img}
              alt={data.hotel_name || "Hotel image"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              {dict?.dashboardCard?.noimage}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {data.booking_status}
          </span>
        </div>

        {/* Content with dark gradient at bottom (same design) */}
        <div className="absolute bg-gradient-to-b from-transparent via-black to-black bottom-0 left-0 right-0 px-5 py-3 text-white">
          <h2 className="text-2xl font-bold truncate">
            {data.hotel_name || "Unnamed Hotel"}
          </h2>
          <p className="text-sm text-gray-200">
            {data.checkin || "-"} – {data.checkout || "-"}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold block max-w-[140px] truncate">
              {displayName || "—"}
            </span>

            <button
              className="text-xs font-medium ml-1 px-2.5 py-1.5 border border-white/50 rounded-full bg-black/40 cursor-pointer hover:border-white/80 hover:text-black hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              {dict?.dashboardCard?.moredetails}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50"></div>

          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-[90%] max-h-[535px] md:max-h-[650px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            {data.hotel_img ? (
              <img
                src={data.hotel_img}
                alt={data.hotel_name || "Hotel image"}
                className="w-full h-40 md:h-56 object-cover"
              />
            ) : (
              <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">
                {dict?.dashboardCard?.noimage}
              </div>
            )}

            <div className="py-3 px-6">
              <div className="flex flex-col md:flex-row justify-between mt-1 md:mt-2 gap-0.5 md:gap-1">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {data.hotel_name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  <span className="font-medium">{dict?.dashboardCard?.supplier}</span>{" "}
                  {data.supplier?.toUpperCase?.() || "—"} (
                  {data.service?.toUpperCase?.() || "—"})
                </p>
              </div>

              <p className="text-gray-600 text-sm md:text-base">
                {data.location} - {data.hotel_address} - {data.country}
              </p>

              {/* Scrollable sections */}
              <div className="max-h-50 overflow-y-auto mt-4 space-y-4">
                {/* Booking Details */}
                <div>
                  <h1 className="text-xl font-semibold">{dict?.dashboardCard?.bookingdetails}</h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 py-2 px-4 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.bookingreference}</p>
                      <p className="text-sm font-semibold">
                        {data.booking_ref_no}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.bookingstatus}</p>
                      <p className="text-sm font-semibold">
                        {data.booking_status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.paymentstatus}</p>
                      <p className="text-sm font-semibold">
                        {data.payment_status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">PNR</p>
                      <p className="text-sm font-semibold">{data.pnr}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.checkin}</p>
                      <p className="text-sm font-semibold">{data.checkin}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.checkout}</p>
                      <p className="text-sm font-semibold">{data.checkout}</p>
                    </div>
                  </div>
                </div>

                {/* Guest Details */}
                <div>
                  <h1 className="text-xl font-semibold">{dict?.dashboardCard?.guestdetails}</h1>

                  {(() => {
                    let guests: any[] = [];

                    // Safe parse
                    try {
                      if (typeof data?.guest === "string") {
                        guests = JSON.parse(data.guest);
                      } else if (Array.isArray(data?.guest)) {
                        guests = data.guest;
                      }
                    } catch {
                      guests = [];
                    }

                    // Nothing to show
                    if (!guests.length) {
                      return (
                        <div className="mt-2 py-4 px-4 rounded-lg border border-gray-200 text-gray-500 text-sm">
                          {dict?.dashboardCard?.noguest}
                        </div>
                      );
                    }

                    // Normalize type
                    const norm = (v: unknown) =>
                      typeof v === "string" ? v.toLowerCase().trim() : "";

                    const isChild = (g: any) => {
                      const t = norm(
                        g?.traveller_type || g?.type || g?.category
                      );
                      return t === "child" || t === "kid" || t === "chd";
                    };

                    const isAdult = (g: any) => {
                      const t = norm(
                        g?.traveller_type || g?.type || g?.category
                      );
                      return (
                        t === "adult" ||
                        t === "adt" ||
                        t === "adl" ||
                        (!isChild(g) && t !== "")
                      );
                    };

                    // Get age for children (supports multiple field names)
                    const getAge = (g: any) => {
                      const raw =
                        g?.age ?? g?.child_age ?? g?.age_years ?? g?.Age;
                      const n = Number(raw);
                      return Number.isFinite(n) && n > 0 ? String(n) : "";
                    };

                    const adults = guests.filter(isAdult);
                    const children = guests.filter(isChild);

                    const NameCell = ({ guest }: { guest: any }) => (
                      <>
                        <p className="text-xs text-gray-500">{dict?.dashboardCard?.name}</p>
                        <p className="text-sm font-semibold">
                          {guest?.title ? `${guest.title} ` : ""}
                          {guest?.first_name ||
                            guest?.firstname ||
                            guest?.given_name ||
                            ""}{" "}
                          {guest?.last_name ||
                            guest?.lastname ||
                            guest?.family_name ||
                            ""}
                        </p>
                      </>
                    );

                    const TypeCell = ({ guest }: { guest: any }) => (
                      <>
                        <p className="text-xs text-gray-500">{dict?.dashboardCard?.type}</p>
                        <p className="text-sm font-semibold capitalize">
                          {guest?.traveller_type ||
                            guest?.type ||
                            guest?.category ||
                            "—"}
                        </p>
                      </>
                    );

                    return (
                      <div className="mt-2 space-y-6">
                        {/* Adults */}
                        {adults.length > 0 && (
                          <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 text-sm font-semibold">
                               {dict?.dashboardCard?.adults} ({adults.length})
                            </div>
                            <div className="divide-y divide-gray-100">
                              {adults.map((guest, i) => (
                                <div
                                  key={`adult-${i}`}
                                  className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 px-4 hover:bg-gray-50 transition"
                                >
                                  <div>
                                    <NameCell guest={guest} />
                                  </div>
                                  <div>
                                    <TypeCell guest={guest} />
                                  </div>
                                  {/* Extra cells reserved if you later want email/phone/passport etc. */}
                                  <div className="hidden md:block" />
                                  <div className="hidden md:block" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Children */}
                        {children.length > 0 && (
                          <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 text-sm font-semibold">
                               {dict?.dashboardCard?.childs} ({children.length})
                            </div>
                            <div className="divide-y divide-gray-100">
                              {children.map((guest, i) => {
                                const age = getAge(guest);
                                return (
                                  <div
                                    key={`child-${i}`}
                                    className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 px-4 hover:bg-gray-50 transition"
                                  >
                                    <div>
                                      <NameCell guest={guest} />
                                    </div>
                                    <div>
                                      <TypeCell guest={guest} />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        {dict?.dashboardCard?.age}
                                      </p>
                                      <p className="text-sm font-semibold">
                                        {age || "—"}
                                      </p>
                                    </div>
                                    <div className="hidden md:block" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* If some guests are neither adult nor child (weird data), show them raw */}
                        {adults.length + children.length < guests.length && (
                          <div className="rounded-lg border border-amber-200 overflow-hidden">
                            <div className="bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                              {dict?.dashboardCard?.otherguests} (
                              {guests.length - adults.length - children.length})
                            </div>
                            <div className="divide-y divide-gray-100">
                              {guests
                                .filter((g) => !isAdult(g) && !isChild(g))
                                .map((guest, i) => (
                                  <div
                                    key={`other-${i}`}
                                    className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 px-4 hover:bg-gray-50 transition"
                                  >
                                    <div>
                                      <NameCell guest={guest} />
                                    </div>
                                    <div>
                                      <TypeCell guest={guest} />
                                    </div>
                                    <div className="hidden md:block" />
                                    <div className="hidden md:block" />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Room Details */}
                <div>
                  <h1 className="text-xl font-semibold">{dict?.dashboardCard?.roomdetails}</h1>
                  <div className="grid  grid-cols-2 md:grid-cols-3 gap-3 mt-2 py-2 px-4 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.roomname}</p>
                      <p className="text-sm font-semibold">
                        {roomInfo?.room_name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.roomprice}</p>
                      <p className="text-sm font-semibold">
                        $
                        {roomInfo?.room_price
                          ? `${roomInfo.room_price} ${data.currency_markup}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.roomqaunitity}</p>
                      <p className="text-sm font-semibold">
                        {roomInfo?.room_qaunitity || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.adults}</p>
                      <p className="text-sm font-semibold">
                        {data?.adults || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{dict?.dashboardCard?.childs}</p>
                      <p className="text-sm font-semibold">
                        {data?.childs || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-1 md:mt-3 flex justify-between gap-3">
                <button
                  className="cursor-pointer px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-gray-950"
                  onClick={() => {
                    const ref =
                      data?.booking_ref_no ||
                      data?.booking_reference ||
                      data?.booking_id ||
                      "";

                    if (!ref) {
                      alert(dict?.dashboardCard?.invoicenotfound);
                      return;
                    }

                    const invoiceUrl = `https://toptier-tr-ef19.vercel.app/hotel/invoice/${ref}`;
                    window.location.href = invoiceUrl;
                  }}
                >
                  {dict?.dashboardCard?.invoice}
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  {dict?.dashboardCard?.close || "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardCard;
