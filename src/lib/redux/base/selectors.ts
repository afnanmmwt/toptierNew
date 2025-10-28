import { RootState } from "../store";

export const mode = (state: RootState) => state.root.mode;
export const direction = (state: RootState) => state.root.direction;
export const locale = (state: RootState) => state.root.locale;
export const layoutType = (state: RootState) => state.root.layoutType;
export const currency = (state: RootState) => state.root.currency;
export const country = (state: RootState) => state.root.country;
export const sidebarExpanded = (state: RootState) => state.root.sidebarExpanded;
export const hotels = (state: RootState) => state.root.hotels;

