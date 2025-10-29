"use client";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { hotel_details } from "@src/actions/server-actions";
import HotelDetailsSearch from "./hotelDetailsSearch";
import SwiperImageSlider from "./imageSlider";
import { Icon } from "@iconify/react";
import { RoomCard } from "./roomCard";
// import RoomOption from "./roomOption";
import { AccordionInfoCard } from "@components/core/accordians/accordian";
import { useAppSelector } from "@lib/redux/store";
import { Skeleton } from "@components/core/skeleton";
import HotelSuggestionSlider from "./hotelSuggestionSlider";
import { useHotelDetails } from "@hooks/useHotelDetails";
import Spinner from "@components/core/Spinner";
import useLocale from "@hooks/useLocale";
import useDictionary from "@hooks/useDict";
import { useUser } from "@hooks/use-user";

const HotelsDetails = () => {
  const params = useParams();
  const router = useRouter();

  const { country, currency, locale: language } = useAppSelector((state) => state.root);
  const { user } = useUser();
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  // Extract URL params
  const slugArr = (params?.slug as string[]) || [];
  const hotel_id = slugArr[0] || "";
  const initialCheckin = slugArr[2] || "";
  const initialCheckout = slugArr[3] || "";
  const initialRooms = Number(slugArr[4]) || 1;
  const initialAdults = Number(slugArr[5]) || 2;
  const initialChildren = Number(slugArr[6]) || 0;
  const initialNationality = slugArr[7] || "US";

  // ✅ Always define states before any return
  const [searchParams, setSearchParams] = useState({
    checkin: initialCheckin,
    checkout: initialCheckout,
    rooms: initialRooms,
    adults: initialAdults,
    children: initialChildren,
    nationality: initialNationality,
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const textRef = useRef<HTMLDivElement>(null);

  const savedForm = typeof window !== "undefined" ? localStorage.getItem("hotelSearchForm") : null;
  const parsedForm = savedForm ? JSON.parse(savedForm) : null;

  const savedHotel = typeof window !== "undefined" ? localStorage.getItem("currentHotel") : null;
  const parsedHotel = savedHotel ? JSON.parse(savedHotel) : null;
  const supplier_name = parsedHotel?.supplier_name || "";

  // ✅ Hooks must not be conditional
  const {
    form,
    errors,
    showGuestsDropdown,
    isSearching,
    totalGuests,
    guestsDropdownRef,
    handleChange,
    updateForm,
    toggleGuestsDropdown,
    onSubmit: handleSearchSubmit,
    handleReserveRoom,
  } = useHotelDetails({
    initialCheckin,
    initialCheckout,
    initialNationality,
    onSearchRefetch: (newForm: any) => {
      const newParams = {
        checkin: newForm.checkin,
        checkout: newForm.checkout,
        rooms: newForm.rooms,
        adults: newForm.adults,
        children: newForm.children,
        nationality: newForm.nationality,
      };
      setSearchParams(newParams);
      if (hotelDetails?.name) updateUrl(newParams, hotelDetails.name);
    },
  });

  const updateUrl = useCallback(
    (params: typeof searchParams, hotelName: string) => {
      const slugName = hotelName.toLowerCase().replace(/\s+/g, "-");
      const newUrl = `/hotelDetails/${hotel_id}/${slugName}/${params.checkin}/${params.checkout}/${params.rooms}/${params.adults}/${params.children}/${params.nationality}`;
      router.replace(newUrl);
    },
    [hotel_id, router]
  );

  const { data: hotelDetails, isLoading } = useQuery({
    queryKey: ["hotel-details", { hotel_id, ...searchParams }],
    queryFn: () =>
      hotel_details({
        hotel_id,
        checkin: searchParams.checkin,
        checkout: searchParams.checkout,
        rooms: searchParams.rooms,
        adults: searchParams.adults,
        childs: searchParams.children,
        child_age: parsedForm?.children_ages || [],
        nationality: searchParams.nationality,
        language: language,
        currency: currency,
        supplier_name,
      }),
    enabled: !!hotel_id,
    staleTime: 0,
  });

  useEffect(() => {
    if (textRef.current && hotelDetails?.desc) {
      const { scrollHeight, clientHeight } = textRef.current;
      setIsClamped(scrollHeight > clientHeight);
    }
  }, [hotelDetails?.desc]);

  const { featured_hotels } = useAppSelector((state) => state.appData?.data);

  const getAmenityIcon = (amenity: string): string => {
    const icons: Record<string, string> = {
      pool: "mdi:pool",
      fitness: "mdi:dumbbell",
      gym: "mdi:dumbbell",
      spa: "mdi:spa",
      restaurant: "mdi:silverware-fork-knife",
      bar: "mdi:glass-cocktail",
      wifi: "mdi:wifi",
      tv: "mdi:television-classic",
      aircondition: "mdi:air-conditioner",
      "air conditioning": "mdi:air-conditioner",
      shuttle: "mdi:bus",
      airport: "mdi:airplane",
      smoke: "mdi:smoke-detector-off",
      coffee: "mdi:coffee",
      beach: "mdi:beach",
      breakfast: "mdi:food-croissant",
      room: "mdi:bed",
      hair: "mdi:hair-dryer",
      luxury: "mdi:crown",
      dinner: "mdi:food-steak",
      booking: "mdi:calendar-check",
      board: "mdi:clipboard-list",
    };
    const lower = amenity.toLowerCase();
    for (const key in icons) {
      if (lower.includes(key)) return icons[key];
    }
    return "mdi:check-circle-outline";
  };

  const handleSuggestionClick = (hotel: any) => {
    const { checkin, checkout, rooms, adults, children, nationality } = searchParams;
    const hotelNameSlug = hotel.name.toLowerCase().replace(/\s+/g, "-");

    const newUrl = `/hotelDetails/${hotel.id}/${hotelNameSlug}/${checkin}/${checkout}/${rooms}/${adults}/${children}/${nationality}`;

    localStorage.setItem(
      "currentHotel",
      JSON.stringify({
        hotel_id: hotel.id,
        name: hotel.name,
        supplier_name: hotel.supplier_name || supplier_name,
        module: "hotels",
        checkin,
        checkout,
        rooms,
        adults,
        children,
        nationality,
      })
    );

    router.push(newUrl);
  };

  if (!parsedHotel) return null;

  return (
    <div>
      <HotelDetailsSearch
        form={form}
        errors={errors}
        showGuestsDropdown={showGuestsDropdown}
        isSearching={isSearching}
        totalGuests={totalGuests}
        guestsDropdownRef={guestsDropdownRef}
        handleChange={handleChange}
        updateForm={updateForm}
        toggleGuestsDropdown={toggleGuestsDropdown}
        onSubmit={handleSearchSubmit}
      />

      {/* Image Slider */}
      {isLoading ? (
        <div className="max-w-[1200px] mx-auto flex items-center justify-center min-h-90 bg-gray-200 px-4 md:px-8 lg:px-14 mt-10">
          <Spinner />
        </div>
      ) : (
        <SwiperImageSlider testimonials={hotelDetails?.img} />
      )}

      {/* Description */}
      <section className="py-4 max-w-[1200px] mx-auto">
        {isLoading ? (
          <Skeleton variant="rect" width="100%" height={200} />
        ) : (
          <div className="grid grid-cols-12">
            {hotelDetails?.desc && (
              <div className="lg:col-span-8 col-span-12 flex flex-col gap-2 pe-4">
                <h1 className="text-2xl font-[800]">{hotelDetails?.name}</h1>
                <p className="text-md text-[#9297A0] md:hidden block">{hotelDetails?.address}</p>

                {/* Description with toggle */}
                <div ref={textRef} className="relative">
                  {!isExpanded ? (
                    <div className="text-gray-700 leading-6 mb-2">
                      {hotelDetails.desc.slice(0, 300)}...
                      <button
                        onClick={() => setIsExpanded(true)}
                        className="text-blue-600 underline hover:text-blue-800 font-medium text-sm pl-4"
                      >
                        {dict?.hotelDetails?.readMore}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="text-gray-700 leading-6 mb-2"
                        dangerouslySetInnerHTML={{ __html: hotelDetails.desc }}
                      />
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="text-blue-600 underline hover:text-blue-800 font-medium text-sm mt-2"
                      >
                        {dict?.hotelDetails?.readLess}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Suggestions */}
      <HotelSuggestionSlider hotels={featured_hotels} onHotelClick={handleSuggestionClick} />
    </div>
  );
};

export default HotelsDetails;
