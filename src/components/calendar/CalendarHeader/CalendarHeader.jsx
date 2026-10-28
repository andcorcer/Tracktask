// Import all dependencies
import React from "react";
import {
  CircleChevronRight,
  CircleChevronLeft,
  Calendar,
  CalendarDays,
  CalendarRange,
} from "lucide-react";

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
    month: "short",
  });

  // Format end date
  const endDay = String(endDate.getDate()).padStart(2, "0");
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

// CalendarHeader Component
const CalendarHeader = ({
  date = new Date(),
  isHomePage = false,
  viewMode = "day",
  onViewChange,
  onNavigate,
  handleOpenInput,
}) => {
  return (
    <header className={`calendar-header ${!isHomePage ? "not-home-page" : "home-page"}`}>
      <div className="calendar-header-date">
        {/* View Mode Switcher (only when not on the home page) */}
        {!isHomePage && (
          <div
            className="view-mode-switcher"
            role="radiogroup"
            aria-label="Calendar View Options"
          >
            <button
              type="button"
              className={`btn view-btn ${viewMode === "day" ? "active" : ""}`}
              onClick={() => onViewChange("day")}
            >
              <Calendar size={16} />
              <span>Day</span>
            </button>
            <button
              type="button"
              className={`btn view-btn ${viewMode === "week" ? "active" : ""}`}
              onClick={() => onViewChange("week")}
            >
              <CalendarDays size={16} />
              <span>Week</span>
            </button>
            <button
              type="button"
              className={`btn view-btn ${viewMode === "month" ? "active" : ""}`}
              onClick={() => onViewChange("month")}
            >
              <CalendarRange size={16} />
              <span>Month</span>
            </button>
          </div>
        )}

        {/* Date Actions */}
        <div className="date-navigation">
          <h2 className="calendar-header-title">
            {viewMode === "week"
              ? getWeekRange(date)
              : date.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  ...(viewMode === "day" && { day: "2-digit" }),
                })}
          </h2>
          <div className="nav-controls">
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
          </div>
        </div>
      </div>

      {/* Add Calendar Item Button */}
      <div className="add-calendar-item-button">
        <button
          type="button"
          className="btn add-calendar-item-btn"
          onClick={handleOpenInput}
        >
          Add Calendar Item
        </button>
      </div>
    </header>
  );
};

// Export the CalendarHeader component
export default CalendarHeader;
