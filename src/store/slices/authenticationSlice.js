// Import all dependencies
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Import utility files
import GarminApi from "../../utilities/garminApi";

// Initial State for both APIs
const initialState = {
  // Garmin State
  garmin: {
    status: "disconnected", // connected || disconnected
    message: "Not logged in with Garmin",
    user: null,
  },
  // Google Tasks and Calendar State
  google: {
    status: "disconnected", // connected || disconnected
    message: "Not logged in with Google",
    accessToken: null,
    user: null,
  },
  // Keeping track of the Loading and Error states for UI optimization
  isLoading: false,
  error: null,
};

// GARMIN ASYNC THUNKS

// Async thunk to verify if the user is logged in
export const checkGarminStatus = createAsyncThunk(
  "authentication/checkGarminStatus",
  async (_, { rejectWithValue }) => {
    try {
      const data = await GarminApi.checkStatus();
      return data; // Returns an object with 'status' and 'message' keys
    } catch (error) {
      return rejectWithValue({
        status: "disconnected",
        message: error.message || "No Garmin session found",
      });
    }
  },
);

// Async thunk to log in the user
export const loginGarminUser = createAsyncThunk(
  "authentication/loginGarminUser",
  async ({ email, password } = {}, { rejectWithValue }) => {
    try {
      const data = await GarminApi.login(email, password);
      return data; // Returns an object with 'status' and 'user' keys
    } catch (error) {
      return rejectWithValue({
        status: "disconnected",
        message: error.message || "Garmin login failed",
      });
    }
  },
);

// Slice definition
const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  // Reducers
  reducers: {
    // Garmin Authentication Actions
    logoutGarmin: (state) => {
      state.garmin.status = "disconnected";
      state.garmin.message = "Succesfully logged out of Garmin";
      state.garmin.user = null;
    },

    // Google Authentication Actions
    setGoogleAuthenticationCredentials: (state, action) => {
      state.google.accessToken = action.payload.accessToken;
      state.google.status = "connected";
      state.google.message = "Succesfully logged in to Google";
      if (action.payload.user) {
        state.google.user = action.payload.user;
      }
      state.error = null;
    },

    logoutGoogle: (state) => {
      state.google.accessToken = null;
      state.google.status = "disconnected";
      state.google.message = "Succesfully logged out of Google";
      state.google.user = null;
    },

    // Error Clearing Action
    clearError: (state) => {
      state.error = null;
    },
  },

  // Extra Reducers
  extraReducers: (builder) => {
    builder
      // checkGarminStatus
      // Pending
      .addCase(checkGarminStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(checkGarminStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.garmin.status = action.payload?.status || "connected";
        state.garmin.message = action.payload?.message || "Connected to Garmin";
        state.garmin.user = action.payload?.user || null;
      })
      // Rejected
      .addCase(checkGarminStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.garmin.status = "disconnected";
        state.garmin.message = action.payload?.message || "No active session";
        state.garmin.user = null;
      })

      // loginGarminUser
      // Pending
      .addCase(loginGarminUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(loginGarminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.garmin.status = action.payload?.status || "connected";
        state.garmin.message =
          action.payload?.message || "Succesfully logged in to Garmin";
        state.error = null;
      })
      // Rejected
      .addCase(loginGarminUser.rejected, (state, action) => {
        state.isLoading = false;
        state.garmin.status = "disconnected";
        state.garmin.message = action.payload?.message || "Couldn't log in";
        state.garmin.user = null;
        state.error = action.payload?.message || "Garmin log in failed";
      });
  },
});

// Export actions and reducer

export const {
  logoutGarmin,
  setGoogleAuthenticationCredentials,
  logoutGoogle,
  clearError,
} = authenticationSlice.actions;
export default authenticationSlice.reducer;
