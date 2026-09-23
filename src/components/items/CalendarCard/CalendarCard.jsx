// Import all dependencies
import React, { useState } from "react";
import {
  SquareCheckBig,
  Square,
  Calendar,
  ListOrdered,
  ClipboardList,
} from "lucide-react";

// Import Styles
import "./CalendarCard.css";

// CalendarCard Component
const CalendarCard = ({ type, data, viewMode }) => {
  // Local state to render the DetailsCard component conditionally
  const [showDetails, setShowDetails] = useState(false);

  const handleOpenDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Function that transforms times from 00:00:00 format into 00:00 am
  const transformTimes = (startTime, endTime = null) => {
    const startHours = startTime.split(":")[0];
    const startMinutes = startTime.split(":")[1];

    const formattedStartHours = startHours !== "00" ? startHours : "12";
    const formattedStartMinutes = startMinutes !== "00" ? startMinutes : "";

    if (startTime && !endTime) {
      if (Number(startHours) >= 12)
        return `${formattedStartHours}:${formattedStartMinutes} pm`;
      else Number(startHours) < 12 && Number(endHours) < 12;
      return `${formattedStartHours}:${formattedStartMinutes} am`;
    }

    const endHours = endTime.split(":")[0];
    const endMinutes = endTime.split(":")[1];

    const formattedEndHours = endHours !== "00" ? endHours : "12";
    const formattedEndMinutes = endMinutes !== "00" ? endMinutes : "";

    if (Number(startHours) >= 12 && Number(endHours) >= 12)
      return `${formattedStartHours}:${formattedStartMinutes} - ${formattedEndHours}:${formattedEndMinutes} pm`;
    else if (Number(startHours) < 12 && Number(endHours) < 12)
      return `${formattedStartHours}:${formattedStartMinutes} - ${formattedEndHours}:${formattedEndMinutes} am`;
    else
      return `${formattedStartHours}:${formattedStartMinutes} am - ${formattedEndHours}:${formattedEndMinutes} pm`;
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
    const startTimeRange = data?.start?.dateTime.toISOString().split("T")[1];
    const startTime = startTimeRange.split("-")[0];
    const endTimeRange = data?.end?.dateTime.toISOString().split("T")[1];
    const endTime = endTimeRange.split("-")[0];

    // We render the events conditionally for the calendar in its different view modes
    if (viewMode === "month") {
      return (
        <button
          className="month-element event-element"
          onClick={handleOpenDetails}
        >
          <span>
            <span className="start-time">{transformTimes(startTime)}</span>
            <Calendar size={10} className="event" />
            {data?.summary || "(No title)"}
          </span>
        </button>
      );
    } else if (viewMode === "week") {
      return (
        <div
          className="week-element activity-element"
          onClick={handleOpenDetails}
          role="button"
          tabIndex={0}
        >
          <h5>
            <Calendar size={14} className="event" />
            {data?.summary || "(No title)"}
          </h5>
          <span className="time-range">
            {transformTimes(startTime, endTime)}
          </span>
        </div>
      );
    }

    return (
      <div
        className="week-element activity-element"
        onClick={handleOpenDetails}
        role="button"
        tabIndex={0}
      >
        <div className="event-main">
          <Calendar size={18} className="event" />
          <div className="main-data">
            <h4>{data?.summary || "(No title)"}</h4>
            <span className="time-range">
              {transformTimes(startTime, endTime)}
            </span>
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
          className="week-element activity-element"
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
          {data?.status === "needsAction" ? (
            <Square size={18} className="task" />
          ) : (
            <SquareCheckBig size={18} className="task" />
          )}
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
