// Import all dependencies
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

// Import Components
import CalendarHeader from "../CalendarHeader/CalendarHeader";
import DayView from "../DayView/DayView";
import WeekView from "../WeekView/WeekView";
import MonthView from "../MonthView/MonthView";

// Import Actions
import {
  fetchTasks,
  fetchCalendarEvents,
} from "../../../store/slices/calendarSlice";
import { setSelectedDate, setDateRange } from "../../../store/slices/dateSlice";
import {
  fetchActivitiesInTimeRange,
  fetchUpcomingWorkouts,
} from "../../../store/slices/garminSlice";

// Import Styles
import "./CalendarContainer.css";

// Function to get the display format for the container component using the current date based on the view mode
const getDateRange = (date, viewMode) => {
  const start = new Date(date);
  const end = new Date(date);

  switch (viewMode) {
    case "day":
      // Set the start and end times for the day view
      start.setHours(0, 0, 0, 0); // Set the start time to the beginning of the day
      end.setHours(23, 59, 59, 999); // Set the end time to the end of the day
      break;
    case "week":
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek); // Sunday as the first day of the week
      start.setHours(0, 0, 0, 0); // Set the start time to the beginning of the day
      end.setDate(start.getDate() + 6); // Saturday as the last day of the week
      end.setHours(23, 59, 59, 999); // Set the end time to the end of the week
      break;
    case "month":
      start.setDate(1); // Set to the first day of the month
      start.setHours(0, 0, 0, 0); // Set the start time to the beginning of the day
      end.setMonth(start.getMonth() + 1);
      end.setDate(0); // Set to the last day of the previous month (effectively the last day of the current month)
      end.setHours(23, 59, 59, 999); // Set the end time to the end of the day
      break;
    default:
      break;
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

// CalendarContainer Component
const CalendarContainer = ({ isHomePage = false, initialViewMode = "day" }) => {
  const dispatch = useDispatch(); // Redux dispatch function

  const selectedDate = useSelector((state) => state.date.selectedDate);
  const currentDate = useMemo(() => new Date(selectedDate), [selectedDate]);

  const [viewMode, setViewMode] = useState(
    isHomePage ? "day" : initialViewMode,
  ); // Local state to handle the view mode

  // Get the date range for the current view mode
  const viewRange = isHomePage ? "day" : viewMode;
  const { startDate, endDate } = useMemo(() => getDateRange(currentDate, viewRange), [currentDate, viewRange]);

  // Call all async thunks whenever the date range changes
  useEffect(() => {
    dispatch(setDateRange({ startDate, endDate }));
    dispatch(fetchTasks({ dueMin: startDate, dueMax: endDate }));
    dispatch(fetchCalendarEvents({ timeMin: startDate, timeMax: endDate }));
    dispatch(fetchActivitiesInTimeRange({ startDate, endDate }));
    dispatch(fetchUpcomingWorkouts({ startDate, endDate }));
  }, [startDate, endDate, dispatch]);

  // Handlers

  // Navigation handler for the calendar (e.g., next/previous month, week, or day)
  const handleNavigation = (direction) => {
    const newDate = new Date(currentDate);
    // Handle "today" navigation
    if (direction === "today") {
      dispatch(
        setSelectedDate({
          selectedDate: new Date().toISOString().split("T")[0],
        }),
      );
      return;
    }

    // Handle "next" and "prev" navigation
    if (direction === "next") {
      if (viewMode === "day") newDate.setDate(newDate.getDate() + 1);
      else if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
      else if (viewMode === "month") newDate.setMonth(newDate.getMonth() + 1);
    } else if (direction === "prev") {
      if (viewMode === "day") newDate.setDate(newDate.getDate() - 1);
      else if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
      else if (viewMode === "month") newDate.setMonth(newDate.getMonth() - 1);
    }
    dispatch(
      setSelectedDate({ selectedDate: newDate.toISOString().split("T")[0] }),
    );
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
      <main className="calendar-body">{renderCalendarView()}</main>
    </div>
  );
};

// Export the CalendarContainer component
export default CalendarContainer;
