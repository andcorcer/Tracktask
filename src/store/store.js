// Import all dependencies
import { configureStore } from '@reduxjs/toolkit';

// Import Reducers
import authenticationReducer from './slices/authenticationSlice';
import calendarReducer from './slices/calendarSlice';
import garminReducer from './slices/garminSlice';
import todosReducer from './slices/todosSlice';

// Configure the Redux store
export const store = configureStore({
    reducer: {
        authentication: authenticationReducer,
        calendar: calendarReducer,
        garmin: garminReducer,
        todos: todosReducer,
    }
});