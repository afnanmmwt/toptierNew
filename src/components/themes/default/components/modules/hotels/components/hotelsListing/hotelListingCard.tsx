// @components/hotel/HotelCard.tsx
"use client";
import { memo, useCallback, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { addToFavourite } from "@src/actions";
import { useUser } from "@hooks/use-user";
import getCurrencySymbol from "@src/utils/getCurrencySymbals";
import useLocale from "@hooks/useLocale";
import useDictionary from "@hooks/useDict";
import useCurrency from "@hooks/useCurrency";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import Spinner from "@components/core/Spinner";

interface HotelListingCardProps {
  hotel: any;
  activeHotelId: string;
  setActiveHotelId: (id: string) => void;
  onMapShow?: (hotel: any) => void;
  viewMode: any;
  onBookNow: any;
  loading: null | string;

  favourite:boolean;

}

const HotelCard = memo(function HotelCard({
  hotel,
  viewMode,
  onBookNow,
  onMapShow,
  activeHotelId,
  setActiveHotelId,
  loading,

  favourite=true

}: HotelListingCardProps) {
  const { user } = useUser();
  // Use number state to match API (0 = not fav, 1 = fav)
  const { currency } = useAppSelector((state) => state.root || {});

  const [isFav, setIsFav] = useState<number>(() => {
    return hotel.favorite === 1 || hotel.favorite === "1" ? 1 : 0;
  });
  useEffect(() => {
    setIsFav(hotel.favorite === 1 || hotel.favorite === "1" ? 1 : 0);
  }, [hotel.favorite]);

  const renderStars = useCallback((rating: string) => {
    const stars = [];
    const numRating = parseInt(rating) || 0;
    for (let i = 0; i < numRating; i++) {
      stars.push(
        <Icon key={i} icon="mdi:star" className="h-4 w-4 text-yellow-400" />
      );
    }
    return stars;
  }, []);

  const { locale } = useLocale();
  const { data: dict, isLoading } = useDictionary(locale as any);

  const toggleLike = async () => {
    if (!user) {
      toast.error("User must be logged in to mark as favourite");
      return;
    }
    try {
      const payload = {
        item_id: String(hotel.hotel_id),
        module: "hotels",
        user_id: String(user?.user_id) || "",
      };
      const res = await addToFavourite(payload);
      if (res?.error) {
        toast.error("Something went wrong :x:");
        return;
      }

      //  Toggle local state: 0 ↔ 1
      const newFavStatus = isFav === 1 ? 0 : 1;
      setIsFav(newFavStatus);
      toast.success(res?.message || "Updated favourites ");
    } catch (err) {
      toast.error("Failed to update favourites :x:");
    }
  };

  return (
    <div
      key={hotel.hotel_id}
      className={`bg-white p-[8px] rounded-[45px] border border-gray-200  transition-all duration-300 hover:shadow-lg ${
        viewMode === "list" ? "flex flex-col sm:flex-row max-w-none" : ""
      }`}
    >
      {/* Hotel Image */}
      <div
        className={`relative overflow-hidden rounded-[40px] ${
          viewMode === "list"
            ? "sm:w-80 sm:h-64 flex-shrink-0 aspect-square sm:aspect-auto"
            : "aspect-square"
        }`}
      >
        <img
          src={hotel.img}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";
          }}
        />
        {viewMode === "map" && (
          <button
            type="button"
            onClick={() => {
              if (activeHotelId === hotel.hotel_id) {
                setActiveHotelId(""); // unselect
              } else {
                setActiveHotelId(hotel.hotel_id); // select this one
              }
              onMapShow?.(hotel);
            }}
            className={`cursor-pointer rounded-full w-9 h-9 sm:w-10 sm:h-10 lg:w-9 lg:h-9 flex items-center justify-center absolute top-3 right-3 shadow transition-colors duration-300 ${
              activeHotelId === hotel.hotel_id ? "bg-blue-800" : "bg-[#EBEFF4]"
            }`}
          >
            <svg
              width="15"
              height="17"
              viewBox="0 0 15 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.03366 16.1192C7.89335 16.2197 7.72496 16.2738 7.55222 16.2738C7.37947 16.2738 7.21108 16.2197 7.07077 16.1192C2.91918 13.1661 -1.4869 7.09186 2.96732 2.7026C4.19014 1.50221 5.83693 0.829815 7.55222 0.830567C9.27166 0.830567 10.9215 1.50405 12.1371 2.70175C16.5913 7.091 12.1853 13.1644 8.03366 16.1192Z"
                stroke={activeHotelId === hotel.hotel_id ? "white" : "#5B697E"}
                strokeWidth="1.28692"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.55245 8.55221C8.00848 8.55221 8.44582 8.37142 8.76828 8.04963C9.09074 7.72784 9.2719 7.2914 9.2719 6.83631C9.2719 6.38123 9.09074 5.94479 8.76828 5.623C8.44582 5.3012 8.00848 5.12042 7.55245 5.12042C7.09643 5.12042 6.65908 5.3012 6.33662 5.623C6.01416 5.94479 5.83301 6.38123 5.83301 6.83631C5.83301 7.2914 6.01416 7.72784 6.33662 8.04963C6.65908 8.37142 7.09643 8.55221 7.55245 8.55221Z"
                stroke={activeHotelId === hotel.hotel_id ? "white" : "#5B697E"}
                strokeWidth="1.28692"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hotel Details */}
      <div
        className={`p-3 ${
          viewMode === "list"
            ? "flex-1 flex flex-col truncate justify-between"
            : ""
        }`}
      >
        <div>
          <h3
            title={hotel.name}
            className={`text-xl font-extrabold text-gray-900 mb-0 sm:text-2xl md:text-xl lg:text-2xl
              overflow-hidden whitespace-nowrap ${
                viewMode === "list" ? "w-full" : "block"
              }
              ltr:pl-1 rtl:pr-1 rtl:text-right`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <bdi dir="ltr" className="block truncate">
              {hotel.name}
            </bdi>
          </h3>

          <p
            className="text-[16px] sm:text-[17px] lg:text-[18px] my-2 font-[400] text-[#5B697E]
             overflow-hidden whitespace-nowrap text-ellipsis ltr:pl-1 rtl:pr-1 rtl:text-right"
          >
            <bdi dir="ltr" className="block truncate">
              {hotel.location}
            </bdi>
          </p>
          {/* Stars */}
          <div className="flex items-center gap-1 mb-1 pl-1">
            {renderStars(hotel.stars)}
            <span className="text-sm text-gray-500 ml-2">
              ({parseFloat(hotel.rating).toFixed(1)})
            </span>
          </div>
          {/* Price */}
          <div
            className={`flex ${
              viewMode === "list"
                ? "flex-col sm:flex-row sm:justify-between"
                : "justify-between"
            } items-start sm:items-center pl-2 mb-4`}
          >
            <div className="flex gap-2 items-center mb-2 sm:mb-0">
              <p className="text-[24px] sm:text-[28px] lg:text-[30px] font-[900]">
                <span className="text-xl">
                  {" "}
                  {getCurrencySymbol(hotel.currency || currency)}{" "}
                  {hotel.markup_price || hotel.price}
                </span>
                {/* {hotel.actual_price || hotel.price} */}
                <span className="text-[14px] sm:text-[16px] lg:text-xl font-[400] text-[#5B697E]">
                 /{dict?.hotel_listing?.per_night} 
                </span>
              </p>
              {/* <p className="text-[14px] sm:text-[16px] lg:text-[14px] font-[400] text-[#5B697E]">
                /night
              </p> */}
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div
          className={`flex items-center gap-2 ${
            viewMode === "list" ? "mt-auto" : ""
          }`}
        >
          <button
            disabled={loading === hotel.hotel_id}
            className="flex-1 cursor-pointer bg-[#163D8C] hover:bg-gray-800 text-white font-medium py-3 md:py-2.5 px-3 text-sm sm:text-base md:text-sm lg:text-base rounded-full transition-colors duration-200 focus:outline-none"
            onClick={() => onBookNow && onBookNow(hotel)}
          >
            {loading === hotel.hotel_id ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner /> <span></span>
              </div>
            ) : (
              dict?.hotel_listing?.book_now || "Book Now"
            )}
          </button>
         {favourite && <button
            onClick={toggleLike}
            className="bg-[#EBEFF4] cursor-pointer hover:bg-gray-200 rounded-full transition-all duration-200 flex items-center justify-center flex-shrink-0 w-12 h-12 sm:w-11 sm:h-11 lg:w-11.5 lg:h-11.5"
            aria-label={`${isFav === 1 ? "Unlike" : "Like"} ${hotel.name}`}
          >
            <svg
              className="transition-colors duration-200 w-5 h-5 sm:w-6 sm:h-6 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.22371 1.44739C3.27589 1.44739 0.885498 3.98725 0.885498 7.11938C0.885498 13.3881 11 20.5526 11 20.5526C11 20.5526 21.1145 13.3881 21.1145 7.11938C21.1145 3.23878 18.7241 1.44739 15.7763 1.44739C13.686 1.44739 11.8766 2.72406 11 4.58288C10.1234 2.72406 8.31404 1.44739 6.22371 1.44739Z"
                stroke={isFav === 1 && user ? "#EF4444" : "#6B7280"}
                strokeOpacity="0.8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={isFav === 1 && user ? "#EF4444" : "none"}
              />
            </svg>
          </button>}
        </div>
      </div>
    </div>
  );
});

export default HotelCard;
