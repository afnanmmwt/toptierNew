"use client";
import React, { useCallback, useState, useRef, useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { hotel_details } from "@src/actions/server-actions";
import HotelDetailsSearch from "./hotelDetailsSearch";
import SwiperImageSlider from "./imageSlider";
import { Icon } from "@iconify/react";
import { RoomCard } from "./roomCard";
import RoomOption from "./roomOption";
// import BrandStories from "./brandStories";
import { AccordionInfoCard } from "@components/core/accordians/accordian";
import { useAppSelector } from "@lib/redux/store";
// import { HotelListingCard } from "../hotelsListing";
import { Skeleton } from "@components/core/skeleton";

import HotelSuggestionSlider from "./hotelSuggestionSlider";
import { useHotelDetails } from "@hooks/useHotelDetails";
import Spinner from "@components/core/Spinner";
import useLocale from "@hooks/useLocale";
import useDictionary from "@hooks/useDict";

const HotelsDetails = () => {
  const params = useParams();
  const router = useRouter();
  const {country, currency, locale:language}=useAppSelector((state)=>state.root)

  const slugArr = (params?.slug as string[]) || [];
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);
  // State for query params (used by useQuery)
  const initialCheckin = slugArr[2] || "";
  const initialCheckout = slugArr[3] || "";
  const initialRooms = Number(slugArr[4]) || 1;
  const initialAdults = Number(slugArr[5]) || 2;
  const initialChildren = Number(slugArr[6]) || 0;
  const initialNationality = slugArr[7] || "US";
  const hotel_id = slugArr[0] || "";
  const [searchParams, setSearchParams] = useState({
    checkin: initialCheckin,
    checkout: initialCheckout,
    rooms: initialRooms,
    adults: initialAdults,
    children: initialChildren,
    nationality: initialNationality,
  });
 const savedForm = localStorage.getItem("hotelSearchForm");
        if (!savedForm) return;
        const parsedForm: any = JSON.parse(savedForm);
  // Helper to update URL
  const updateUrl = useCallback((params: typeof searchParams, hotelName: string) => {
    const slugName = hotelName.toLowerCase().replace(/\s+/g, "-");
    const newUrl = `/hotelDetails/${hotel_id}/${slugName}/${params.checkin}/${params.checkout}/${params.rooms}/${params.adults}/${params.children}/${params.nationality}`;
    router.replace(newUrl);
  }, [hotel_id, router]);

  // Use your hook with refetch mode
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
      if (hotelDetails?.name) {
        updateUrl(newParams, hotelDetails.name);
      }
    },
  });


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
        child_age: parsedForm.children_ages || [],
        nationality: searchParams.nationality,
        language: language,
        currency: currency,
        supplier_name: supplier_name, // Now using URL-derived value
      }),
    enabled: !!hotel_id,
    staleTime: 0,
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { img } = hotelDetails || {};

  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
