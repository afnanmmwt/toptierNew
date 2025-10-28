import { createReducer, PayloadAction } from "@reduxjs/toolkit";
import type { LayoutType } from "@src/@types/theme";
import {
  setMode,
  setDirection,
  setLocale,
  setLayoutType,
  setCurrency,
  setCountry,
  setDestination,
  setHotels,
  setSidebarExpanded,
  setSeletecHotel,
  setSeletecRoom
} from "./actions";

// Destination interface
interface Destination {
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
}

// Hotel interface
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

interface State {
  mode: string;
  direction: string;
  locale: string;
  layoutType: LayoutType;
  currency: string;
  country: string;
  destination: Destination[];
  sidebarExpanded?: boolean;
  hotels: HotelData[];
  selectedRoom:any;
  selectedHotel:any;
}

const initialState: State = {
  mode: "light",
  direction: "ltr",
  locale: "en",
  layoutType: "default",
  currency: "",
  country: "",
  destination: [],
  sidebarExpanded: true,
  hotels: [],
  selectedRoom:{},
  selectedHotel:{}
};
export const appReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setMode, (state, action: PayloadAction<string>) => {
      state.mode = action.payload;
    })
    .addCase(setDirection, (state, action: PayloadAction<string>) => {
      state.direction = action.payload;
    })
    .addCase(setLocale, (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
    })
    .addCase(setLayoutType, (state, action: PayloadAction<LayoutType>) => {
      state.layoutType = action.payload;
    })
    .addCase(setCurrency, (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    })
    .addCase(setCountry, (state, action: PayloadAction<string>) => {
      state.country = action.payload;
    })
    .addCase(setDestination, (state, action: PayloadAction<Destination[]>) => {
      state.destination = action.payload;
    })
    .addCase(setSidebarExpanded, (state, action: PayloadAction<boolean>) => {
      state.sidebarExpanded = action.payload;
    })
    .addCase(setHotels, (state, action: PayloadAction<HotelData[]>) => {
      state.hotels = action.payload;
    })
    // ✅ new cases for selected hotel and room
    .addCase(setSeletecHotel, (state, action: PayloadAction<any>) => {
      state.selectedHotel = action.payload;
    })
    .addCase(setSeletecRoom, (state, action: PayloadAction<any>) => {
      state.selectedRoom = action.payload;
    });
});

