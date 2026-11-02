// Import all dependencies
import React, { useState, useEffect } from "react";
import {
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Import Components
import Layout from "../layout/Layout/Layout";

// Import Pages
import HomePage from "../../pages/HomePage/HomePage";
import NotFoundPage from "../../pages/NotFoundPage/NotFoundPage";
import HealthPage from "../../pages/HealthPage/HealthPage";
import SettingsPage from "../../pages/SettingsPage/SettingsPage";
import TodosPage from "../../pages/TodosPage/TodosPage";
import CalendarPage from "../../pages/CalendarPage/CalendarPage";

// App Component
function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("tracktask-theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Effect to update the theme in localStorage and update css whenever it changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("tracktask-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("tracktask-theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Create the router
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="todos" element={<TodosPage />} />
        <Route
          path="settings"
          element={<SettingsPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
        />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
}

export default App;
