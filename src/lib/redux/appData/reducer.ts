import { createReducer } from "@reduxjs/toolkit";
import { setAppData } from "./actions";

interface State {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  data: null,
  loading: false,
  error: null,
};

export const appDataReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setAppData.pending, (state) => {
      state.loading = true;
      state.error = null; // reset error on new request
    })
    .addCase(setAppData.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action?.payload;
    })
    .addCase(setAppData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch app data";
    });
});
