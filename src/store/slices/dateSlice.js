// Import all dependencies
import { createSlice } from "@reduxjs/toolkit";

// Initial State
const initialState = {
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
};

// SLICE DEFINITION

const dateSlice = createSlice({
  name: "date",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
  },
});

// Export actions and reducer

export const { setDateRange } = dateSlice.actions;
export default dateSlice.reducer;
