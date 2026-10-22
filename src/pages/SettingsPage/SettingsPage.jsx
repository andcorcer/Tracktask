// Import all dependencies
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  FileTerminal,
  Sun,
  Moon,
} from "lucide-react";

// Import Actions
import { deleteTodosPermanently } from "../../store/slices/todosSlice";
import {
  checkGarminStatus,
  loginGarminUser,
  logoutGarmin,
  setGoogleAuthenticationCredentials,
  logoutGoogle,
} from "../../store/slices/authenticationSlice";
import {
  clearSelections as clearGarminSelections,
  clearGarminDataError,
} from "../../store/slices/garminSlice";
import { clearSelections as clearGoogleSelections } from "../../store/slices/calendarSlice";

// Import Styles
import "./SettingsPage.css";

// Google Authentication Configuration
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES =
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks";

// SettingsPage Component
const SettingsPage = () => {
  const dispatch = useDispatch();

  // Get states from the Redux store
  const garminAuthenticationStatus = useSelector(
    (state) => state.authentication.garmin.status || "disconnected",
  );
  const googleAuthenticationStatus = useSelector(
    (state) => state.authentication.google.status || "disconnected",
  );

  // Local states
  const [garminEmail, setGarminEmail] = useState("");
  const [garminPassword, setGarminPassword] = useState("");

  // Local state to check if the python backend is running
  const [backendConnectionStatus, setBackendConnectionStatus] = useState(null);

  // Local state to set the theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("tracktask-theme") === "dark";
  });

  // Variable that maintains a reference to the Google token client
  const tokenClientRef = useRef(null);

  // Dispatch the garmin status on mount
  useEffect(() => {
    dispatch(checkGarminStatus());
  }, [dispatch]);

  // Effect to initialize the Google token client
  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            dispatch(
              setGoogleAuthenticationCredentials({
                accessToken: response.access_token,
              }),
            );
          }
        },
      });
    }
  }, []);

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

  // Handler functions
  const handleGarminLogin = (e) => {
    e.preventDefault();
    dispatch(loginGarminUser({ email: garminEmail, password: garminPassword }));
    console.log("Logging into Garmin with:", garminEmail);
  };

  const handleGarminLogout = () => {
    dispatch(logoutGarmin());
    dispatch(clearGarminSelections());
  };

  const handleGooglePopUpLogin = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    } else {
      alert("Google Pop up failed to load, please try again.");
    }
  };

  const handleGoogleLogout = () => {
    dispatch(logoutGoogle());
    dispatch(clearGoogleSelections());
  };

  // Handle permanent deletion of todos and cache liberation
  const handleDeletePermanently = () => {
    dispatch(deleteTodosPermanently());
    localStorage.removeItem("tracktask_app_todos");
  };

  // Test backend connection
  const testBackendConnection = async () => {
    setBackendConnectionStatus("checking");
    try {
      const response = await fetch("http://localhost:8000/");
      if (response.ok) {
        setBackendConnectionStatus("online");
        // Inmediate check of Garmin status after confirming backend is online
        dispatch(checkGarminStatus());
      } else {
        setBackendConnectionStatus("offline");
      }
    } catch (error) {
      setBackendConnectionStatus("offline");
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className="settings-page-container">
      <header className="settings-page-header">
        <h2>Settings and Preferences</h2>
        <p>
          Manage external microservice, authentication, and application
          settings.
        </p>
      </header>

      <div className="settings-grid">
        {/* Google Integration Section */}
        <section className="settings-card">
          <div className="card-header">
            <h3>Google Authentication</h3>
            <span className={`status-badge ${googleAuthenticationStatus}`}>
              {googleAuthenticationStatus === "connected" ? (
                <>
                  <ShieldCheck />
                  Connected
                </>
              ) : (
                <>
                  <ShieldAlert /> Disconnected
                </>
              )}
            </span>
          </div>

          <div className="card-body">
            <p className="card-description">
              Connect your Google account to enable synchronization with Google
              services (Google Tasks and Google Calendar).
            </p>
            {googleAuthenticationStatus === "connected" ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleGoogleLogout}
              >
                <LogOut size={16} />
                Logout from Google
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGooglePopUpLogin}
              >
                <LogIn size={16} />
                Login with Google
              </button>
            )}
          </div>
        </section>

        {/* Garmin Integration and Microservice Section */}
        <section className="settings-card">
          <div className="card-header">
            <h3>Garmin Authentication</h3>
            <span className={`status-badge ${garminAuthenticationStatus}`}>
              {garminAuthenticationStatus === "connected" ? (
                <>
                  <ShieldCheck />
                  Connected
                </>
              ) : (
                <>
                  <ShieldAlert /> Disconnected
                </>
              )}
            </span>
          </div>

          <div className="card-authentication-body">
            <p className="card-description">
              Connect your Garmin account to enable synchronization services.
            </p>
            {garminAuthenticationStatus === "connected" ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleGarminLogout}
              >
                <LogOut size={16} />
                Logout from Garmin
              </button>
            ) : (
              <form className="autentication-form">
                <label htmlFor="garmin-email">Email</label>
                <input
                  type="email"
                  id="garmin-email"
                  value={garminEmail}
                  onChange={({ target }) => setGarminEmail(target.value)}
                  placeholder="Garmin email"
                  required
                />

                <label htmlFor="garmin-password">Password</label>
                <input
                  type="password"
                  id="garmin-password"
                  value={garminPassword}
                  onChange={({ target }) => setGarminPassword(target.value)}
                  placeholder="Garmin password"
                  required
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleGarminLogin}
                >
                  <LogIn size={16} />
                  Login with Garmin
                </button>
              </form>
            )}
          </div>
          <div className="card-microservice-body">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={testBackendConnection}
            >
              <FileTerminal size={16} />
              Check Python Microservice
            </button>
            {backendConnectionStatus && (
              <span>
                {backendConnectionStatus === "checking"
                  ? "Checking port 8000"
                  : backendConnectionStatus === "online"
                    ? "Python Microservice Connected on port 8000"
                    : "Python Microservice Disconnected, Verify that main.py is running"}
              </span>
            )}
          </div>
        </section>

        {/* Theme Section */}
        <section className="settings-card">
          <div className="card-header">
            <h3>Theme / Appearance</h3>
          </div>

          <div className="card-body">
            <p className="card-description">
              Customize the appearance of the application by selecting your
              preferred theme.
            </p>

            <span className="toggle-label">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span className="toggle-text">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </span>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </div>
        </section>

        {/* Clear Garmin Data and cache */}
        <section className="settings-card">
          <div className="card-header">
            <h3>Data & maintenance</h3>
          </div>

          <div className="card-body">
            <p className="card-description">
              Clear the local storage memory
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDeletePermanently}
            >
              Clear Cache
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

// Export the SettingsPage component
export default SettingsPage;
