// Import all dependencies
import axios from 'axios';
import { store } from '../store/store';

// Create an instance of axios with the base URL for Google Calendar API
const googleCalendarApi = axios.create({
  baseURL: 'https://www.googleapis.com/calendar/v3',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the access token to the request headers upon request
googleCalendarApi.interceptors.request.use(
    (config) => {
        const token = store.getState().auth?.google?.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle errors in the response
googleCalendarApi.interceptors.response.use(
    response => response,
    error => {
        // Handle Network errors
        if (!error.response) {
            console.error('Network error: Verify your internet connection.');
        }
        // Handle Authentication errors
        if (error.response?.status === 401) {
            console.warn('Authentication error: Access token may have expired. Please re-authenticate.');
        }

        // Re-throw the error for further handling in the calling function (Redux)
        return Promise.reject(error);
    }
);

// Functions that formats dates to ISO for the API
const formatDateToISO = (date) => date ? new Date(date).toISOString() : undefined;

// Class containing static methods for interacting with the Google Calendar API
class GoogleCalendarApi {
    // JSDoc comment for the getCalendarLists static method
    /**
   * Get all calendar lists owned by the logged-in user
   */
    static async getCalendarLists() {
        try {
            // Make a GET request to retrieve all the calendar lists for the authenticated user
            const response = await googleCalendarApi.get('/users/me/calendarList');
            return response.data.items || [];
        } catch(error) { 
            // Log the error for the console with the corresponding static method
            console.error('Google Calendar API Error (getCalendarLists):', error.response?.data || error.message);
            throw error;
        }
    }

    // JSDoc comment for the getEventsByTimeFrame static method
    /**
   * Get events using a specific calendar list and a date range
   * @param {Date|string} timeMin 
   * @param {Date|string} timeMax 
   * @param {string} calendarId - Target calendar list ID (default is 'primary')
   */
    static async getEventsByTimeFrame(timeMin, timeMax, calendarId = 'primary') {
        try {
            // Make a GET request to retrieve all events within a given timeframe and using a specific calendar list ordered by start time
            const response = await googleCalendarApi.get(`/calendars/${encodeURIComponent(calendarId)}/events`, {
                params: {
                    timeMin: formatDateToISO(timeMin),
                    timeMax: formatDateToISO(timeMax),
                    singleEvents: true,
                    orderBy: 'startTime',
                }
            });
            return response.data.items || [];
        } catch(error) {
            // Log the error for the console with the corresponding static method
            console.error('Google Calendar API Error (getEventsByTimeFrame):', error.response?.data || error.message);
            throw error;
        }
    }

    // JSDoc comment for the getEventById static method
    /**
   * Get a single event using its ID
   * @param {string} eventId 
   * @param {string} calendarId - Target calendar list ID (default is 'primary')
   */
  static async getEventById(eventId, calendarId = 'primary') {
    try {
        // Make a GET request to retrieve a single event using its ID and a given calendar list
        const response = await googleCalendarApi.get(`/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`);
        return response.data;
    } catch(error) {
        // Log the error for the console with the corresponding static method
        console.error('Google Calendar API Error (getEventById):', error.response?.data || error.message);
        throw error;
    }
  }

  // JSDoc comment for the createEvent static method
    /**
   * Create a new event item using a calendar list
    * @param {Object} eventData - The event data to be created {title, notes, due}
    * @param {string} calendarId - Target calendar list ID (default is 'primary') 
   */
  static async createEvent(eventData, calendarId = 'primary') {
    try {
        // Make a POST request to create a new event using provided content and a given calendar list
        const response = await googleCalendarApi.post(`/calendars/${encodeURIComponent(calendarId)}/events`, eventData);
        return response.data;
    } catch(error) {
        // Log the error for the console with the corresponding static method
        console.error('Google Calendar API Error (createEvent):', error.response?.data || error.message);
        throw error;
    }
  }
}

export default GoogleCalendarApi;