console.log('hotel details',hotelDetails)
  useEffect(() => {
    if (textRef.current && hotelDetails?.desc) {
      const { scrollHeight, clientHeight } = textRef.current;
      setIsClamped(scrollHeight > clientHeight);
    }
  }, [hotelDetails?.desc]);
  const { featured_hotels } = useAppSelector((state) => state.appData?.data);

  // Extract from URL
  // const supplier_name = slugArr[8] || "";
  const savedhotel = localStorage.getItem("currentHotel");
  if (!savedhotel) return null;

  const parsedHotel: any = JSON.parse(savedhotel);
  const { supplier_name } = parsedHotel;
  // Get initial values from URL or fallback


 const amenityIcons: Record<string, string> = {
  pool: "mdi:pool",
  swimming: "mdi:pool",
  fitness: "mdi:dumbbell",
  gym: "mdi:dumbbell",
  spa: "mdi:spa",
  restaurant: "mdi:silverware-fork-knife",
  bar: "mdi:glass-cocktail",
  wifi: "mdi:wifi", // already present
  tv: "mdi:television-classic", // ✅ added
  aircondition: "mdi:air-conditioner", // ✅ added (use lowercase + no space)
  "air conditioning": "mdi:air-conditioner", // optional: handle this variation too

  shuttle: "mdi:bus",
  airport: "mdi:airplane",
  non: "mdi:smoke-detector-off",
  smoke: "mdi:smoke-detector-off",
  coffee: "mdi:coffee",
  tea: "mdi:coffee",
  beach: "mdi:beach",
  breakfast: "mdi:food-croissant",
  room: "mdi:bed",
  hair: "mdi:hair-dryer",
  luxury: "mdi:crown",
  dinner: "mdi:food-steak",
  booking: "mdi:calendar-check",
  board: "mdi:clipboard-list",
};


  const getAmenityIcon = (amenity: string): string => {
    const lower = amenity.toLowerCase();
    for (const key in amenityIcons) {
      if (lower.includes(key)) {
        return amenityIcons[key];
      }
    }
    return "mdi:check-circle-outline";
  };

  const htmlToPlainText = (html: string): string => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };
  // Add this function to your HotelsDetails component

  const handleSuggestionClick = (hotel: any) => {
    // Get current search parameters from state
    const { checkin, checkout, rooms, adults, children, nationality } = searchParams;

    // Generate URL-friendly hotel name slug
    const hotelNameSlug = hotel.name.toLowerCase().replace(/\s+/g, "-");

    // Construct new URL with updated hotel ID and name, but same search params
    const newUrl = `/hotelDetails/${hotel.id}/${hotelNameSlug}/${checkin}/${checkout}/${rooms}/${adults}/${children}/${nationality}`;

    // Save hotel info to localStorage for supplier_name
    const hotelData = {
      hotel_id: hotel.id,
      name: hotel.name,
      supplier_name: hotel.supplier_name || supplier_name, // Use existing supplier_name if not provided
      module: "hotels", // Static module
      checkin,
      checkout,
      rooms,
      adults,
      children,
      nationality
    };

    localStorage.setItem("currentHotel", JSON.stringify(hotelData));

    // Navigate to new hotel details page
    router.push(newUrl);
  };





