// Import all dependencies
import React from "react";
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

// Create the router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} >
      <Route index element={<HomePage />} />
      <Route path="health" element={<HealthPage />} />
      <Route path="todos" element={<TodosPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

// App Component
function App() {
  return <RouterProvider router={router} />;
}

export default App;
