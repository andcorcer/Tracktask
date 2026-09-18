// Import all dependencies
import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Settings } from "lucide-react";

// Import Styles
import "./Navbar.css";

// Navbar Component
const Navbar = () => {
  // We check connectivity for both APIs
  const isGarminConnected = useSelector(
    (state) => state.authentication?.garmin?.status === "connected",
  );
  const isGoogleConnected = useSelector(
    (state) => state.authentication?.google?.status === "connected",
  );

  return (
    <nav className="navbar">

      <NavLink
        to="/calendar"
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      >
        Calendar
      </NavLink>

      <NavLink
        to="/health"
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      >
        Health
      </NavLink>

      <NavLink
        to="/todos"
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      >
        Todos
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `nav-link settings-link ${isActive ? "active" : ""}`
        }
      >
        <Settings className="settings-icon" />
        {/* empty span to show connection status */}
        <span
          className={`status-dot ${isGarminConnected && isGoogleConnected ? "connected" : "disconnected"}`}
          aria-label={
            isGarminConnected && isGoogleConnected
              ? "Logged in with both accounts"
              : "Need to log in"
          }
        ></span>
      </NavLink>

    </nav>
  );
};

// Export the Navbar component
export default Navbar;
