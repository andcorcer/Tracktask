// Import all dependencies
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Import utility files
import GarminApi from "../../utilities/garminApi";

// Initial State
const initialState = {
  // Daily Health Metrics with a 'selectedMetricId' to inspect a given health data's details
  healthMetrics: {
    selectedMetricId: null,
    summaryDate: null,
    items: null,
  },

  // Completed Activities with a 'selectedActivityId' to inspect a given activitie's details
  activities: {
    selectedActivityId: null,
    items: [],
  },

  // Training Plans with a 'selectedPlanId' to inspect a given plan's details
  trainingPlans: {
    selectedPlanId: null,
    items: [],
  },

  // Upcoming Scheduled Workouts with a 'selectedWorkoutId' to inspect a given workout's details
  upcomingWorkouts: {
    selectedWorkoutId: null,
    items: [],
  },

  // Keeping track of the Loading and Error states for UI optimization
  isLoading: false,
  error: null,
};

// ASYNC THUNKS

// Fetch Daily Summary
export const fetchDailySummary = createAsyncThunk(
  "garmin/fetchDailySummary",
  async (date, { rejectWithValue }) => {
    try {
      const data = await GarminApi.getDailySummary(date);
      return { date, metrics: data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch daily summary");
    }
  },
);

// Fetch Completed Activities in a time range
export const fetchActivitiesInTimeRange = createAsyncThunk(
  "garmin/fetchActivitiesInTimeRange",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const data = await GarminApi.getActivitiesInTimeRange(startDate, endDate);
      return data; // Array of activity objects
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch activities in the given time range",
      );
    }
  },
);

// Fetch Completed Activities from the most recent one
export const fetchRecentActivities = createAsyncThunk(
  "garmin/fetchRecentActivities",
  async ({ start, limit } = {}, { rejectWithValue }) => {
    try {
      const data = await GarminApi.getRecentActivities(start, limit);
      return data; // Array of activity objects
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch recent activities",
      );
    }
  },
);

// Fetch All Active Training Plans
export const fetchTrainingPlans = createAsyncThunk(
  "garmin/fetchTrainingPlans",
  async (_, { rejectWithValue }) => {
    try {
      const data = await GarminApi.getTrainingPlans();
      return data; // Array of training plan objects
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch training plans");
    }
  },
);

// Get Upcoming Workouts for a specified time range
export const fetchUpcomingWorkouts = createAsyncThunk(
  "garmin/fetchUpcomingWorkouts",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const data = await GarminApi.getWorkoutsInTimeRange(startDate, endDate);
      return data; // Array workout objects
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch upcoming workouts",
      );
    }
  },
);

// Get Workouts for a given Plan Id
export const fetchWorkoutsForTrainingPlan = createAsyncThunk(
  "garmin/fetchWorkoutsForTrainingPlan",
  async ({ planId, startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const data = await GarminApi.getWorkoutsInTimeRange(
        startDate,
        endDate,
        planId,
      );
      return data; // Array workout objects from a given training plan
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to fetch workouts from the requested training plan",
      );
    }
  },
);

// SLICE DEFINITION

const garminSlice = createSlice({
  name: "garmin",
  initialState,
  reducers: {
    // Detail Selection Reducers
    selectHealthMetric: (state, action) => {
      state.healthMetrics.selectedMetricId = action.payload; // metric ID or null
    },

    selectActivity: (state, action) => {
      state.activities.selectedActivityId = action.payload; // activity ID or null
    },

    selectTrainingPlan: (state, action) => {
      state.trainingPlans.selectedPlanId = action.payload; // plan ID or null
    },

    selectWorkout: (state, action) => {
      state.upcomingWorkouts.selectedWorkoutId = action.payload; // workout ID or null
    },

    clearSelections: (state) => {
      state.healthMetrics.selectedMetricId = null;
      state.activities.selectedActivityId = null;
      state.trainingPlans.selectedPlanId = null;
      state.upcomingWorkouts.selectedWorkoutId = null;
    },

    // Error Clearing Action
    clearGarminDataError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // fetchDailySummary
      // Pending
      .addCase(fetchDailySummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchDailySummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.healthMetrics.summaryDate = action.payload.date;
        state.healthMetrics.items = action.payload.metrics;
      })
      // Rejected
      .addCase(fetchDailySummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchActivitiesInTimeRange
      // Pending
      .addCase(fetchActivitiesInTimeRange.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchActivitiesInTimeRange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities.items = action.payload;
      })
      // Rejected
      .addCase(fetchActivitiesInTimeRange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchRecentActivities
      // Pending
      .addCase(fetchRecentActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities.items = action.payload;
      })
      // Rejected
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchTrainingPlans
      // Pending
      .addCase(fetchTrainingPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchTrainingPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trainingPlans.items = action.payload;
      })
      // Rejected
      .addCase(fetchTrainingPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchUpcomingWorkouts
      // Pending
      .addCase(fetchUpcomingWorkouts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchUpcomingWorkouts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingWorkouts.items = action.payload;
      })
      // Rejected
      .addCase(fetchUpcomingWorkouts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchWorkoutsForTrainingPlan
      // Pending
      .addCase(fetchWorkoutsForTrainingPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchWorkoutsForTrainingPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingWorkouts.items = action.payload;
      })
      // Rejected
      .addCase(fetchWorkoutsForTrainingPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer

export const {
  selectHealthMetric,
  selectActivity,
  selectTrainingPlan,
  selectWorkout,
  clearSelections,
  clearGarminDataError,
} = garminSlice.actions;

export default garminSlice.reducer;
