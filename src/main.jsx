// Import all dependencies
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Import Components
import App from "./components/App/App.jsx";

// Import Store
import { store } from "./store/store.js";

// Import Styles
import "./index.css";

// Save the client id from the environment variable to a constant
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


// Render the app in the root element of the HTML document, wrapping it with StrictMode, Provider for Redux store, and GoogleOAuthProvider for Google OAuth functionality.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
);
