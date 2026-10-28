// Import all dependencies
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CalendarList from "../../components/lists/CalendarList/CalendarList";

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

  const dateString = parseLocalDate(date).toLocaleDateString("en-US");

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
      <aside className="calendar-page-aside">
        {viewMode === "day" && (
          <>
            {/* Sidebar for Todos */}
            <div className="calendar-sidebar calendar-todos-container">
              <h3 className="calendar-sidebar-title calendar-todos-title">Todos for {dateString}</h3>
              <TodoList date={date} />
            </div>
          </>
        )}

        {/* Sidebar for Calendar Lists */}
        <div className="calendar-sidebar calendar-event-lists-container">
          <h3 className="calendar-sidebar-title calendar-lists-title">
            Calendar Lists
          </h3>
          <CalendarList type="calendarList" itemsLimit={5} />
        </div>

        {/* Sidebar for Task Lists */}
        <div className="calendar-sidebar calendar-task-lists-container">
          <h3 className="calendar-sidebar-title calendar-task-lists-title">Task Lists</h3>
          <CalendarList type="taskList" itemsLimit={5} />
        </div>
      </aside>
    </div>
  );
};

// Export the CalendarPage component
export default CalendarPage;
