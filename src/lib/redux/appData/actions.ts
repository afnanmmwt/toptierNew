import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAppData } from "@src/actions";
import type { RootState } from "@lib/redux/store"; // adjust path to your store file

export const setAppData = createAsyncThunk(
  "websiteContent/fetchWebContent",
  async (_, { getState, rejectWithValue }) => {
    try {
      //  1. Get values from Redux state
      const state = getState() as RootState;
      const language = state.root.locale;
      const currency = state.root.currency;
     console.log("Language:", language, "Currency:", currency);
     const payload : any={
      language:language,
      currency:currency
     }
      //  2. Call your API with them
      const response = await fetchAppData(payload);

      if (!response || response.error) {
        throw new Error(response.error || "Invalid response from API");
      }

      const { data } = response;
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);
