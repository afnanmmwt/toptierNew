"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import { addToFavourite } from "@src/actions";
import { useUser } from "@hooks/use-user";
import { toast } from "react-toastify";
import Image from "next/image";
import { setSeletecHotel } from "@lib/redux/base";
import { useRouter } from "next/navigation";
import Spinner from "@components/core/Spinner";
import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";
import getCurrencySymbals  from "@src/utils/getCurrencySymbals";

interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  price: string;
  stars: string;
  left_rooms: string;
  img: string;
  amenities?: string[];
  favorite?: number;
}

const FeaturedHotels: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotelId, setLoadingHotelId] = useState<string | null>(null);
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  const { featured_hotels } = useAppSelector((state) => state.appData?.data || {});
    const { currency } = useAppSelector((state) => state.root || {});

  const { user } = useUser();
  const router = useRouter();
  const dispatch = useAppDispatch();


  const amenityIcons: Record<string, string> = {
    pool: "mdi:pool",
    swimming: "mdi:pool",
    fitness: "mdi:dumbbell",
    gym: "mdi:dumbbell",
    spa: "mdi:spa",
    restaurant: "mdi:silverware-fork-knife",
    bar: "mdi:glass-cocktail",
    wifi: "mdi:wifi",
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

  useEffect(() => {
    if (Array.isArray(featured_hotels)) {
      setHotels(featured_hotels);
    } else {
      setHotels([]);
    }
  }, [featured_hotels]);

  const renderStars = (stars: number) => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const starsArr = [];
    for (let i = 0; i < fullStars; i++) {
      starsArr.push(
        <Icon
          key={`full-${i}`}
          icon="material-symbols:star-rate-rounded"
          className="text-[#FE9A00]"
          width="24"
          height="24"
        />
      );
    }
    if (hasHalfStar) {
      starsArr.push(
        <Icon
          key="half"
          icon="material-symbols:star-half"
          className="text-[#FE9A00]"
          width="24"
          height="24"
        />
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      starsArr.push(
        <Icon
          key={`empty-${i}`}
          icon="material-symbols:star-rate-rounded"
          className="text-gray-300"
          width="20"
          height="20"
        />
      );
    }
    return starsArr;
  };

  const toggleLike = async (hotel: Hotel) => {
    if (!user) {
      toast.error(dict?.featured_hotels?.error_login_required || "User must be logged in to mark as favourite");
      return;
    }

    try {
      const payload = {
        item_id: String(hotel.id),
        module: "hotels",
        user_id: String(user?.user_id) || "",
      };

      const res = await addToFavourite(payload);
      if (res?.error) {
        toast.error(dict?.featured_hotels?.error_failed_fav || "Failed to update favourite");
        return;
      }

      setHotels((prev) =>
        prev.map((h) =>
          h.id === hotel.id ? { ...h, favorite: h.favorite === 1 ? 0 : 1 } : h
        )
      );
      toast.success(res?.message || "Updated favourites ");
    } catch (err) {
      console.log(err)
      toast.error(dict?.featured_hotels?.something_wrong || "Something went wrong");
    }
  };

  const bgColors = [
    "bg-red-100",
    "bg-yellow-100",
    "bg-green-100",
    "bg-blue-100",
    "bg-pink-100",
    "bg-purple-100",
    "bg-teal-100",
    "bg-orange-100",
  ];

  const getRandomBg = (idx: number) => {
    return bgColors[idx % bgColors.length];
  };

 const detailsBookNowHandler = async (hotel: Hotel) => {
  // set the loading hotel ID so spinner appears
  setLoadingHotelId(hotel.id);

  try {
    dispatch(setSeletecHotel({}));
    localStorage.setItem("currentHotel", JSON.stringify(hotel));

    const slugName = hotel.name.toLowerCase().replace(/\s+/g, "-");
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const storedForm = localStorage.getItem("hotelSearchForm");
    let formData;

    if (storedForm) {
      formData = JSON.parse(storedForm);
    } else {
      formData = {
        checkin: formatDate(today),
        checkout: formatDate(tomorrow),
        rooms: 1,
        adults: 2,
        children: 0,
        children_ages: [],
        nationality: "US",
        destination: hotel?.city || "Dubai",
        supplier_name: "hotels",
        latitude: "",
        longitude: "",
      };
      localStorage.setItem("hotelSearchForm", JSON.stringify(formData));
    }

    const url = `/hotelDetails/${hotel.id}/${slugName}/${formData.checkin}/${formData.checkout}/${formData.rooms}/${formData.adults}/${formData.children}/${formData.nationality}`;

    dispatch(setSeletecHotel(hotel));

    // short delay to make spinner visible before routing
    setTimeout(() => {
      router.push(url);
    }, 1000);
  } catch (error) {
    console.error("Booking redirect failed:", error);
  } finally {
    // reset loading state after short delay
    setTimeout(() => setLoadingHotelId(null), 1500);
  }
};


  if (!Array.isArray(featured_hotels) || featured_hotels.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-8 appHorizantalSpacing py-6">
      <div className="text-center mb-8 md:mb-12">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {dict?.featured_hotels?.heading || "Featured Hotels"}
        </h1>
        <p
          className="text-base sm:text-lg text-[#697488] max-w-md mx-auto leading-relaxed px-4"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {dict?.featured_hotels?.subheading ||
            "Explore our handpicked selection of top-rated hotels, offering exceptional comfort and unforgettable experiences worldwide."}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        {hotels.map((hotel, index) => (
          <div
            key={hotel.id || index}
            className="bg-[#F5F5F5] p-3 rounded-[65px] transition-all duration-300"
            onMouseEnter={() => setHoveredId(hotel.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative overflow-hidden rounded-[55px] aspect-square">
              <Image
                fill
                src={hotel.img}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3
                title={hotel.name}
                className="text-xl font-extrabold text-gray-900 mb-2 pl-2 sm:text-2xl md:text-xl lg:text-2xl text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {hotel.name}
              </h3>

              <p className="text-[16px] sm:text-[17px] lg:text-[18px] my-2 font-[400] text-[#5B697E] pl-2">
                {hotel.city}, {hotel.country}
              </p>

              <div className="flex items-center gap-1 mb-1 pl-1">
                {renderStars(Number(hotel.stars))}
              </div>

              <div className="flex justify-between items-center pl-2">
                <div className="flex gap-2 items-center">
                  <p className="text-[24px] sm:text-[28px] lg:text-[30px] font-[900]">
                    {getCurrencySymbals(currency)}{" "}{hotel.price}
                  </p>
                  <p className="text-[14px] sm:text-[16px] lg:text-[17px] font-[400] text-[#5B697E]">
                    {dict?.featured_hotels?.per_night || "per night"}
                  </p>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-700 ease-in-out ${
                  hoveredId === hotel.id ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="py-[16px]">
                  <div className="border-t border-[#E1E1E1] pt-[20px] mt-[24px] space-y-2">
                    {hotel.amenities && hotel.amenities.length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                        {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <div
                              className={`min-w-10 min-h-10 flex items-center justify-center rounded-lg ${getRandomBg(
                                idx
                              )}`}
                            >
                              <Icon
                                icon={getAmenityIcon(amenity)}
                                className="text-gray-700"
                                width={20}
                                height={20}
                              />
                            </div>
                            <p className="text-base font-[500] text-gray-700">
                              {amenity}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-3.5">
                        <p className="text-gray-500 text-sm sm:text-base">
                          {dict?.featured_hotels?.no_amenities || "No amenities found"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mb-3">


              <button
                onClick={() => detailsBookNowHandler(hotel)}
                disabled={loadingHotelId === hotel.id}
                className={`flex-1 ml-3 cursor-pointer bg-[#163D8C] hover:bg-gray-800 text-white font-medium py-3 px-3 text-sm sm:text-base md:text-sm lg:text-base rounded-full transition-colors duration-200 ${
                  loadingHotelId === hotel.id ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loadingHotelId === hotel.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Spinner />
                    <span>{dict?.featured_hotels?.loading || "Loading..."}</span>
                  </div>
                ) : (
                  dict?.featured_hotels?.book_now || "Book Now"
                )}
              </button>
              <button
                onClick={() => toggleLike(hotel)}
                className="bg-[#EBEFF4] mr-3 cursor-pointer hover:bg-gray-200 rounded-full transition-all duration-200 flex items-center justify-center flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-12 lg:h-12"
                aria-label={`${hotel.favorite === 1 && user ? "Like" : "Unlike"} ${hotel.name}`}
              >
                <svg
                  className="transition-colors duration-200 w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-5 lg:h-5"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.22371 1.44739C3.27589 1.44739 0.885498 3.98725 0.885498 7.11938C0.885498 13.3881 11 20.5526 11 20.5526C11 20.5526 21.1145 13.3881 21.1145 7.11938C21.1145 3.23878 18.7241 1.44739 15.7763 1.44739C13.686 1.44739 11.8766 2.72406 11 4.58288C10.1234 2.72406 8.31404 1.44739 6.22371 1.44739Z"
                    stroke={hotel.favorite === 1 && user ? "#EF4444" : "#6B7280"}
                    strokeOpacity="0.8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={hotel.favorite === 1 && user ? "#EF4444" : "none"}
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedHotels;