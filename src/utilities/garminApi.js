// Import all dependencies
import axios from "axios";

const PORT = import.meta.env.VITE_GARMIN_PORT || 8000;
const GARMIN_SERVICE_BASE_URL = `http://localhost:${PORT}/api/garmin`;

// Create an instance of axios with the base URL for the backend python port
const garminApi = axios.create({
  baseURL: GARMIN_SERVICE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to handle errors in the response
garminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Network errors
    if (!error.response) {
      console.error(`[Garmin API Error]: Verify your internet connection.`);
      return Promise.reject(
        new Error(
          "Garmin microservice is unreachable. Check that main.py is running on port 8000.",
        ),
      );
    }

    // Handle errors provided by the backend python port
    if (error.response?.data?.detail) {
      console.error(
        `[Garmin API Error ${error.response?.status}]:`,
        error.response.data.detail,
      );
      return Promise.reject(new Error(error.response.data.detail));
    }

    // Handle any other errors
    return Promise.reject(error);
  },
);

// Functions that formats dates to ISO for the API
const formatDateToISO = (date) => {
  const d = date ? new Date(date) : new Date();
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: ${date}`);
  }
  return d.toISOString().split("T")[0]; // Return only the date part in YYYY-MM-DD format
};

// Class containing static methods for interacting with the Garmin API
class GarminApi {
  // JSDoc comment for the login static method
  /**
   * Authenticate with Garmin Connect using credentials
   * @param {string} email
   * @param {string} password
   */
  static async login(email, password) {
    // Make a POST request to send the email and password to log in
    const response = await garminApi.post(`/login`, {
      email,
      password,
    });
    return response.data;
  }

  // JSDoc comment for the checkStatus static method
  /**
   * Verify if an active Garmin session exists on the backend and fetch basic profile details
   */
  static async checkStatus() {
    const response = await garminApi.get(`/status`);
    return response.data;
  }

  // JSDoc comment for the getDailySummary static method
  /**
   * Get daily summary data for the logged-in user
   * @param {Date|string} targetDate - The date for which to retrieve the daily summary (default is today)
   */
  static async getDailySummary(targetDate = new Date()) {
    // Make a GET request to retrieve the daily summary for the specified date
    const response = await garminApi.get("/summary", {
      params: targetDate ? { target_date: formatDateToISO(targetDate) } : {},
    });
    return response.data;
  }

  // JSDoc comment for the getActivities static method
  /**
   * Get activities from most recent to least recent for the logged-in user
   * @param {Date|string} startDate // The start limit date for the fetched workouts (defaults to a month before the current date)
   * @param {Date|string} endDate // The end limit date for the fetched workouts (defaults to the current date)
   */
  static async getActivities(
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
  ) {
    // Make a GET request to retrieve all activities witthin a given range of activities
    const response = await garminApi.get("/activities", {
      params: {
        start_date: formatDateToISO(startDate),
        end_date: formatDateToISO(endDate),
      },
    });
    return response.data || [];
  }

  // JSDoc comment for the getTrainingPlans static method
  /**
   * Get every active training plan the user has
   */
  static async getTrainingPlans() {
    // Make a GET request to retrieve every training program
    const response = await garminApi.get("/training-plans");
    return response.data || [];
  }

  // JSDoc comment for the getWorkoutsInTimeRange static method
  /**
   * Get workouts in a given date range
   * @param {Date|string} startDate // The start limit date for the fetched workouts (defaults to the current date)
   * @param {Date|string} endDate // The end limit date for the fetched workouts (defaults to a week from the current date)
   * @param {string|number|null} trainingPlanId // Optional parameter to filter upcoming workouts according to their corresponding training plan
   */
  static async getWorkoutsInTimeRange(
    startDate = new Date(),
    endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    trainingPlanId = null,
  ) {
    // We define parameters outside of the get co we can modify them if the training plan is provided
    const params = {
        start_date: formatDateToISO(startDate),
        end_date: formatDateToISO(endDate),
      }
    // We add training plan id to the request params if it's provided
      if(trainingPlanId) {
        params.training_plan_id = trainingPlanId;
      }

    // Make a GET request to retrieve workouts for the specified date range
    const response = await garminApi.get("/workouts-in-time-range", { params });
    return response.data || [];
  }
}

export default GarminApi;
