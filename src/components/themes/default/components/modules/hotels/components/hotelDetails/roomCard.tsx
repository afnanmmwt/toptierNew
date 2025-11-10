// components/RoomCard.tsx
import { Icon } from "@iconify/react";
import { addToFavourite } from "@src/actions";
import getCurrencySymbol from "@src/utils/getCurrencySymbals";
import { toast } from "react-toastify";
import { useUser } from "@hooks/use-user";
import { useEffect, useState } from "react";
import useCurrency from "@hooks/useCurrency";
import RoomOption from "./roomOption";
import PopupContainer from "./PopupContainer";
import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";

interface RoomCardProps {
  room: any;
  options?: any;
  getAmenityIcon: (amenity: string) => string;
  onReserve: (room: any, option: any) => void;
  loading:null | string
}

export const RoomCard = ({ room, getAmenityIcon, options, onReserve,loading }: RoomCardProps) => {
  const { user } = useUser();
  const { priceRateConverssion } = useCurrency();
  const option = options || {};
  const price = room.markup_price;
  const currency = room.currency || "USD";
  const imageUrl = room.img || "/images/auth_bg.jpg";

  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  // Normalize favorite state to number (0 or 1)
  const [isFav, setIsFav] = useState<number>(() => {
    const fav = room.favorite;
    return fav === 1 || fav === "1" ? 1 : 0;
  });

  useEffect(() => {
    const fav = room.favorite;
    setIsFav(fav === 1 || fav === "1" ? 1 : 0);
  }, [room.favorite]);

  const toggleLike = async () => {
    if (!user) {
      toast.error(dict?.roomCard?.loginToFavorite || "User must be logged in to mark as favourite");
      return;
    }
    try {
      const payload = {
        item_id: String(room.room_id || room.id),
        module: "rooms",
        user_id: String(user?.user_id) || "",
      };
      const res = await addToFavourite(payload);
      if (res?.error) {
        toast.error(dict?.roomCard?.favoriteUpdateFailed || "Something went wrong :x:");
        return;
      }

      const newFavStatus = isFav === 1 ? 0 : 1;
      setIsFav(newFavStatus);
      toast.success(res?.message || dict?.roomCard?.favoriteUpdated || "Updated favourites ");
    } catch (err) {
      toast.error(dict?.roomCard?.favoriteUpdateError || "Failed to update favourites :x:");
    }
  };

  const [showPopup,setShowPopup] = useState(false);

  return (
    <div className="w-full rounded-4xl bg-[#FFFFFF] hover:scale-100 hover:shadow-sm p-2 transition-all duration-200 border border-gray-100 flex flex-col h-[590px]">
      {/* Image */}
      <div className="relative h-[240px] w-full rounded-3xl overflow-hidden mb-3">
        <img
          className="h-full w-full object-cover rounded-3xl"
          src={imageUrl}
          alt={room.name || "Room"}
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";
          }}
        />
        <div className="absolute top-2 right-2 bg-[#EBEFF4] w-7 h-7 rounded-full flex items-center justify-center">
          <svg width="3" height="14" viewBox="0 0 3 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.63417 4.8692C1.34474 4.8692 1.06716 4.98418 0.862492 5.18884C0.657829 5.3935 0.542851 5.67108 0.542851 5.96052V12.5085C0.542851 12.7979 0.657829 13.0755 0.862492 13.2801C1.06716 13.4848 1.34474 13.5998 1.63417 13.5998C1.92361 13.5998 2.20119 13.4848 2.40586 13.2801C2.61052 13.0755 2.7255 12.7979 2.7255 12.5085V5.96052C2.7255 5.67108 2.61052 5.3935 2.40586 5.18884C2.20119 4.98418 1.92361 4.8692 1.63417 4.8692ZM1.63417 0.503906C1.36437 0.503906 1.10062 0.583912 0.876291 0.733807C0.651957 0.883703 0.47711 1.09675 0.373861 1.34602C0.270611 1.59529 0.243596 1.86957 0.296232 2.13419C0.348868 2.39881 0.478791 2.64188 0.669572 2.83266C0.860352 3.02344 1.10342 3.15337 1.36804 3.206C1.63266 3.25864 1.90695 3.23162 2.15621 3.12837C2.40548 3.02512 2.61853 2.85028 2.76843 2.62594C2.91832 2.40161 2.99833 2.13786 2.99833 1.86806C2.99833 1.50626 2.8546 1.15929 2.59878 0.903458C2.34295 0.647629 1.99597 0.503906 1.63417 0.503906Z"
              fill="black"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2">
        <div>
          <p className="text-base text-[#0F172B] font-[800]">{room.name}</p>

          {/* Rating */}
          <div className="flex gap-2 items-center my-1">
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.28602 12.0056L3.80326 14.1037C3.6494 14.2016 3.48855 14.2435 3.32071 14.2295C3.15286 14.2156 3.006 14.1596 2.88012 14.0617C2.75423 13.9638 2.65632 13.8415 2.58639 13.695C2.51645 13.5484 2.50247 13.3839 2.54443 13.2015L3.46757 9.23619L0.383436 6.57167C0.243566 6.44578 0.156287 6.30228 0.1216 6.14115C0.0869118 5.98002 0.0972621 5.8228 0.152651 5.66951C0.208039 5.51621 0.291961 5.39032 0.404417 5.29186C0.516872 5.19339 0.670729 5.13045 0.865988 5.10303L4.93621 4.74636L6.50974 1.01183C6.57968 0.843989 6.68822 0.718106 6.83536 0.634184C6.98251 0.550262 7.13273 0.508301 7.28602 0.508301C7.43932 0.508301 7.58954 0.550262 7.73668 0.634184C7.88383 0.718106 7.99237 0.843989 8.0623 1.01183L9.63584 4.74636L13.7061 5.10303C13.9019 5.13101 14.0557 5.19395 14.1676 5.29186C14.2795 5.38976 14.3634 5.51565 14.4194 5.66951C14.4753 5.82336 14.486 5.98086 14.4513 6.14199C14.4166 6.30312 14.329 6.44634 14.1886 6.57167L11.1045 9.23619L12.0276 13.2015C12.0696 13.3833 12.0556 13.5478 11.9857 13.695C11.9157 13.8421 11.8178 13.9644 11.6919 14.0617C11.566 14.1591 11.4192 14.215 11.2513 14.2295C11.0835 14.2441 10.9226 14.2021 10.7688 14.1037L7.28602 12.0056Z" fill="#FE9A00" />
            </svg>
            <p className="text-sm font-[500]">{room.star || '4.8'} / 5</p>
          </div>

          {/* Amenities */}
          <div className="flex flex-col gap-y-2 py-2 text-[#112233E5]">
            {(() => {
              const defaultAmenities = [
                dict?.roomCard?.freeBreakfast || 'Free Wi-Fi',
                'Air Conditioning',
                'TV'
              ];

              const validAmenities = Array.isArray(room.amenities)
                ? room.amenities.filter((item: any) => item && item.trim() !== '')
                : [];

              const amenitiesToShow = validAmenities.length > 0
                ? validAmenities.slice(0, 3)
                : defaultAmenities;

              return amenitiesToShow.length > 0 ? (
                amenitiesToShow.map((amenity: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="min-w-6 min-h-6 flex items-center justify-center">
                      <Icon
                        icon={getAmenityIcon(amenity)}
                        className="text-gray-700"
                        width={16}
                        height={16}
                      />
                    </div>
                    <p className="text-sm font-[500]">{amenity}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {dict?.roomCard?.noAmenities || "No amenities listed"}
                </p>
              );
            })()}

            {options.breakfast === "1" && (
              <div className="flex gap-2 items-center">
                <div className="min-w-6 min-h-6 flex items-center justify-center">
                  <Icon
                    icon={getAmenityIcon("breakfast")}
                    className="text-gray-700"
                    width={16}
                    height={16}
                  />
                </div>
                <p className="text-sm font-[500]">
                  {dict?.roomCard?.freeBreakfast || "Free breakfast"}
                </p>
              </div>
            )}

            {options.cancellation === "1" && (
              <div className="flex gap-2 items-center">
                <div className="min-w-6 min-h-6 flex items-center justify-center">
                  <Icon
                    icon="mdi:check-circle-outline"
                    className="text-gray-700"
                    width={16}
                    height={16}
                  />
                </div>
                <p className="text-sm font-[500]">
                  {dict?.roomCard?.freeCancellation || "Free cancellation"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h2 className="text-xl font-[900] text-[#0F172B]">
                {getCurrencySymbol(currency)} {price}
              </h2>
              <p className="text-[#5B697E] text-sm font-[500] ps-1">/night</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPopup(true)}
              className="bg-[#163C8C] hover:bg-gray-800 text-white cursor-pointer font-[600] text-sm w-full rounded-full py-2"
            >
              {dict?.roomCard?.moreOptions || "More Options"}
            </button>

            {showPopup && (
              <PopupContainer>
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
                  onClick={() => setShowPopup(false)}
                >
                  <div
                    dir={locale?.startsWith('ar') ? 'rtl' : 'ltr'}
                    className={`bg-white p-6 rounded-lg w-11/12 max-w-5xl relative overflow-y-auto max-h-[90vh] animate-scale-in ${locale?.startsWith('ar') ? 'text-right' : 'text-left'
                      }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setShowPopup(false)}
                      className={`absolute cursor-pointer top-3 ${locale?.startsWith('ar') ? 'left-3' : 'right-3'
                        } text-gray-600 text-2xl font-bold`}
                      aria-label={dict?.roomCard?.close || "Close popup"}
                    >
                      ✕
                    </button>

                    <RoomOption
                      loading={loading}
                      room={room}
                      options={options}
                      getAmenityIcon={getAmenityIcon}
                      onReserve={onReserve}
                      roomImage={imageUrl}
                    />
                  </div>
                </div>
              </PopupContainer>
            )}

            <button
              onClick={toggleLike}
              className="bg-[#EBEFF4] cursor-pointer hover:bg-gray-200 rounded-full p-4 transition-colors"
              aria-label={`${isFav === 1 ? "Unlike" : "Like"} ${room.name}`}
            >
              <svg width="16" height="15" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.08315 1.00586C2.87423 1.00586 1.08301 2.90908 1.08301 5.25612C1.08301 9.95355 8.66222 15.3222 8.66222 15.3222C8.66222 15.3222 16.2414 9.95355 16.2414 5.25612C16.2414 2.34822 14.4502 1.00586 12.2413 1.00586C10.6749 1.00586 9.31909 1.96252 8.66222 3.35542C8.00536 1.96252 6.64952 1.00586 5.08315 1.00586Z"
                  stroke={isFav === 1 ? "#EF4444" : "#6B7280"}
                  strokeOpacity="0.8"
                  strokeWidth="1.2632"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={isFav === 1 ? "#EF4444" : "none"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};