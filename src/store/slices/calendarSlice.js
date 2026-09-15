// Import all dependencies
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Import utility files
import GoogleCalendarApi from "../../utilities/googleCalendarApi";
import GoogleTasksApi from "../../utilities/googleTasksApi";

// Initial State
const initialState = {
  // The calendar lists that the user has with a 'selectedListId' to inspect a given list's details
  calendarList: {
    selectedListId: "primary",
    items: [],
  },

  // The task lists that the user has with a 'selectedListId' to inspect a given list's details
  tasksList: {
    selectedListId: "@default",
    items: [],
  },

  // Tasks with a 'selectedTaskId' to inspect a given task's details
  tasks: {
    selectedTaskId: null,
    items: [],
  },

  // Events with a 'selectedEventId' to inspect a given event's details
  events: {
    selectedEventId: null,
    items: [],
  },

  // Keeping track of the Loading and Error states for UI optimization
  isLoading: false,
  error: null,
};

// ASYNC THUNKS

// CALENDAR

// Fetch Calendar Lists
export const fetchCalendarLists = createAsyncThunk(
  "calendar/fetchCalendarLists",
  async (_, { rejectWithValue }) => {
    try {
      const data = await GoogleCalendarApi.getCalendarLists();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch calendar lists");
    }
  },
);

// Fetch Calendar Events
export const fetchCalendarEvents = createAsyncThunk(
  "calendar/fetchCalendarEvents",
  async ({ timeMin, timeMax, calendarId = "primary" }, { rejectWithValue }) => {
    try {
      const data = await GoogleCalendarApi.getEventsByTimeFrame(
        timeMin,
        timeMax,
        calendarId,
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch calendar events",
      );
    }
  },
);

// Fetch Event Details
export const fetchEventById = createAsyncThunk(
  "calendar/fetchEventById",
  async ({ eventId, calendarId = "primary" }, { rejectWithValue }) => {
    try {
      const data = await GoogleCalendarApi.getEventById(eventId, calendarId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  },
);

// Create Calendar Event
export const createCalendarEvent = createAsyncThunk(
  "calendar/createCalendarEvent",
  async ({ eventData, calendarId = "primary" }, { rejectWithValue }) => {
    try {
      const data = await GoogleCalendarApi.createEvent(eventData, calendarId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create event");
    }
  },
);

// TASKS

// Fetch Task Lists
export const fetchTaskLists = createAsyncThunk(
  "calendar/fetchTaskLists",
  async (_, { rejectWithValue }) => {
    try {
      const data = await GoogleTasksApi.getTaskLists();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch task lists");
    }
  },
);

// Fetch Tasks
export const fetchTasks = createAsyncThunk(
  "calendar/fetchTasks",
  async ({ dueMin, dueMax, listId = "@default" }, { rejectWithValue }) => {
    try {
      const data = await GoogleTasksApi.getTasksByTimeFrame(
        dueMin,
        dueMax,
        listId,
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch tasks");
    }
  },
);

// Fetch Task Details
export const fetchTaskById = createAsyncThunk(
  "calendar/fetchTaskById",
  async ({ taskId, listId = "@default" }, { rejectWithValue }) => {
    try {
      const data = await GoogleTasksApi.getTaskById(taskId, listId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch task details");
    }
  },
);

// Create Task
export const createTask = createAsyncThunk(
  "calendar/createTask",
  async ({ taskData, listId = "@default" }, { rejectWithValue }) => {
    try {
      const data = await GoogleTasksApi.createTask(taskData, listId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create task");
    }
  },
);

// SLICE DEFINITION

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    // Detail Selection Reducers
    selectCalendarList: (state, action) => {
      state.calendarList.selectedListId = action.payload; // calendar list ID or null
    },

    selectTaskList: (state, action) => {
      state.tasksList.selectedListId = action.payload; // task list ID or null
    },

    selectEvent: (state, action) => {
      state.events.selectedEventId = action.payload; // event ID or null
    },

    selectTask: (state, action) => {
      state.tasks.selectedTaskId = action.payload; // task ID or null
    },

    clearSelections: (state) => {
      state.calendarList.selectedListId = "primary";
      state.tasksList.selectedListId = "@default";
      state.events.selectedEventId = null;
      state.tasks.selectedTaskId = null;
    },

    // Error Clearing Action
    clearGoogleDataError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
          // fetchCalendarLists
          // Pending
          .addCase(fetchCalendarLists.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          // Fulfilled
          .addCase(fetchCalendarLists.fulfilled, (state, action) => {
            state.isLoading = false;
            state.calendarList.items = action.payload;
          })
          // Rejected
          .addCase(fetchCalendarLists.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          })
          
          // fetchCalendarEvents
          // Pending
          .addCase(fetchCalendarEvents.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          // Fulfilled
          .addCase(fetchCalendarEvents.fulfilled, (state, action) => {
            state.isLoading = false;
            state.events.items = action.payload;
          })
          // Rejected
          .addCase(fetchCalendarEvents.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          })
          
          // fetchEventById
          // Pending
          .addCase(fetchEventById.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          // Fulfilled
          .addCase(fetchEventById.fulfilled, (state, action) => {
            state.isLoading = false;
            state.events.selectedEventId = action.payload.id;
          })
          // Rejected
          .addCase(fetchEventById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          })
          
          // createCalendarEvent
          // Pending
          .addCase(createCalendarEvent.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          // Fulfilled
          .addCase(createCalendarEvent.fulfilled, (state, action) => {
            state.isLoading = false;
            // We re-fetch calendar events instead of addig it directly to the state
          })
          // Rejected
          .addCase(createCalendarEvent.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          })

          // fetchTaskLists
          // Pending
          .addCase(fetchTaskLists.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          // Fulfilled
          .addCase(fetchTaskLists.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tasksList.items = action.payload;
          })
          // Rejected
          .addCase(fetchTaskLists.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          })
          
          // fetchTasks
          // Pending
          .addCase(fetchTasks.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          // Fulfilled
          .addCase(fetchTasks.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tasks.items = action.payload;
          })
          // Rejected
          .addCase(fetchTasks.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          })

          // fetchTaskById
          // Pending
          .addCase(fetchTaskById.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          // Fulfilled
          .addCase(fetchTaskById.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tasks.selectedTaskId = action.payload.id;
          })
          // Rejected
          .addCase(fetchTaskById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          })

          // createTask
          // Pending
          .addCase(createTask.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          // Fulfilled
          .addCase(createTask.fulfilled, (state, action) => {
            state.isLoading = false;
            // We re-fetch tasks instead of addig it directly to the state
          })
          // Rejected
          .addCase(createTask.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          })  
  },
});

// Export actions and reducer

export const {
  selectCalendarList,
  selectTaskList,
  selectEvent,
  selectTask,
  clearSelections,
  clearGoogleDataError
} = calendarSlice.actions;

export default calendarSlice.reducer;
