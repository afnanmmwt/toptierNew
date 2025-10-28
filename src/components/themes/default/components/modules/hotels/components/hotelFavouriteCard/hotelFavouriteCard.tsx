// app/favourites/components/FavouriteHotelCard.tsx
import React from "react";
import { Icon } from "@iconify/react";

interface Hotel {
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  total: string;
  coins: string;
  image: string;
}

interface Props {
  hotel: Hotel;
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <svg
      key={i}
      className={`w-3 h-3 ${
        i < Math.floor(rating)
          ? "text-yellow-400"
          : "text-gray-400 dark:text-gray-500"
      } fill-current`}
      viewBox="0 0 20 20"
    >
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
  ));
};

const HotelFavouriteCard: React.FC<any> = ({ hotel }:{hotel:any}) => {
  return (
    <div className="bg-white shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 h-full flex flex-col">
      <div className="relative h-40 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-400 dark:from-blue-900 dark:to-blue-800">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center">
          <Icon icon="mdi:heart" className="text-[#FA4C86]" width="20" />
        </div>
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <div className="text-gray-600 dark:text-gray-400 text-sm">{hotel.location}</div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{hotel.name}</h2>
        <div className="flex items-center space-x-2">{renderStars(hotel.rating)}</div>
        <div className="flex items-baseline space-x-1">
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{hotel.rating}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">/10 · {hotel.reviews} reviews</span>
        </div>
        <div className="mt-auto space-y-1">
          <div className="font-bold text-lg text-blue-600 dark:text-blue-400">Rs {hotel.price}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total: Rs {hotel.total}</div>
          <div className="text-sm text-gray-500 dark:text-gray-500">Incl. taxes & fees</div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            Earn Rs {hotel.coins} in Trip Coins
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelFavouriteCard;