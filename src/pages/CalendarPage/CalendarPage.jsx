// Import all dependencies
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

// Import Components
import CalendarContainer from "../../components/calendar/CalendarContainer/CalendarContainer";
import TodoList from "../../components/lists/TodoList/TodoList";

// Import Styles
import "./CalendarPage.css";

// Import Actions
import { setSelectedDate } from "../../store/slices/dateSlice";

const formatLocalDate = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Function that parses a date to local time
const parseLocalDate = (date) => {
  if (!date) return new Date();
  const [year, month, day] = date.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
};  

// CalendarPage Component
const CalendarPage = () => {
  const dispatch = useDispatch();
  // Local state for the view mode
  const [viewMode, setViewMode] = useState("month");

  // Get the current date from the Redux store
  const date = useSelector((state) => state.date.selectedDate);

  const dateString = parseLocalDate(date).toLocaleDateString('en-US'); 

  // Handler to change the view mode
  const handleViewModeChange = (mode, newDate) => {
    setViewMode(mode);
    if (newDate) {
      dispatch(setSelectedDate({ selectedDate: formatLocalDate(newDate) }));
    }
  };

  return (
    <div
      className={`calendar-page-container ${viewMode === "day" ? "day-view" : ""}`}
    >
      {/* Main Calendar Content */}
      <main className="calendar-page-main">
        <CalendarContainer
          viewMode={viewMode}
          onViewChange={handleViewModeChange}
        />
      </main>

      {/* Other Sidebar Content */}
      { viewMode === "day" && (
        <aside className="calendar-page-aside">
          <div className="calendar-todos-container">
            <h3 className="calendar-todos-date">Todos for {dateString}</h3>
            <TodoList date={date} />
          </div>
        </aside>
      )}
    </div>
  );
};

// Export the CalendarPage component
export default CalendarPage;
