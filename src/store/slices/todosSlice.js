// Import all dependencies
import { createSlice } from "@reduxjs/toolkit";

// Location in the local storage where the todos will be stored
const LOCAL_STORAGE_KEY = "tracktask_app_todos";

// Helper function to get todos from the local storage
const loadTodosFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : []; // Return an empty array if no todo list is found
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
            : currentMax,
        0,
      );
      const newTodo = {
        id: maxId + 1,
        category: action.payload.category || "General",
        data: action.payload.data,
        isDaily: action.payload.isDaily || false,
        completed: false, // For non recurring todos
        completedDates: {}, // For daily todos
        createdAt: new Date(action.payload.date).toISOString().split("T")[0],
        archivedAt: null, // Date for when a todo is deleted to preserve past completion history
      };
      state.items.push(newTodo); // Add the item to the todos
      saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
    },

    toggleTodo: (state, action) => {
      const { id, date } = action.payload;
      const todo = state.items.find((todo) => todo.id === id); // We get the desired todo using it's id
      if (todo) {
        // Handle Daily Todos toggle
        if (todo.isDaily) {
          todo.completedDates[date]
            ? delete todo.completedDates[date]
            : (todo.completedDates[date] = true);
        } else {
          // Handle non recurring todos
          todo.completed = !todo.completed;
        }
      }
      saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
    },

    deleteTodo: (state, action) => {
      const todo = state.items.find((todo) => todo.id === action.payload); // We get the desired todo using it's id
      if (todo) {
        todo.archivedAt = new Date().toISOString().split("T")[0]; // We archive the todo to be able to show it before it was deleted
        saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
      }
    },

    restoreTodo: (state, action) => {
      const todo = state.items.find((todo) => todo.id === action.payload); // We get the desired todo using it's id
      if (todo) {
        todo.archivedAt = null;
        saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
      }
    },

    clearTodos: (state) => {
      const currentDate = new Date().toISOString().split("T")[0];
      state.items.forEach((todo) => {
        if (!todo.archivedAt) todo.archivedAt = currentDate;
      });
      saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
    },

    deleteTodosPermanently: (state) => {
      state.items = [];
      saveTodosToLocalStorage(state.items); // Save the updated todos state to localStorage
    },
  },
});

// Export actions and reducer
export const {
  createTodo,
  toggleTodo,
  deleteTodo,
  restoreTodo,
  clearTodos,
  deleteTodosPermanently,
} = todosSlice.actions;
export default todosSlice.reducer;
