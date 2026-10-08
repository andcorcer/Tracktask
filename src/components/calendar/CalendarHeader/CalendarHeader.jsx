// Import all dependencies
import React, { useState } from "react";
import { CircleChevronRight, CircleChevronLeft, Calendar, CalendarDays, CalendarRange } from "lucide-react";

// Import Styles
import "./CalendarHeader.css";

// Function to get the week range for a given date
const getWeekRange = (providedDate) => {
  const date = new Date(providedDate);

  // Calculate the start date of the week (Sunday)
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - date.getDay());

  // Calculate the end date of the week (Saturday)
  const endDate = new Date(date);
  endDate.setDate(date.getDate() + (6 - date.getDay()));

  // Format start date
  const startDay = String(startDate.getDate()).padStart(2, "0");
  const startMonth = startDate.toLocaleDateString("en-US", {
    month: "2-digit",
  });

  // Format end date
  const endDay = String(endDate.getDate()).padStart(2, "0");
  const endMonth = endDate.toLocaleDateString("en-US", { month: "2-digit" });
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

// CalendarHeader Component
const CalendarHeader = ({
  date = new Date(),
  isHomePage = false,
  onViewChange,
  onNavigate,
}) => {
  // Local state to handle the view mode
  const [viewMode, setViewMode] = useState("day"); // Default view mode is "day"

  // Handlers
  const handleViewModeChange = (mode) => {
    if (isHomePage) return; // Prevent changing view mode on the home page
    setViewMode(mode);
    onViewChange?.(mode); // Notify parent component of the view mode change
  };

  return (
    <header className="calendar-header">
      {/* Date Actions */}
      <div className="header-navigation">
        <button
          type="button"
          className="btn today-btn"
          onClick={() => onNavigate?.("today")}
        >
          Today
        </button>

        <div className="nav-arrows">
          <button
            type="button"
            className="btn nav-btn"
            onClick={() => onNavigate?.("prev")}
          >
            <CircleChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="btn nav-btn"
            onClick={() => onNavigate?.("next")}
          >
            <CircleChevronRight size={20} />
          </button>
        </div>

        <h2 className="calendar-header-title">
          {viewMode === "week"
            ? getWeekRange(date)
            : date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
                ...(viewMode === "day" && { day: "2-digit" }),
              })}
        </h2>
      </div>

      {/* View Mode Switcher */}
      <div
        className="view-mode-switcher"
        role="radiogroup"
        aria-label="Calendar View Options"
      >
        <button
          type="button"
          className={`btn view-btn ${viewMode === "day" ? "active" : ""}`}
          onClick={() => handleViewModeChange("day")}
        >
          <Calendar size={16} />
          <span>Day</span>
        </button>
        <button
          type="button"
          className={`btn view-btn ${viewMode === "week" ? "active" : ""}`}
          onClick={() => handleViewModeChange("week")}
        >
          <CalendarDays size={16} />
          <span>Week</span>
        </button>
        <button
          type="button"
          className={`btn view-btn ${viewMode === "month" ? "active" : ""}`}
          onClick={() => handleViewModeChange("month")}
        >
          <CalendarRange size={16} />
          <span>Month</span>
        </button>
      </div>
    </header>
  );
};

// Export the CalendarHeader component
export default CalendarHeader;
