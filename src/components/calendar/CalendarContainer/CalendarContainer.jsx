// Import all dependencies
import React, { useState } from "react";
import { X } from "lucide-react";

// Import Components
import CalendarHeader from "../CalendarHeader/CalendarHeader";
import DayView from "../DayView/DayView";
import WeekView from "../WeekView/WeekView";
import MonthView from "../MonthView/MonthView"; 

// Import Styles
import "./CalendarContainer.css";

// CalendarContainer Component
const CalendarContainer = ({ isHomePage = false, initialViewMode = "day" }) => {

   // Local States

   const [viewMode, setViewMode] = useState(isHomePage ? "day" : initialViewMode); // Local state to handle the view mode
   const [currentDate, setCurrentDate] = useState(new Date()); // Local state to handle the current date in the calendar

  // Handlers

  // Navigation handler for the calendar (e.g., next/previous month, week, or day)
  const handleNavigation = (direction) => {
   setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      // Handle "today" navigation 
      if (direction === "today") return new Date();

      // Handle "next" and "prev" navigation
      if (direction === "next") {
        if (viewMode === "day") newDate.setDate(newDate.getDate() + 1);
        else if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
        else if (viewMode === "month") newDate.setMonth(newDate.getMonth() + 1);
      }
      else if (direction === "prev") {
        if (viewMode === "day") newDate.setDate(newDate.getDate() - 1);
        else if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
        else if (viewMode === "month") newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
   }); 
  };

  // View mode change handler
  const handleViewModeChange = (mode) => {
    if (!isHomePage) setViewMode(mode);
  };

  // Function to render the corresponding calendar view based on the current view mode
  const renderCalendarView = () => {
    switch (viewMode) {
      case "day":
        return <DayView currentDate={currentDate} />;
      case "week":
        return <WeekView currentDate={currentDate} />;
      case "month":
        return <MonthView currentDate={currentDate} />;
      default:
        return <DayView currentDate={currentDate} />;
    }
  };

  return (
    <div className="calendar-container">
      <CalendarHeader
        date={currentDate}
        isHomePage={isHomePage}
        viewMode={viewMode}
        onViewChange={handleViewModeChange}
        onNavigate={handleNavigation}
      />
      <div className="calendar-body">{renderCalendarView()}</div>
    </div>
  );
};

// Export the CalendarContainer component
export default CalendarContainer;
