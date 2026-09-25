// Import all dependencies
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  SquareCheckBig,
  Square,
  Calendar,
  ListOrdered,
  ClipboardList,
} from "lucide-react";

// Import Components
import DetailsCard from "../../details/DetailsCard/DetailsCard";

// Import Actions
import { toggleTask } from "../../../store/slices/calendarSlice";

// Import Styles
import "./CalendarCard.css";

// Function that transforms times from 00:00:00 format into 00:00 am
const transformTimes = (startTime, endTime = null) => {
  // We declare an options variable for .toLocaleTimeString method
  const options = { hour: "2-digit", minute: "2-digit", hour12: true };

  // We create date objects with the returned times of the event object
  const start = new Date(startTime);

  if (!endTime) return start.toLocaleTimeString("en-US", options).toLowerCase();

  const end = new Date(endTime);

  // We get the times in the format '00:00 AM/PM' using an options parameter
  const startWithAbbreviation = start.toLocaleTimeString("en-US", options);
  const endWithAbbreviation = end.toLocaleTimeString("en-US", options);

  // We save the AM/PM abbreviation in different variables to compare
  const [numStart, startAbbreviation] = startWithAbbreviation.split(" ");
  const [numEnd, endAbbreviation] = endWithAbbreviation.split(" ");

  if (startAbbreviation === endAbbreviation) {
    return `${numStart} - ${numEnd} ${endAbbreviation.toLowerCase()}`;
  } else {
    return `${numStart} ${startAbbreviation.toLowerCase()} - ${numEnd} ${endAbbreviation.toLowerCase()}`;
  }
};

// CalendarCard Component
const CalendarCard = ({ type, data, viewMode, taskListId }) => {
  const dispatch = useDispatch(); // Get the dispatch function from Redux to dispatch actions

  // Local state to render the DetailsCard component conditionally
  const [showDetails, setShowDetails] = useState(false);

  // Handlers
  const handleToggleTask = (e, taskListId) => {
    e.stopPropagation(); // Doesn't affect parent elements
    dispatch(
      toggleTask({
        taskId: data.id,
        isCompleted: data?.status === "needsAction", // If a task isn't completed we set isCompleted to true and vice versa
        listId: taskListId,
      }),
    );
  };

  const handleOpenDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Render Calendar List
  const renderCalendarList = () => (
    <div
      className="calendar-content calendar-list-container"
      onClick={handleOpenDetails}
      role="button"
      tabIndex={0}
      style={{
        color: data?.foregroundColor,
        backgroundColor: data?.backgroundColor,
      }}
    >
      <ListOrdered
        size={18}
        className="calendar-list"
        style={{ color: data?.foregroundColor }}
      />
      <h4>{data?.summary}</h4>
    </div>
  );

  // Render Task List
  const renderTaskList = () => (
    <div
      className="calendar-content task-list-container"
      onClick={handleOpenDetails}
      role="button"
      tabIndex={0}
    >
      <ClipboardList size={18} className="calendar-list" />
      <h4>{data?.title}</h4>
    </div>
  );

  // Render Event
  const renderEvent = () => {
    // We retrieve the start time and en time for the event
    const isDayEvent = data?.start?.dateTime ? false : true;
    const startTime = data?.start?.dateTime;
    const endTime = data?.end?.dateTime;

    // We render the events conditionally for the calendar in its different view modes
    if (viewMode === "month") {
      return (
        <button
          className={`month-element event-element ${isDayEvent ? "day-event" : ""}`}
          onClick={handleOpenDetails}
        >
          <span>
            {/* We render a span element conditionally to show the starting time only if the event is not daily */}
            {!isDayEvent && (
              <span className="start-time">{transformTimes(startTime)}</span>
            )}

            <Calendar size={10} className="event" />
            {data?.summary || "(No title)"}
          </span>
        </button>
      );
    } else if (viewMode === "week") {
      return (
        <div
          className={`week-element event-element ${isDayEvent ? "day-event" : ""}`}
          onClick={handleOpenDetails}
          role="button"
          tabIndex={0}
        >
          <h5>
            <Calendar size={14} className="event" />
            {data?.summary || "(No title)"}
          </h5>

          {/* We render a span element conditionally to show the starting time only if the event is not daily */}
          {!isDayEvent && (
            <span className="time-range">
              {transformTimes(startTime, endTime)}
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        className={`calendar-content event-element ${isDayEvent ? "day-event" : ""}`}
        onClick={handleOpenDetails}
        role="button"
        tabIndex={0}
      >
        <div className="event-main">
          <Calendar size={18} className="event" />
          <div className="main-data">
            <h4>{data?.summary || "(No title)"}</h4>

            {/* We render a span element conditionally to show the starting time only if the event is not daily */}
            {!isDayEvent && (
              <span className="time-range">
                {transformTimes(startTime, endTime)}
              </span>
            )}

            {data?.description && (
              <p className="description">{data?.description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Task
  const renderTask = () => {
    // We render the events conditionally for the calendar in its different view modes
    if (viewMode === "month") {
      return (
        <button
          className="month-element task-element"
          onClick={handleOpenDetails}
        >
          <span>
            {data?.status === "needsAction" ? (
              <Square size={10} className="task" />
            ) : (
              <SquareCheckBig size={10} className="task" />
            )}
            {data?.title || "(No title)"}
          </span>
        </button>
      );
    } else if (viewMode === "week") {
      return (
        <div
          className="week-element task-element"
          onClick={handleOpenDetails}
          role="button"
          tabIndex={0}
        >
          <h5>
            {data?.status === "needsAction" ? (
              <Square size={14} className="task" />
            ) : (
              <SquareCheckBig size={14} className="task" />
            )}
            {data?.title || "(No title)"}
          </h5>
          <span className="notes">{data?.notes}</span>
        </div>
      );
    }

    return (
      <div
        className="calendar-content task-container"
        onClick={handleOpenDetails}
        role="button"
        tabIndex={0}
      >
        <div className="task-main">
          <button
            className="toggle-btn"
            onClick={(e) => handleToggleTask(e, taskListId)}
          >
            {data?.status === "needsAction" ? (
              <Square size={18} className="task" />
            ) : (
              <SquareCheckBig size={18} className="task" />
            )}
          </button>
          <div className="main-data">
            <h4>{data?.title || "(No title)"}</h4>
            <span className="notes">{data?.notes}</span>
          </div>
        </div>
      </div>
    );
  };

  // Switch to render each item conditionally depending on which is it
  const renderContent = () => {
    switch (type) {
      case "calendar_list":
        return renderCalendarList();
      case "task_list":
        return renderTaskList();
      case "event":
        return renderEvent();
      case "task":
        return renderTask();
      default:
        return <p>Unknown Google Data</p>;
    }
  };

  return (
    <div className={`calendar-card ${viewMode ? `${viewMode}-view` : ""}`}>
      {renderContent()}

      {/* Conditionally render the DetailsCard component */}
      {showDetails && (
        <DetailsCard type="calendar" item={data} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

// Export the CalendarCard component
export default CalendarCard;