// Update your HotelSuggestionSlider component call to pass the handler:
// <HotelSuggestionSlider hotels={featured_hotels} onHotelClick={handleSuggestionClick} />

  const getFaqIcon = (question: string) => {
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes("check-in") || lowerQ.includes("check out")) return "mdi:calendar-outline";
    if (lowerQ.includes("location") || lowerQ.includes("parking")) return "mdi:map-marker-outline";
    if (lowerQ.includes("wi-fi") || lowerQ.includes("wifi")) return "mdi:wifi";
    if (lowerQ.includes("spa") || lowerQ.includes("fitness")) return "mdi:dumbbell";
    if (lowerQ.includes("pet")) return "mdi:dog";
    if (lowerQ.includes("cancellation")) return "mdi:cancel";
    if (lowerQ.includes("breakfast") || lowerQ.includes("food")) return "mdi:silverware-fork-knife";
    return "mdi:check-circle-outline";
  };


  return (
    <div>
      {/* <RoomOption/> */}

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
        <SwiperImageSlider testimonials={img} />
      )}

      {/* Description & Amenities Section */}
      <section className="manor&spa py-4 max-w-[1200px] mx-auto appHorizantalSpacing">
        {isLoading ? (
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column - Description Skeleton */}
            <div className="lg:col-span-8 col-span-12 ">
              <h1 className="text-[22px] font-[700] mb-3">{dict?.hotelDetails?.hotelNamePlaceholder}</h1>
              <Skeleton variant="text" width="70%" height={20} className="mb-1" />
              <Skeleton variant="text" width="90%" height={24} className="mb-4" />
              <Skeleton variant="text" width="90%" height={24} className="mb-4" />
              <Skeleton variant="text" width="90%" height={24} className="mb-4" />
              <Skeleton variant="rect" width={24} height={24} className="mb-4 rounded" />
              <div className="flex md:gap-3 gap-1 mt-2">
                <Skeleton variant="button" width={112} height={32} />
                <Skeleton variant="button" width={144} height={32} />
                <Skeleton variant="button" width={160} height={32} />
              </div>
            </div>

            {/* Right Column - Amenities Skeleton */}
            <div className="lg:col-span-4 col-span-12 lg:mt-0 mt-6">
              <h1 className="text-[22px] font-[700] mb-3">{dict?.hotelDetails?.aboutThisProperty}</h1>
              <Skeleton variant="text" width="50%" height={28} className="mb-4" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 mt-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton variant="circle" width={40} height={40} />
                    <Skeleton variant="text" width="70%" height={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : hotelDetails ? (
          <div className="grid grid-cols-12">
            {/* Left Column: Only show if desc exists */}
            {hotelDetails?.desc && hotelDetails.desc.trim() !== "" && (
              <div className="lg:col-span-8 col-span-12 flex flex-col gap-2 lg:pe-4">
                <h1 className="text-2xl font-[800]">{hotelDetails?.name}</h1>
                <p className="text-md font-[500] text-[#9297A0] md:hidden block">{hotelDetails?.address}</p>
                <div className="flex items-center pb-1">
                  <div className="flex items-center pt-1">
                    {Array.from({
                      length: Math.min(5, Math.floor(Number(hotelDetails?.stars) || 0))
                    }).map((_, i) => (
                      <svg
                        key={i}
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="#FFD700"
                        xmlns="http://www.w3.org/2000/svg"
                        className="pl-0.5 first:pl-0"
                      >
                        <path d="M7 0l2.236 4.894L14 5.528l-3.382 3.578L11.472 14 7 11.618 2.528 14l.854-4.894L0 5.528 4.764 4.894 7 0z" />
                      </svg>
                    ))}

                    {hotelDetails?.stars > 0 && hotelDetails?.address && (
                      <span className="pl-2">
                        <svg width="7" height="7" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="3.07317" cy="3.98436" r="3.07317" fill="#4F5E74" />
                        </svg>
                      </span>
                    )}

                    <span className="text-md pl-2 font-[500] text-[#9297A0] line-clamp-2 lg:line-clamp-1" title={hotelDetails?.address}>
                      {hotelDetails?.address}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  {!isExpanded ? (
                    <div className="text-gray-700 text-base md:text-lg leading-6 md:leading-8 mb-2 md:mb-0">
                      {(() => {
                        const desc = hotelDetails?.desc || "";
                        const temp = document.createElement("div");
                        temp.innerHTML = desc;
                        const plainText = temp.textContent || temp.innerText || "";
                        const words = plainText.split(" ");
                        const truncatedWords = words.slice(0, 55).join(" ");
                        return (
                          <span>
                            <span dangerouslySetInnerHTML={{ __html: truncatedWords }} />
                            {" "}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(true);
                              }}
                              className="text-blue-600 cursor-pointer underline hover:text-blue-800 font-medium text-sm md:text-base pl-4"
                            >
                              {dict?.hotelDetails?.readMore}
                            </button>
                          </span>
                        );
                      })()}
                    </div>
                  ) : (
                    <>
                      <div
                        className="text-gray-700 text-base md:text-lg leading-6 md:leading-8 mb-2 md:mb-0"
                        dangerouslySetInnerHTML={{ __html: hotelDetails?.desc || "" }}
                      />
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="text-blue-600 cursor-pointer underline hover:text-blue-800 font-medium text-sm md:text-base mt-2"
                      >
                        {dict?.hotelDetails?.readLess}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex md:gap-3 gap-1 mt-8">
                  <div className="flex gap-1 py-1 bg-[#DBFCE7] rounded-[7.45px] md:px-3 px-1 items-center">
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_358_1918)">
                        <path d="M11.4629 10.1147L12.5361 16.154C12.5481 16.2251 12.5381 16.2982 12.5075 16.3635C12.4768 16.4288 12.427 16.4832 12.3646 16.5194C12.3022 16.5555 12.2303 16.5718 12.1584 16.566C12.0865 16.5602 12.0181 16.5326 11.9623 16.4869L9.42648 14.5836C9.30407 14.4922 9.15536 14.4427 9.00255 14.4427C8.84974 14.4427 8.70103 14.4922 8.57861 14.5836L6.03853 16.4862C5.98279 16.5318 5.91447 16.5594 5.84267 16.5652C5.77087 16.571 5.699 16.5548 5.63666 16.5187C5.57432 16.4826 5.52447 16.4284 5.49376 16.3632C5.46305 16.298 5.45294 16.2251 5.46478 16.154L6.53719 10.1147" stroke="#246630" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 10.9011C11.3472 10.9011 13.25 8.99833 13.25 6.65112C13.25 4.30391 11.3472 2.40112 9 2.40112C6.65279 2.40112 4.75 4.30391 4.75 6.65112C4.75 8.99833 6.65279 10.9011 9 10.9011Z" stroke="#246630" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_358_1918">
                          <rect width="17" height="17" fill="white" transform="translate(0.5 0.984375)" />
                        </clipPath>
                      </defs>
                    </svg>
                    <p className="text-sm font-[600] text-[#246630] text-ellipsis">{dict?.hotelDetails?.topRated}</p>
                  </div>
                  <div className="flex gap-1 py-1 bg-[#DBEAFE] rounded-[7.45px] md:px-3 px-1 items-center">
                    <svg width="17" height="17" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_358_1924)">
                        <path d="M2.72734 7.0902C2.62395 6.62449 2.63983 6.14021 2.77349 5.68227C2.90716 5.22433 3.15429 4.80755 3.49197 4.47058C3.82964 4.13361 4.24694 3.88736 4.70516 3.75465C5.16337 3.62194 5.64768 3.60708 6.11318 3.71145C6.36939 3.31074 6.72234 2.98098 7.13952 2.75257C7.55669 2.52415 8.02465 2.40442 8.50026 2.40442C8.97587 2.40442 9.44383 2.52415 9.861 2.75257C10.2782 2.98098 10.6311 3.31074 10.8873 3.71145C11.3535 3.60663 11.8387 3.62142 12.2976 3.75445C12.7566 3.88748 13.1744 4.13442 13.5123 4.4723C13.8502 4.81019 14.0971 5.22804 14.2302 5.68699C14.3632 6.14594 14.378 6.63108 14.2732 7.09728C14.6739 7.35349 15.0036 7.70645 15.2321 8.12362C15.4605 8.54079 15.5802 9.00875 15.5802 9.48436C15.5802 9.95997 15.4605 10.4279 15.2321 10.8451C15.0036 11.2623 14.6739 11.6152 14.2732 11.8714C14.3775 12.3369 14.3627 12.8212 14.23 13.2795C14.0973 13.7377 13.851 14.155 13.514 14.4927C13.1771 14.8303 12.7603 15.0775 12.3024 15.2111C11.8444 15.3448 11.3601 15.3607 10.8944 15.2573C10.6385 15.6595 10.2853 15.9907 9.86743 16.2201C9.44955 16.4496 8.98053 16.5699 8.5038 16.5699C8.02707 16.5699 7.55805 16.4496 7.14017 16.2201C6.72229 15.9907 6.36905 15.6595 6.11318 15.2573C5.64768 15.3616 5.16337 15.3468 4.70516 15.2141C4.24694 15.0814 3.82964 14.8351 3.49197 14.4981C3.15429 14.1612 2.90716 13.7444 2.77349 13.2865C2.63983 12.8285 2.62395 12.3442 2.72734 11.8785C2.32356 11.623 1.99097 11.2695 1.7605 10.8509C1.53003 10.4323 1.40918 9.96221 1.40918 9.48436C1.40918 9.00652 1.53003 8.53643 1.7605 8.11784C1.99097 7.69924 2.32356 7.34573 2.72734 7.0902Z" stroke="#193CB8" strokeWidth="1.41667" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.375 9.48442L7.79167 10.9011L10.625 8.06775" stroke="#193CB8" strokeWidth="1.41667" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_358_1924">
                          <rect width="17" height="17" fill="white" transform="translate(0 0.984375)" />
                        </clipPath>
                      </defs>
                    </svg>
                    <p className="text-[13px] font-[600] text-[#193CB8]">{dict?.hotelDetails?.freeCancellation}</p>
                  </div>
                  <div className="flex gap-1 py-1 bg-[#F3E8FF] rounded-[7.45px] md:px-3 px-1 items-center">
                    <svg width="17" height="17" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_358_1930)">
                        <path d="M14.1668 10.1927C14.1668 13.7344 11.6877 15.5052 8.741 16.5323C8.58669 16.5846 8.41909 16.5821 8.26641 16.5252C5.31266 15.5052 2.8335 13.7344 2.8335 10.1927V5.23441C2.8335 5.04655 2.90812 4.86638 3.04096 4.73354C3.1738 4.6007 3.35397 4.52608 3.54183 4.52608C4.9585 4.52608 6.72933 3.67608 7.96183 2.59941C8.11189 2.4712 8.30279 2.40076 8.50016 2.40076C8.69754 2.40076 8.88843 2.4712 9.0385 2.59941C10.2781 3.68316 12.0418 4.52608 13.4585 4.52608C13.6464 4.52608 13.8265 4.6007 13.9594 4.73354C14.0922 4.86638 14.1668 5.04655 14.1668 5.23441V10.1927Z" stroke="#6E11B0" strokeWidth="1.41667" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.375 9.48442L7.79167 10.9011L10.625 8.06775" stroke="#6E11B0" strokeWidth="1.41667" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_358_1930">
                          <rect width="17" height="17" fill="white" transform="translate(0 0.984375)" />
                        </clipPath>
                      </defs>
                    </svg>
                    <p className="text-[13px] font-[600] text-[#6E11B0]">{dict?.hotelDetails?.bestPriceGuarantee}</p>
                  </div>
                </div>
              </div>
            )}


            {/* Right Column: Amenities — show if hotelDetails exists (even if amenities are missing) */}
       {hotelDetails && (
  <div className="lg:col-span-4 col-span-12 lg:mt-0 mt-6 pl-8">
    <h1 className="text-[22px] font-[700]">{dict?.hotelDetails?.aboutThisProperty}</h1>

    {(() => {
      const defaultAmenities = ["Free Wi-Fi", "Room Cleaning"];

      // ✅ Filter out empty or whitespace-only strings
      const validAmenities = Array.isArray(hotelDetails.amenities)
        ? hotelDetails.amenities.filter((item:any) => item && item.trim() !== '')
        : [];

      const amenitiesToShow = validAmenities.length > 0
        ? validAmenities.slice(0, 4)
        : defaultAmenities;

      return (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 mt-4">
          {amenitiesToShow.map((amenity: string, idx: number) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="min-w-10 min-h-10 flex items-center justify-center rounded-lg bg-green-100 flex-shrink-0">
                <Icon
                  icon={getAmenityIcon(amenity)}
                  className="text-gray-700"
                  width={20}
                  height={20}
                />

              </div>
              <p className="text-base font-[500] text-gray-700 break-words pt-2">
                {amenity}
              </p>
            </div>
          ))}
        </div>
      );
    })()}

    {/* ✅ Show "Show More" only if real, valid amenities > 4 */}
    {Array.isArray(hotelDetails.amenities) &&
      hotelDetails.amenities.filter((item:any) => item && item.trim() !== '').length > 4 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#163C8C] text-lg cursor-pointer rounded-full py-1.5 px-4 w-full max-w-xs mx-auto font-medium font-urbanist border border-[#163C8C] hover:bg-[#163C8C] hover:text-white transition-colors"
          >
            {dict?.hotelDetails?.showMore}
          </button>
        </div>
      )}
  </div>
)}

          </div>
        ) : (
          <div className="col-span-full text-center py-12">
            <Icon icon="mdi:hotel-remove" className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">{dict?.hotelDetails?.unableToLoad}</h3>
            <p className="text-gray-500 mt-1">{dict?.hotelDetails?.pleaseTryAgain}</p>
          </div>
        )}
      </section>

      {/* Rooms Section */}
      <section className="choose-your-room py-4 max-w-[1200px] mx-auto appHorizantalSpacing">
        {/* Show heading only when rooms data is available */}
        {hotelDetails?.rooms && hotelDetails.rooms.length > 0 && (
          <h1 className="text-2xl font-[700] my-4">{dict?.hotelDetails?.chooseYourRoom}</h1>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-300 rounded-xl p-4 min-h-60">
                <Skeleton variant="rect" height={192} className="w-full rounded mb-3" />
                <Skeleton variant="text" width="75%" height={24} className="mb-2" />
                <Skeleton variant="text" width="100%" height={16} className="mb-1" />
                <Skeleton variant="text" width="60%" height={16} />
              </div>
            ))}
          </div>
        ) : hotelDetails?.rooms && hotelDetails.rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotelDetails.rooms.map((room: any, index: number) => (
              <RoomCard

                key={index}

                room={room}
                options={""}
                getAmenityIcon={getAmenityIcon}
                onReserve={(room, option) => {
                  handleReserveRoom(room, option, hotelDetails);
                  router.push(`/hotel/booking`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon icon="mdi:bed-empty" className="text-5xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{dict?.hotelDetails?.noRoomsAvailable}</p>
          </div>
        )}
      </section>
      {/* Brand Stories — ONLY if data exists */}
      {hotelDetails?.brand_stories?.length > 0 && (
        <section className="way-to-travel my-10 max-w-[1200px] mx-auto appHorizantalSpacing">
          <h1 className="font-[700] text-2xl my-6">{dict?.hotelDetails?.theToptierWayToTravel}</h1>
          <div className="grid grid-cols-12 gap-5">
            {hotelDetails.brand_stories.map((story: any, index: number) => (
              <div key={index} className="lg:col-span-3 md:col-span-6 col-span-12 flex flex-col gap-3">
                <img
                  className="h-32 rounded-sm object-cover"
                  src={story.picture || "/images/auth_bg.jpg"}
                  alt=""
                />
                <p
                  className="font-[500] text-lg text-[#0F172B] line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: story.desc_text || "" }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hotel FAQs — ONLY if data exists */}
      {hotelDetails?.faqs?.some((f: any) => f.category === "hotel_faqs") && (
        <section className="py-4 max-w-[1200px] mx-auto appHorizantalSpacing mb-10">
          <h1 className="text-2xl font-[700] my-4 mb-5">{dict?.hotelDetails?.needToKnowDetails}</h1>
          <div className="space-y-4">
            {hotelDetails.faqs
              .filter((faq: any) => faq.category === "hotel_faqs")
              .map((faq: any) => (
                <AccordionInfoCard
                  key={faq.id}
                  title={faq.question}
                  description={htmlToPlainText(faq.answer)}
                  leftIcon={getFaqIcon(faq.question)}
                  showDescription={true}
                >
                  <div
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{ __html: faq.answer || "No details available." }}
                  />
                </AccordionInfoCard>
              ))}
          </div>
        </section>
      )}

      {/* Suggested Hotels — ONLY if featured_hotels has data */}
      {Array.isArray(featured_hotels) && featured_hotels.length > 0 && (
        <HotelSuggestionSlider hotels={featured_hotels} onHotelClick={handleSuggestionClick}
        />
      )}

      {/* General FAQs — ONLY if data exists */}
      {hotelDetails?.faqs?.some((f: any) => f.category === "faqs") && (
        <section className="py-4 max-w-[1200px] mx-auto appHorizantalSpacing mb-10">
          <h1 className="text-2xl font-[700] my-4 mb-5">{dict?.hotelDetails?.frequentlyAskedQuestions}</h1>
          <div className="space-y-4">
            {hotelDetails.faqs
              .filter((faq: any) => faq.category === "faqs")
              .map((faq: any) => (
                <AccordionInfoCard
                  key={faq.id}
                  title={faq.question}
                  showLeftIcon={false}
                  leftIcon="material-symbols-light:check-circle-outline-rounded"
                  rightIcon="material-symbols-light:arrow-circle-down-rounded"
                  iconColor="black"
                  iconSize={30}
                  showDescription={false}
                >
                  <div
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{ __html: faq.answer || "No details available." }}
                  />
                </AccordionInfoCard>
              ))}
          </div>
        </section>
      )}

      {/* Amenities Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 cursor-pointer right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <h2 className="text-xl font-bold font-urbanist mb-4">{dict?.hotelDetails?.allAmenities}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hotelDetails?.amenities?.map((amenity: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="min-w-10 min-h-10 flex items-center justify-center rounded-lg bg-green-100">
                    <Icon icon={getAmenityIcon(amenity)} className="text-gray-700" width={20} height={20} />
                  </div>
                  <p className="text-base font-[500] text-gray-700">{amenity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelsDetails;