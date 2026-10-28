// Import all dependencies
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

// Import Components
import Modal from "../../details/Modal/Modal";
import CalendarInput from "../../inputs/CalendarInput/CalendarInput";
import CalendarHeader from "../CalendarHeader/CalendarHeader";
import DayView from "../DayView/DayView";
import WeekView from "../WeekView/WeekView";
import MonthView from "../MonthView/MonthView";

// Import Actions
import {
  fetchTasks,
  fetchCalendarEvents,
  fetchTaskLists,
  fetchCalendarLists,
} from "../../../store/slices/calendarSlice";
import { setSelectedDate, setDateRange } from "../../../store/slices/dateSlice";
import {
  fetchActivitiesInTimeRange,
  fetchUpcomingWorkouts,
} from "../../../store/slices/garminSlice";

// Import Styles
import "./CalendarContainer.css";

// Function that gets the local current date
const getLocalCurrentDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Function that safely parses a date string into a local Date object
const parseLocalDate = (date) => {
  if (!date) return getLocalCurrentDate();
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Function that safely formats a local Date object into "YYYY-MM-DD" format
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
      const firstDayOfMonth = new Date(
        start.getFullYear(),
        start.getMonth(),
        1,
      );

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
const CalendarContainer = ({
  isHomePage = false,
  viewMode = "day",
  onViewChange,
}) => {
  const dispatch = useDispatch();

  const date = useSelector((state) => state.date.selectedDate);
  const selectedDate = useMemo(() => parseLocalDate(date), [date]);

  // Local state to render the TodoInput component conditionally
  const [showInput, setShowInput] = useState(false);
  const [entryTimes, setEntryTimes] = useState(null);

  // Get the date range for the current view mode
  const viewRange = isHomePage ? "day" : viewMode;
  const { startDate, endDate } = useMemo(
    () => getDateRange(selectedDate, viewRange),
    [selectedDate, viewRange],
  );

  // Get all calendar and task lists whenever the component re-renders
  useEffect(() => {
    dispatch(fetchTaskLists());
    dispatch(fetchCalendarLists());
  }, [dispatch]);

  // Call all async thunks whenever the date range changes
  useEffect(() => {
    dispatch(setDateRange({ startDate, endDate }));
    dispatch(fetchTasks({ dueMin: startDate, dueMax: endDate }));
    dispatch(fetchCalendarEvents({ timeMin: startDate, timeMax: endDate }));
    dispatch(fetchActivitiesInTimeRange({ startDate, endDate }));
    dispatch(fetchUpcomingWorkouts({ startDate, endDate }));
  }, [startDate, endDate, dispatch]);

  // Handlers

  const handleOpenInput = (timestamp) => {
    if (timestamp) {
      const d = new Date(timestamp);

      // Get 'YYYY-MM-DD' string
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      // Get start time 'HH:MM' string
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const startTimeString = `${hours}:${minutes}`;

      // Get end time 'HH:MM' string
      const end = new Date(d.getTime() + 60 * 60 * 1000); // Default to 1 hour later
      const endHours = String(end.getHours()).padStart(2, "0");
      const endMinutes = String(end.getMinutes()).padStart(2, "0");
      const endTimeString = `${endHours}:${endMinutes}`;
      setEntryTimes({ date: dateString, startTime: startTimeString, endTime: endTimeString });
    } 
    // Default for when rendering without a specific timestamp, use the selected date with default times
    else {
      setEntryTimes({ date: formatLocalDate(selectedDate), startTime: "00:00", endTime: "01:00" })
    }
    setShowInput(true);
  };

  const handleCloseInput = () => {
    setShowInput(false);
  };

  // Navigation handler for the calendar (e.g., next/previous month, week, or day)
  const handleNavigation = (direction) => {
    const newDate = new Date(selectedDate);
    // Handle "today" navigation
    if (direction === "today") {
      dispatch(
        setSelectedDate({
          selectedDate: formatLocalDate(getLocalCurrentDate()),
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
    dispatch(setSelectedDate({ selectedDate: formatLocalDate(newDate) }));
  };

  // Function to render the corresponding calendar view based on the current view mode
  const renderCalendarView = () => {
    switch (viewMode) {
      case "day":
        return (
          <DayView
            selectedDate={selectedDate}
            handleOpenInput={handleOpenInput}
          />
        );
      case "week":
        return (
          <WeekView
            onViewChange={onViewChange}
            handleOpenInput={handleOpenInput}
          />
        );
      case "month":
        return (
          <MonthView selectedDate={selectedDate} onViewChange={onViewChange} />
        );
      default:
        return (
          <DayView
            selectedDate={selectedDate}
            handleOpenInput={handleOpenInput}
          />
        );
    }
  };

  return (
    <div className="calendar-container">
      <CalendarHeader
        date={selectedDate}
        isHomePage={isHomePage}
        viewMode={viewMode}
        onViewChange={onViewChange}
        onNavigate={handleNavigation}
        handleOpenInput={handleOpenInput}
      />
      <main className="calendar-body">{renderCalendarView()}</main>

      {/* Conditionally render the CalendarInput component */}
      {showInput && (
        <Modal onClose={handleCloseInput} title="Add Event or Task">
          <CalendarInput
            date={entryTimes?.date}
            initialStartTime={entryTimes?.startTime}
            initialEndTime={entryTimes?.endTime}
            onClose={handleCloseInput}
          />
        </Modal>
      )}
    </div>
  );
};

// Export the CalendarContainer component
export default CalendarContainer;
