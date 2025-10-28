import { createAction } from "@reduxjs/toolkit";
import { Theme, LayoutType } from "@src/@types/theme";

type ModeType = Theme;
export const setMode = createAction<ModeType["mode"]>("SET_MODE");
export const setDirection = createAction<"ltr" | "rtl">("SET_DIRECTION");
export const setLocale = createAction<string>("SET_LOCALE");
export const setLayoutType = createAction<LayoutType>("SET_LAYOUT_TYPE");
export const setCurrency = createAction<string>("SET_CURRENCY");
export const setCountry = createAction<string>("SET_COUNTRY");
export const setDestination = createAction<
  {
    id: number;
    airport: string;
    city: string;
    country: string;
    code: string;
    late: string;
    long: string;
    region: string;
    type: string;
    status: string;
  }[]
>("SET_DESTINATION");
interface HotelData {
  hotel_id: string;
  name: string;
  location: string;
  actual_price: string;
  actual_price_per_night: string;
  img: string;
  rating: string;
  stars: string;
  amenities: string[];
  favorite: number;
  address: string;
  latitude: string;
  longitude: string;
  currency: string;
  supplier_name: string;
  markup_price: string;
  markup_price_per_night: string;
  booking_currency: string;
}

// Add these hotel actions to your existing actions
export const setHotels = createAction<HotelData[]>("SET_HOTELS");
export const setSidebarExpanded = createAction<boolean>("SET_SIDEBAR_EXPANDED");
export const setSeletecRoom= createAction<any>("SET_SELECTED_ROOM")
export const setSeletecHotel= createAction<any>("SET_SELECTED_HOTEL")

