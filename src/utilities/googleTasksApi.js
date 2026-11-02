// Import all dependencies
import axios from "axios";

// Variable to hold the token provider
let tokenProvider = null;

export const setTasksTokenProvider = (provider) => {
  tokenProvider = provider;
};

// Create an instance of axios with the base URL for Google Tasks API
const googleTasksApi = axios.create({
  baseURL: "https://tasks.googleapis.com/tasks/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add the access token to the request headers upon request
googleTasksApi.interceptors.request.use(
  (config) => {
    if (tokenProvider) {
      const token = tokenProvider();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor to handle errors in the response
googleTasksApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Network errors
    if (!error.response) {
      console.error(
        "[Google Tasks API Error]: Verify your internet connection.",
      );
      return Promise.reject(
        new Error("Google Tasks API is unreachable. Check your connection"),
      );
    }
    // Handle Authentication errors
    if (error.response?.status === 401) {
      console.warn(
        "[Google Tasks API Error]: Access token may have expired. Please re-authenticate.",
      );
      return Promise.reject(
        new Error("Google session has expired. Please log in"),
      );
    }

    console.error(
      `[Google Tasks API Error ${error.response?.status}]: ${error.response?.data?.error?.message}`,
    );
    return Promise.reject(
      new Error(
        error.response?.data?.error?.message ||
          "Unknown error, please try again.",
      ),
    );
  },
);

// Helper to get YYYY-MM-DD from any date input in local time
const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Class containing static methods for interacting with the Google Tasks API
class GoogleTasksApi {
  // JSDoc comment for the getTaskLists static method
  /**
   * Get all task lists owned by the logged-in user
   */
  static async getTaskLists() {
    // Make a GET request to retrieve all the task lists for the authenticated user
    const response = await googleTasksApi.get("/users/@me/lists");
    return response.data.items || [];
  }

  // JSDoc comment for the getTasksByTimeFrame static method
  /**
   * Get tasks using a specific task list and a date range
   * @param {Date|string} dueMin
   * @param {Date|string} dueMax
   * @param {string} listId - Target task list ID (default is '@default')
   */
  static async getTasksByTimeFrame(dueMin, dueMax, listId = "@default") {
    const params = {
      showCompleted: true,
      showHidden: false,
    };

    // Make a GET request to retrieve all tasks within a given timeframe and using a specific task list
    const response = await googleTasksApi.get(`/lists/${listId}/tasks`, {
      params,
    });

    const items = response.data.items || [];

    if (dueMin || dueMax) {
      const minTimeStr = dueMin ? getLocalDateString(dueMin) : null;
      const maxTimeStr = dueMax ? getLocalDateString(dueMax) : null;

      return items.filter((task) => {
        if (!task.due) return false;
        const dateStr = task.due.split("T")[0];

        // We check if the task falls outside the specified date range
        if (minTimeStr && dateStr < minTimeStr) return false;
        if (maxTimeStr && dateStr > maxTimeStr) return false;

        // If none of the above conditions are met, the task is within the specified date range
        return true;
      });
    }

    return items;
  }

  // JSDoc comment for the getTaskById static method
  /**
   * Get a single task item using its ID
   * @param {string} taskId
   * @param {string} listId - Target task list ID (default is '@default')
   */
  static async getTaskById(taskId, listId = "@default") {
    // Make a GET request to retrieve a single task item using its ID and a given task list
    const response = await googleTasksApi.get(
      `/lists/${listId}/tasks/${taskId}`,
    );
    return response.data;
  }

  // JSDoc comment for the createTask static method
  /**
   * Create a new task item using a task list
   * @param {Object} taskData - The task data to be created {title, notes, due}
   * @param {string} listId - Target task list ID (default is '@default')
   */
  static async createTask(taskData, listId = "@default") {
    // Make a POST request to create a new task item using provided content and a given task list
    const response = await googleTasksApi.post(
      `/lists/${listId}/tasks`,
      taskData,
    );
    return response.data;
  }

  // JSDoc comment for the toggleTask static method
  /**
   * Toggled the current state for a given task
   * @param {string} taskId
   * @param {boolean} isCompleted - Current status of the task
   * @param {string} listId - Target task list ID (default is '@default')
   */
  static async toggleTask(taskId, isCompleted, listId = "@default") {
    // Get the current status of the task using the 'isCompleted' variable
    const status = isCompleted ? "completed" : "needsAction";
    // Make a PATCH request to modify the status of the given task
    const response = await googleTasksApi.patch(
      `/lists/${listId}/tasks/${taskId}`,
      { status },
    );
    return response.data;
  }
}

export default GoogleTasksApi;
