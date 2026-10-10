// Import all dependencies
import { createSlice } from "@reduxjs/toolkit";

// Initial State
const initialState = {
  selectedDate: new Date().toISOString().split("T")[0],
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
};

// SLICE DEFINITION

const dateSlice = createSlice({
  name: "date",
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload.selectedDate;
    },
    setDateRange: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
  },
});

// Export actions and reducer

export const { setDateRange, setSelectedDate } = dateSlice.actions;
export default dateSlice.reducer;
