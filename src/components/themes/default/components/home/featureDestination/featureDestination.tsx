"use client";
import { useUser } from "@hooks/use-user";
import { useAppSelector } from "@lib/redux/store";
import { addToFavourite } from "@src/actions";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";

interface Destination {
  id: number;
  country: string;
  location: string;
  img: string;
  favorite: number;
}

const FeaturedDestinations: React.FC = () => {
  const { featured_tours } = useAppSelector((state) => state.appData?.data || {});
  const { user } = useUser();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  useEffect(() => {
    if (Array.isArray(featured_tours)) {
      setDestinations(featured_tours);
    } else {
      setDestinations([]);
    }
  }, [featured_tours]);

  const toggleLike = async (tour: Destination) => {
    if (!user) {
      toast.error(dict?.featured_dest?.error || "User must be logged in to mark as favourite");
      return;
    }

    // Optimistic UI update
    setDestinations((prev) =>
      prev.map((d) =>
        d.id === tour.id
          ? { ...d, favorite: d.favorite === 1 ? 0 : 1 }
          : d
      )
    );

    try {
      const payload = {
        item_id: String(tour.id),
        module: "tours",
        user_id: String(user?.user_id) || "",
      };

      const res = await addToFavourite(payload);

      if (res?.error) {
        // Rollback on error
        setDestinations((prev) =>
          prev.map((d) =>
            d.id === tour.id
              ? { ...d, favorite: d.favorite === 1 ? 0 : 1 }
              : d
          )
        );
        toast.error(res.message || "Failed to update favourite");
        return;
      }

      toast.success(res?.message || "Updated favourites ");
    } catch (err) {
      console.error("toggleLike error:", err);
      // Rollback on network error
      setDestinations((prev) =>
        prev.map((d) =>
          d.id === tour.id
            ? { ...d, favorite: d.favorite === 1 ? 0 : 1 }
            : d
        )
      );
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleExploreNow = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  if (!Array.isArray(featured_tours) || featured_tours.length === 0) {
    return null;
  }

  return (
    <div className="sectionVerticalSpacing">
      <div className="w-full max-w-[1200px] mx-auto appHorizantalSpacing">
        <div className="text-center mb-6">
          <h1
            className="text-4xl font-bold text-gray-900 mb-2 md:mb-4"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {dict?.featured_dest?.dest_heading || "Featured Destination"}
          </h1>
          <p
            className="text-base sm:text-lg text-[#697488] max-w-xl mx-auto mt-4 leading-relaxed px-6"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {dict?.featured_dest?.dest_subheading ||
              "Discover the most stunning and sought-after travel spots, curated for unforgettable experiences around the globe."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((tour) => (
            <div key={tour.id} className="bg-[#F5F5F5] rounded-[65px] w-full">
              {/* Image */}
              <div className="relative overflow-hidden rounded-[55px] m-3 aspect-square">
                <img
                  src={tour.img}
                  alt={`${tour.location}, ${tour.country}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "./images/destinations/default.jpg";
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-3">
                <h3
                  title={`${tour.location}, ${tour.country}`}
                  className="text-xl font-extrabold text-gray-900 mb-4 pl-3
                    sm:text-2xl md:text-xl lg:text-2xl 
                    overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  {tour.location}, {tour.country}
                </h3>

                <div className="flex items-center gap-3 px-2 mb-3">
                  <button
                    onClick={handleExploreNow}
                    className="flex-1 ml-3 bg-[#163C8C] cursor-pointer hover:bg-gray-800 text-white font-medium
                               py-3 px-3 text-sm sm:text-base md:text-sm lg:text-base
                               rounded-full transition-colors duration-200"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {dict?.featured_dest?.dest_explore || "Explore Now"}
                  </button>

                  <button
                    onClick={() => toggleLike(tour)}
                    className="bg-[#EBEFF4] mr-3 hover:bg-gray-200 rounded-full cursor-pointer transition-all duration-200
                               flex items-center justify-center flex-shrink-0
                               w-12 h-12 sm:w-14 sm:h-14 lg:w-12 lg:h-12"
                    aria-label={`${tour.favorite === 1 ? "Unlike" : "Like"} ${tour.location}, ${tour.country}`}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 transition-colors duration-200"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.22371 1.44739C3.27589 1.44739 0.885498 3.98725 0.885498 7.11938C0.885498 13.3881 11 20.5526 11 20.5526C11 20.5526 21.1145 13.3881 21.1145 7.11938C21.1145 3.23878 18.7241 1.44739 15.7763 1.44739C13.686 1.44739 11.8766 2.72406 11 4.58288C10.1234 2.72406 8.31404 1.44739 6.22371 1.44739Z"
                        stroke={tour.favorite === 1 ? "#EF4444" : "#6B7280"}
                        strokeOpacity="0.8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill={tour.favorite === 1 ? "#EF4444" : "none"}
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedDestinations;