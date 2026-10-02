// Import all dependencies
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Plus,
  CheckCircle2,
  Circle,
  Tag,
  Repeat,
  Trash2,
  MailPen,
} from "lucide-react";

// Import Components
import CalendarInput from "../CalendarInput/CalendarInput";

// Import Actions
import { toggleTodo, deleteTodo } from "../store/todosSlice";
import { toggleTask } from "../store/tasksSlice";

// Import Styles
import "./DetailsCard.css";

// DetailsCard Component
const DetailsCard = ({
  type,
  secondaryType,
  item,
  date,
  taskListId,
  onClose,
}) => {
  const dispatch = useDispatch(); // Get the dispatch function from Redux to dispatch actions
  // Local state to render the CalendarInput component conditionally
  const [showInput, setShowInput] = useState(false);

  // -----------------------------------------------------------------------------------------------------------------
  // RENDER CALENDARINPUT COMPONENT CONDITIONALLY
  // -----------------------------------------------------------------------------------------------------------------

  if (showInput) {
    return <CalendarInput date={date} onClose={() => setShowInput(false)} />;
  }

  // -----------------------------------------------------------------------------------------------------------------
  // TODO DETAILS
  // -----------------------------------------------------------------------------------------------------------------
  const renderTodoDetails = () => {
    const completed = item.isDaily
      ? !!item.completedDates?.[date]
      : item.completed;

    // Handlers
    const handleToggle = (e) => {
      e.stopPropagation(); // Doesn't affect parent elements
      dispatch(toggleTodo({ id: item.id, date: date }));
    };

    const handleDelete = (e) => {
      e.stopPropagation(); // Doesn't affect parent elements
      dispatch(deleteTodo(item.id));
    };

    return (
      <div className="details-card todo-details">
        {/* Checkbox toggle button */}
        <div className="details-header">
          <button
            className={`btn checkbox-btn ${completed ? "checked" : ""}`}
            onClick={handleToggle}
            aria-label={completed ? "Todo incomplete" : "Todo complete"}
          >
            {completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            <span className="checkbox-label">
              {completed ? "Completed" : "Incompleted"}
            </span>
          </button>
        </div>

        {/* Description */}
        <div className="details-description">
          <h4 className="details-subtitle">Description</h4>
          <p className="details-text">{item.data}</p>
        </div>

        {/* Meta Information */}
        <div className="details-meta">
          <div className="details-meta-item">
            <h4 className="details-subtitle">Meta</h4>
            <span className="badge category-badge">
              <Tag size={16} />
              {item.category || "General"}
            </span>
          </div>
          {item.isDaily && (
            <div className="details-meta-item">
              <h4 className="details-subtitle">Type</h4>
              <span className="badge daily-badge">
                <Repeat size={16} />
                Daily
              </span>
            </div>
          )}
          <div className="details-meta-item">
            <h4 className="details-subtitle">Created</h4>
            <span className="badge daily-badge">
              <MailPen size={16} />
              {item.createdAt || date}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="details-actions">
          <button
            className="btn delete-btn"
            onClick={handleDelete}
            title="Delete Todo"
            aria-label="Delete Todo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  // -----------------------------------------------------------------------------------------------------------------
  // HEALTH DETAILS
  // -----------------------------------------------------------------------------------------------------------------
  const renderHealthDetails = () => {
    // Convert secondaryType to a human-readable title
    const title = secondaryType
      .replace(/([A-Z])/g, " $1") // Add a space before each uppercase letter
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter || 

    // Array of all the meta items for the health details card depending on the secondaryType
    let metaItems = [];

    switch (secondaryType) {
      case "steps":
        metaItems = [
          { label: "Total Steps", value: item?.totalSteps || 0 },
          { label: "Steps Goal", value: item?.stepsGoal || 0 },
        ];
        break;
      case "floors":
        metaItems = [
          { label: "Floors Ascended", value: item?.floorsAscended || 0 },
          { label: "Floors Descended", value: item?.floorsDescended || 0 },
          { label: "Floors Goal", value: item?.floorsAscendedGoal || 0 },
        ];
        break;
      case "calories":
        metaItems = [
          { label: "Total Kilocalories", value: item?.totalKilocalories || 0 },
          {
            label: "Active Kilocalories",
            value: item?.activeKilocalories || 0,
          },
          { label: "Resting Kilocalories", value: item?.bmrKilocalories || 0 },
        ];
        break;
      case "heartRate":
        metaItems = [
          { label: "Minimum Heart Rate", value: item?.minHeartRate || 0 },
          { label: "Maximum Heart Rate", value: item?.maxHeartRate || 0 },
          { label: "Resting Heart Rate", value: item?.restingHeartRate || 0 },
        ];
        break;
      case "stress":
        metaItems = [
          {
            label: "Average Stress Level",
            value: item?.averageStressLevel || 0,
          },
          {
            label: "Stress Duration",
            value: item?.stressDurationInMilliseconds || 0,
          },
          { label: "Stress Episodes", value: item?.stressEpisodes || 0 },
        ];
        break;
      case "bodyBattery":
        metaItems = [
          {
            label: "Latest Value",
            value: item?.bodyBatteryMostRecentValue || 0,
          },
          { label: "Highest Value", value: item?.bodyBatteryHighestValue || 0 },
          { label: "Lowest Value", value: item?.bodyBatteryLowestValue || 0 },
        ];
        break;
      case "intensityMinutes":
        metaItems = [
          {
            label: "Moderate Intensity Minutes",
            value: item?.moderateIntensityMinutes || 0,
          },
          {
            label: "Vigorous Intensity Minutes",
            value: item?.vigorousIntensityMinutes || 0,
          },
          {
            label: "Total Intensity Minutes",
            value:
              item?.moderateIntensityMinutes +
                item?.vigorousIntensityMinutes * 2 || 0,
          },
        ];
        break;
    };

    return (
          <div className="details-card health-details">
            {/* Description */}
            <div className="details-description">
              <h4 className="details-subtitle">{title}</h4>
            </div>
            <div className="details-meta">
              {metaItems.map(({ label, value }) => (
               <div className="details-meta-item">
                <h4 className="details-subtitle">{label}</h4>
                <span className="badge steps-badge">
                  {value}
                </span>
              </div>
              ))}
            </div>
          </div>
        );
  };

  // -----------------------------------------------------------------------------------------------------------------
  // CALENDAR DETAILS
  // -----------------------------------------------------------------------------------------------------------------
  return <></>;
};

export default DetailsCard;
