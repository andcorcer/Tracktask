// Import all dependencies
import axios from 'axios';
import { store } from '../store/store';

// Create an instance of axios with the base URL for Google Tasks API
const googleTasksApi = axios.create({
  baseURL: 'https://tasks.googleapis.com/tasks/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the access token to the request headers upon request
googleTasksApi.interceptors.request.use(
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
googleTasksApi.interceptors.response.use(
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

// Class containing static methods for interacting with the Google Tasks API
class GoogleTasksApi {
    // JSDoc comment for the getTaskLists static method
    /**
   * Get all task lists owned by the logged-in user
   */
    static async getTaskLists() {
        try {
            // Make a GET request to retrieve all the task lists for the authenticated user
            const response = await googleTasksApi.get('/users/@me/lists');
            return response.data.items || [];
        } catch(error) { 
            // Log the error for the console with the corresponding static method
            console.error('Google Tasks API Error (getTaskLists):', error.response?.data || error.message);
            throw error;
        }
    }

    // JSDoc comment for the getTasksByTimeFrame static method
    /**
   * Get tasks using a specific task list and a date range
   * @param {Date|string} dueMin 
   * @param {Date|string} dueMax 
   * @param {string} listId - Target task list ID (default is '@default')
   */
    static async getTasksByTimeFrame(dueMin, dueMax, listId = '@default') {
        try {
            // Make a GET request to retrieve all tasks within a given timeframe and using a specific task list
            const response = await googleTasksApi.get(`/lists/${listId}/tasks`, {
                params: {
                    dueMin: formatDateToISO(dueMin),
                    dueMax: formatDateToISO(dueMax),
                    showCompleted: true,
                    showHidden: false,
                }
            });
            return response.data.items || [];
        } catch(error) {
            // Log the error for the console with the corresponding static method
            console.error('Google Tasks API Error (getTasksByTimeFrame):', error.response?.data || error.message);
            throw error;
        }
    }

    // JSDoc comment for the getTaskById static method
    /**
   * Get a single task item using its ID
   * @param {string} taskId 
   * @param {string} listId - Target task list ID (default is '@default') 
   */
  static async getTaskById(taskId, listId = '@default') {
    try {
        // Make a GET request to retrieve a single task item using its ID and a given task list
        const response = await googleTasksApi.get(`/lists/${listId}/tasks/${taskId}`);
        return response.data;
    } catch(error) {
        // Log the error for the console with the corresponding static method
        console.error('Google Tasks API Error (getTaskById):', error.response?.data || error.message);
        throw error;
    }
  }

  // JSDoc comment for the createTask static method
    /**
   * Create a new task item using a task list
   * @param {Object} taskData - The task data to be created {title, notes, due}
   * @param {string} listId - Target task list ID (default is '@default') 
   */
  static async createTask(taskData, listId = '@default') {
    try {
        // Make a POST request to create a new task item using provided content and a given task list
        const response = await googleTasksApi.post(`/lists/${listId}/tasks`, taskData);
        return response.data;
    } catch(error) {
        // Log the error for the console with the corresponding static method
        console.error('Google Tasks API Error (createTask):', error.response?.data || error.message);
        throw error;
    }
  }
}

export default GoogleTasksApi;