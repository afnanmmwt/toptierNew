import React, { useState } from "react";
import { HotelListingCard } from "../hotelsListing";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { AnyARecord } from "node:dns";
import useLocale from "@hooks/useLocale";
import useDictionary from "@hooks/useDict";

interface HotelSuggestionSliderProps {
  hotels: any[];
  onHotelClick?: (hotel: any) => void;
  loading:null | string
}


const HotelSuggestionSlider = ({ hotels, onHotelClick, loading }: HotelSuggestionSliderProps) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  if (!hotels || hotels.length === 0) {
    return null;
  }

  return (
    <section className="py-4 max-w-[1200px] mx-auto appHorizantalSpacing mb-10 relative">
      <h1 className="text-2xl font-[700] my-4 mb-5">You might also like</h1>

      <div className="relative">
        <Swiper
          modules={[Navigation]}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onAfterInit={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="relative"
        >
          {hotels.map((hotel: any, index: number) => (
            <SwiperSlide
              key={`${hotel.hotel_id || "hotel"}-${index}`}
              className="py-4  flex" //
            >
              <div className="w-full h-full">
                <HotelListingCard
                favourite={false}
                loading={loading}
                  hotel={hotel}
                  viewMode=""
                  activeHotelId=""
                  setActiveHotelId={() => { }}
                  onBookNow={(selectedHotel: any) => onHotelClick?.(selectedHotel)}
                />

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Left Arrow */}
        <button
          className={`custom-prev absolute top-1/2 -left-3 cursor-pointer -translate-y-1/2 z-20 rounded-full w-11 h-11 flex items-center justify-center shadow-md transition ${isBeginning
              ? "bg-gray-200 cursor-not-allowed opacity-50"
              : "bg-white hover:bg-gray-100"
            }`}
          disabled={isBeginning}
        >
          <svg
            width="14"
            height="11"
            viewBox="0 0 14 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform rotate-180"
          >
            <g clipPath="url(#clip0_358_2322)">
              <path
                d="M0.333984 6.82162H10.4757L7.49232 9.81328L8.66732 10.9883L12.9602 6.69538C13.3507 6.30486 13.3507 5.6717 12.9602 5.28118L8.66732 0.988281L7.49232 2.16329L10.4757 5.15494H0.333985L0.333984 6.82162Z"
                fill="#0F1112"
              />
            </g>
            <defs>
              <clipPath id="clip0_358_2322">
                <rect width="14" height="10" fill="white" transform="translate(0 0.984375)" />
              </clipPath>
            </defs>
          </svg>

        </button>

        {/* Right Arrow */}
        <button

          className={`custom-next absolute top-1/2 -right-3 cursor-pointer -translate-y-1/2 z-20 rounded-full w-11 h-11 flex items-center justify-center shadow-md transition ${isEnd
              ? "bg-gray-200 cursor-not-allowed opacity-50"
              : "bg-white hover:bg-gray-100"
            }`}
          disabled={isEnd}
        >

          <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_358_2322)">
              <path d="M0.333984 6.82162H10.4757L7.49232 9.81328L8.66732 10.9883L12.9602 6.69538C13.3507 6.30486 13.3507 5.6717 12.9602 5.28118L8.66732 0.988281L7.49232 2.16329L10.4757 5.15494H0.333985L0.333984 6.82162Z" fill="#0F1112" />
            </g>
            <defs>
              <clipPath id="clip0_358_2322">
                <rect width="14" height="10" fill="white" transform="translate(0 0.984375)" />
              </clipPath>
            </defs>
          </svg>

        </button>
      </div>
    </section>
  );
};

export default HotelSuggestionSlider;
