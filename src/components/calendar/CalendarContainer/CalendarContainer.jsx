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
  let end = new Date(date);

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

      // Get the first day of the current month
      const firstDayOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);

      // We move to the start of the week that contains the first day of the month
      start.setTime(firstDayOfMonth.getTime()); // We equal times so that we don't go over or under
      start.setDate(start.getDate() - start.getDay()); // Move to the start of the week containing the first day of the month
      start.setHours(0, 0, 0, 0); // Set the start time to the beginning of the day

      // Get the last day in the 6 * 7 grid
      end = new Date(start);
      end.setDate(start.getDate() + 41); // Set to the last day in the 6 * 7 grid (42 days total)
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

  const date = useSelector((state) => state.date.selectedDate);
  const selectedDate = useMemo(() => new Date(date), [date]);

  const [viewMode, setViewMode] = useState(
    isHomePage ? "day" : initialViewMode,
  ); // Local state to handle the view mode

  // Get the date range for the current view mode
  const viewRange = isHomePage ? "day" : viewMode;
  const { startDate, endDate } = useMemo(() => getDateRange(selectedDate, viewRange), [selectedDate, viewRange]);

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
    const newDate = new Date(selectedDate);
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
  const handleViewModeChange = (mode, selectedDate) => {
    if (!isHomePage) {
      setViewMode(mode);
      if (selectedDate) {
        dispatch(
          setSelectedDate({
            selectedDate: selectedDate.toISOString().split("T")[0],
          }),
        );
      }
    }
  };

  // Function to render the corresponding calendar view based on the current view mode
  const renderCalendarView = () => {
    switch (viewMode) {
      case "day":
        return <DayView selectedDate={selectedDate} />;
      case "week":
        return <WeekView selectedDate={selectedDate} onViewChange={handleViewModeChange} />;
      case "month":
        return <MonthView selectedDate={selectedDate} onViewChange={handleViewModeChange} />;
      default:
        return <DayView selectedDate={selectedDate} />;
    }
  };

  return (
    <div className="calendar-container">
      <CalendarHeader
        date={selectedDate}
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