// Import all dependencies
import axios from "axios";
import { store } from "../store/store";

// Create an instance of axios with the base URL for Google Calendar API
const googleCalendarApi = axios.create({
  baseURL: "https://www.googleapis.com/calendar/v3",
  headers: {
    "Content-Type": "application/json",
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
  (error) => Promise.reject(error),
);

// Interceptor to handle errors in the response
googleCalendarApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Network errors
    if (!error.response) {
      console.error(
        "[Google Calendar API Error]: Verify your internet connection.",
      );
      return Promise.reject(
        new Error("Google Calendar API is unreachable. Check your connection"),
      );
    }
    // Handle Authentication errors
    if (error.response?.status === 401) {
      console.warn(
        "[Google Calendar API Error]: Access token may have expired. Please re-authenticate.",
      );
      return Promise.reject(
        new Error("Google session has expired. Please log in"),
      );
    }

    console.error(
      `[Google Calendar API Error ${error.response?.status}]: ${error.response?.data?.error?.message}`,
    );
    return Promise.reject(
      new Error(
        error.response?.data?.error?.message ||
          "Unknown error, please try again.",
      ),
    );
  },
);

// Functions that formats dates to ISO for the API
const formatDateToISO = (date) =>
  date ? new Date(date).toISOString() : undefined;

// Class containing static methods for interacting with the Google Calendar API
class GoogleCalendarApi {
  // JSDoc comment for the getCalendarLists static method
  /**
   * Get all calendar lists owned by the logged-in user
   */
  static async getCalendarLists() {
    // Make a GET request to retrieve all the calendar lists for the authenticated user
    const response = await googleCalendarApi.get("/users/me/calendarList");
    return response.data.items || [];
  }

  // JSDoc comment for the getEventsByTimeFrame static method
  /**
   * Get events using a specific calendar list and a date range
   * @param {Date|string} timeMin
   * @param {Date|string} timeMax
   * @param {string} calendarId - Target calendar list ID (default is 'primary')
   */
  static async getEventsByTimeFrame(timeMin, timeMax, calendarId = "primary") {
    // Make a GET request to retrieve all events within a given timeframe and using a specific calendar list ordered by start time
    const response = await googleCalendarApi.get(
      `/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        params: {
          timeMin: formatDateToISO(timeMin),
          timeMax: formatDateToISO(timeMax),
          singleEvents: true,
          orderBy: "startTime",
        },
      },
    );
    return response.data.items || [];
  }

  // JSDoc comment for the getEventById static method
  /**
   * Get a single event using its ID
   * @param {string} eventId
   * @param {string} calendarId - Target calendar list ID (default is 'primary')
   */
  static async getEventById(eventId, calendarId = "primary") {
    // Make a GET request to retrieve a single event using its ID and a given calendar list
    const response = await googleCalendarApi.get(
      `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    );
    return response.data;
  }

  // JSDoc comment for the createEvent static method
  /**
   * Create a new event item using a calendar list
   * @param {Object} eventData - The event data to be created {title, notes, due}
   * @param {string} calendarId - Target calendar list ID (default is 'primary')
   */
  static async createEvent(eventData, calendarId = "primary") {
    // Make a POST request to create a new event using provided content and a given calendar list
    const response = await googleCalendarApi.post(
      `/calendars/${encodeURIComponent(calendarId)}/events`,
      eventData,
    );
    return response.data;
  }
}

export default GoogleCalendarApi;
