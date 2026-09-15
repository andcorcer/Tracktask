// Import all dependencies
import { createSlice } from "@reduxjs/toolkit";
import { max } from "date-fns";

// Location in the local storage where the todos will be stored
const LOCAL_STORAGE_KEY = "tracktask_app_todos";

// Helper function to get todos from the local storage
const loadTodosFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : []; // Return an empty array if no watchlist is found
  } catch (error) {
    console.error("Could not load todos from localStorage", error);
    return [];
  }
};

// Helper function to save a todo to the local storage
const saveTodosToLocalStorage = (todo) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todo)); // Saves the todo to localStorage as a JSON string
  } catch (error) {
    console.error("Could not save todo to localStorage", error);
  }
};

// Initial State
const initialState = {
  items: loadTodosFromLocalStorage(), // Load todos from localStorage if not saved yet initialize with an empty array
};

// SLICE DEFINITION

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    createTodo: (state, action) => {
      const maxId = state.items.reduce(
        (currentMax, currentItem) =>
          typeof currentItem.id === "number" && currentMax < currentItem.id
            ? currentItem.id
            : max,
        0,
      );
      const newTodo = {
        id: maxId + 1,
        category: action.payload.category || "General",
        data: action.payload.data,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      state.items.push(newTodo); // Add the item to the todos
      saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
    },

    toggleTodo: (state, action) => {
      const todo = state.items.find((todo) => todo.id === action.payload); // We get the todo to toggle
      if (todo) todo.completed = !todo.completed; // We toggle the todo to the opposite value
      saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
    },

    deleteTodo: (state, action) => {
      state.items = state.items.filter((todo) => todo.id !== action.payload); // We create a new todo list without the desired todo to remove
      saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
    },

    clearTodos: (state) => {
      state.items = []; // We clear all todos
      saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
    },
  },
});

// Export actions and reducer
export const { createTodo, toggleTodo, deleteTodo, clearTodos } =
  todosSlice.actions;
export default todosSlice.reducer;
