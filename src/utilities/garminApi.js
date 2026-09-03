// Import all dependencies
import axios from 'axios';

const PORT = process.env.PORT || 8000;
const GARMIN_SERVICE_BASE_URL = `http://localhost:${PORT}/api/garmin`;

// Create an instance of axios with the base URL for the backend python port
const garminApi = axios.create({
  baseURL: GARMIN_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle errors in the response
garminApi.interceptors.response.use(
    response => response,
    error => {
        // Handle Network errors
        if (!error.response) {
            console.error(`[Garmin API Error]: Verify your internet connection.`);
            return Promise.reject(new Error('Garmin microservice is unreachable. Check that main.py is running on port 8000.'));
        }

        // Handle errors provided by the backend python port
        if (error.response?.data?.detail) {
            console.error(`[Garmin API Error ${error.response?.status}]:`, error.response.data.detail);
            return Promise.reject(new Error(error.response.data.detail));
        }

        // Handle any other errors
        return Promise.reject(error);
    }
);

// Functions that formats dates to ISO for the API
const formatDateToISO = (date) => {
    const d =date ? new Date(date) : new Date();
    if (isNaN(d.getTime())) {
        throw new Error(`Invalid date provided: ${date}`);
    }
    return d.toISOString().split('T')[0]; // Return only the date part in YYYY-MM-DD format
}

// Class containing static methods for interacting with the Garmin API
class GarminApi {
    // JSDoc comment for the getDailySummary static method
    /**
   * Get daily summary data for the logged-in user
   * @param {Date|string} targetDate - The date for which to retrieve the daily summary (default is today) 
   */
    static async getDailySummary(targetDate = new Date()) {
        try {
            // Make a GET request to retrieve the daily summary for the specified date
            const response = await garminApi.get('/summary', {
                params: targetDate ? { target_date: formatDateToISO(targetDate) } : {}
            });
            return response.data;
        } catch(error) { 
            // Log the error for the console with the corresponding static method
            console.error('Garmin API Error (getDailySummary):', error.response?.data || error.message);
            throw error;
        }
    }

    // JSDoc comment for the getActivities static method
    /**
   * Get activities from most recent to least recent for the logged-in user
   * @param {number} start - The starting index for the activities to retrieve (default is 0)
   * @param {number} limit - The maximum number of activities to retrieve (default is 10)
   */
    static async getActivities(start = 0, limit = 10) {
        try {
            // Make a GET request to retrieve all activities witthin a given range of activities
            const response = await garminApi.get('/activities', {
                params: { start, limit }
            });
            return response.data || [];
        } catch(error) {
            // Log the error for the console with the corresponding static method
            console.error('Garmin API Error (getActivities):', error.response?.data || error.message);
            throw error;
        }
    }
}

export default GarminApi;