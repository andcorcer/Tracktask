// Import all dependencies
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Plus,
  CircleCheck,
  Circle,
  Tag,
  Repeat,
  Trash2,
  CalendarPlus,
  Dumbbell,
  SportShoe,
  WavesLadder,
  ClipboardClock,
  CalendarClock,
  Square,
  SquareCheckBig,
  Footprints,
  Flame,
  Activity,
  HeartPulse,
  FaceAngry,
  TrendingUp,
  Calendar1,
  ClipboardList,
} from "lucide-react";

// Import Components
import CalendarInput from "../../inputs/CalendarInput/CalendarInput";

// Import Actions
import { toggleTodo, deleteTodo } from "../../../store/slices/todosSlice";
import { toggleTask } from "../../../store/slices/calendarSlice";

// Import Styles
import "./DetailsCard.css";

// Function that transforms a time passed in seconds to it's HH:MM:SS format
const transformTimeFormat = (time) => {
  // Handle being unable to fetch a time
  if (!time || typeof time !== "number") return "00:00";

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  // We add padding to the times so that it follows the HH:MM:SS format
  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(Math.floor(seconds)).padStart(2, "0");

  // We return MM:SS format if time is under an hour
  return hours
    ? `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
    : `${paddedMinutes}:${paddedSeconds}`;
};

// Function to capitalize safely
const capitalizeSafe = (str, fallback = "(None)") => {
  if (!str || typeof str !== "string") return fallback;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
// DetailsCard Component
const DetailsCard = ({ type, secondaryType, item, date, taskListId }) => {
  const dispatch = useDispatch(); // Get the dispatch function from Redux to dispatch actions
  // Local state to render the CalendarInput component conditionally
  const [showInput, setShowInput] = useState(false);
  const [entryType, setEntryType] = useState("event");

  // -----------------------------------------------------------------------------------------------------------------
  // RENDER CALENDARINPUT COMPONENT CONDITIONALLY
  // -----------------------------------------------------------------------------------------------------------------

  const handleOpenInput = (type) => {
    setShowInput(true);
    setEntryType(type);
  };

  if (showInput) {
    return (
      <CalendarInput
        date={date}
        entryType={entryType}
        onClose={() => setShowInput(false)}
      />
    );
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
          {/* Description */}
          <div className="details-description todo-description">
            <h4 className="details-subtitle">Description</h4>
            <p className="details-text">{item.data}</p>
          </div>
          <button
            className={`btn checkbox-btn ${completed ? "checked" : ""}`}
            onClick={handleToggle}
            aria-label={completed ? "Todo incomplete" : "Todo complete"}
          >
            {completed ? <CircleCheck size={20} /> : <Circle size={20} />}
            <span className="checkbox-label">
              {completed ? "Completed" : "Incompleted"}
            </span>
          </button>
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
              <CalendarPlus size={16} />
              {item.createdAt || date}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="details-actions">
          <button
            className="btn delete-todo-btn"
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
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter

    // Array of all the meta items and icons for the health details card depending on the secondaryType
    let metaItems = [];
    let icon = null;

    switch (secondaryType) {
      case "steps":
        icon = <Footprints size={16} />;
        metaItems = [
          { label: "Total Steps", value: item?.totalSteps || 0 },
          { label: "Steps Goal", value: item?.stepsGoal || 0 },
        ];
        break;
      case "floors":
        icon = <TrendingUp size={16} />;
        metaItems = [
          {
            label: "Floors Ascended",
            value: Math.floor(item?.floorsAscended || 0),
          },
          { label: "Floors Descended", value: item?.floorsDescended || 0 },
          {
            label: "Floors Goal",
            value: Math.floor(item?.floorsAscendedGoal || 0),
          },
        ];
        break;
      case "calories":
        icon = <Flame size={16} />;
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
        icon = <HeartPulse size={16} />;
        metaItems = [
          { label: "Minimum Heart Rate", value: item?.minHeartRate || 0 },
          { label: "Maximum Heart Rate", value: item?.maxHeartRate || 0 },
          { label: "Resting Heart Rate", value: item?.restingHeartRate || 0 },
        ];
        break;
      case "stress":
        icon = <FaceAngry size={16} />;
        metaItems = [
          {
            label: "Average Stress Level",
            value: item?.averageStressLevel || 0,
          },
          {
            label: "Stress Duration",
            value:
              transformTimeFormat(item?.stressDurationInMilliseconds / 1000) ||
              0,
          },
          { label: "Stress Episodes", value: item?.stressEpisodes || 0 },
        ];
        break;
      case "bodyBattery":
        icon = <Activity size={16} />;
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
        icon = <Clock size={16} />;
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
              Number(item?.moderateIntensityMinutes) +
                Number(item?.vigorousIntensityMinutes) * 2 || 0,
          },
        ];
        break;
      case "activity strength":
        icon = <Dumbbell size={16} />;
        metaItems = [
          { label: "Duration", value: transformTimeFormat(item?.duration) },
          {
            label: "Calories Burned",
            value: `${Math.round(item?.calories || 0)} kcal`,
          },
          { label: "Total Reps", value: item?.totalReps || 0 },
          { label: "Average Heart Rate", value: `${item?.averageHR || 0} bpm` },
        ];
        break;
      case "activity running":
        icon = <SportShoe size={16} />;
        metaItems = [
          {
            label: "Distance",
            value: `${(item?.distance / 1000).toFixed(2)} km`,
          },
          { label: "Duration", value: transformTimeFormat(item?.duration) },
          {
            label: "Pace",
            value:
              `${transformTimeFormat(item?.duration / (item?.distance / 1000))} /km` ||
              "--:--",
          },
          { label: "Average Heart Rate", value: `${item?.averageHR || 0} bpm` },
          {
            label: "Maximum Heart Rate",
            value: `${item?.maxHR || 0} bpm`,
          },
        ];
        break;

      case "activity swimming":
        icon = <WavesLadder size={16} />;
        metaItems = [
          {
            label: "Distance",
            value: `${item?.distance || 0} m`,
          },
          { label: "Duration", value: transformTimeFormat(item?.duration) },
          {
            label: "Pace",
            value:
              `${transformTimeFormat(item?.duration / (item?.distance / 100))} /100m` ||
              "--:--",
          },
          { label: "Average Swolf", value: item?.averageSwolf || "--" },
          { label: "Total Strokes", value: item?.totalStrokes || "--" },
        ];
        break;

      case "activity other":
        icon = <Footprints size={16} />;
        metaItems = [
          { label: "Duration", value: transformTimeFormat(item?.duration) },
          {
            label: "Calories Burned",
            value: `${Math.round(item?.calories || 0)} kcal`,
          },
          { label: "Average Heart Rate", value: `${item?.averageHR || 0} bpm` },
          {
            label: "Maximum Heart Rate",
            value: `${item?.maxHR || 0} bpm`,
          },
        ];
        break;
      case "trainingPlan":
        icon = <ClipboardClock size={16} />;
        metaItems = [
          {
            label: "Name",
            value: item?.trainingPlanName || "Active Training Plan",
          },
          {
            label: "Description",
            value: item?.trainingPlanDescription || "No description available",
          },
          {
            label: "Type",
            value: item?.typeKey.replace(/_/g, " ").toUpperCase() || "N/A",
          },
          {
            label: "Duration In Weeks",
            value: `${item?.durationInWeeks} semanas` || "N/A",
          },
        ];
        break;
      case "workout":
        icon = <CalendarClock size={16} />;
        metaItems = [
          {
            label: "Name",
            value: item?.title || item?.workoutName || "Upcoming Workout",
          },
          {
            label: "Description",
            value: item?.description || "No description available",
          },
          {
            label: "Date",
            value: (() => {
              if (!item?.date) return "Upcoming";
              const cleanedDate = item.date.split("T")[0];
              const [year, month, day] = cleanedDate.split("-");
              return new Date(year, month - 1, day).toLocaleDateString();
            })(),
          },
          {
            label: "Type",
            value:
              item?.activityType?.typeKey.replace(/_/g, " ").toUpperCase() ||
              "N/A",
          },
          {
            label: "Status",
            value: item?.isCompleted ? "Completed" : "Upcoming",
          },
        ];
        break;
    }

    return (
      <div className={`details-card health-details ${title}`}>
        {/* Description */}
        <div className="details-description">
          <h4 className="details-subtitle">{title}</h4>
        </div>
        <div className="details-meta">
          {metaItems.map(({ label, value }, index) => (
            <div className="details-meta-item" key={index}>
              <h4 className="details-subtitle">{label}</h4>
              <span className="badge details-badge">
                {icon && icon}
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
  const renderCalendarDetails = () => {
    // Convert secondaryType to a human-readable title
    const title = secondaryType
      .replace(/([A-Z])/g, " $1") // Add a space before each uppercase letter
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter

    // Array of all the meta items and icons for the calendar details card depending on the secondaryType
    let metaItems = [];
    let icon = null;

    // Handlers
    const handleToggleTask = (e, taskListId) => {
      e.stopPropagation(); // Doesn't affect parent elements
      dispatch(
        toggleTask({
          taskId: item?.id,
          isCompleted: item?.status === "needsAction", // If a task isn't completed we set isCompleted to true and vice versa
          listId: taskListId,
        }),
      );
    };

    switch (secondaryType) {
      case "taskList":
        icon = <ClipboardList size={20} />;
        metaItems = [
          {
            label: "Title",
            value: capitalizeSafe(item?.title, "(No title)"),
          },
          {
            label: "Last Updated",
            value: item?.updated
              ? new Date(item?.updated).toISOString().split("T")[0]
              : "(No date)",
          },
        ];
        break;
      case "calendarList":
        icon = <CalendarClock size={20} />;
        metaItems = [
          {
            label: "Title",
            value: capitalizeSafe(item?.summary, "(No title)"),
          },
          {
            label: "Description",
            value: capitalizeSafe(item?.description, "(No description)"),
          },
          {
            label: "Access Role",
            value: capitalizeSafe(item?.accessRole, "Reader"),
          },
          {
            label: "Timezone",
            value: item?.timeZone || "UTC",
          },
        ];
        break;
      case "event":
        icon = <Calendar1 size={20} />;
        metaItems = [
          {
            label: "Title",
            value: capitalizeSafe(item?.summary, "(No title)"),
          },
          {
            label: "Description",
            value: capitalizeSafe(item?.description, "(No description)"),
          },
          {
            label: "Location",
            value: capitalizeSafe(item?.location, "(No location)"),
          },
          {
            label: "Status",
            value: capitalizeSafe(item?.status, "(No status)"),
          },
          {
            label: "Date",
            value: item?.start?.date
              ? item?.start?.date
              : item?.start?.dateTime?.split("T")[0] || "(No date)",
          },
        ];

        item?.start?.dateTime &&
          metaItems.push({
            label: "Time",
            value: (() => {
              const formatTime = new Intl.DateTimeFormat("default", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
              const startTime = formatTime.format(
                new Date(item?.start?.dateTime),
              );
              const endTime = formatTime.format(new Date(item?.end?.dateTime));
              return `${startTime} - ${endTime}`;
            })(),
          });
        break;
      case "task":
        icon = <ClipboardList size={20} />;
        metaItems = [
          {
            label: "Title",
            value: capitalizeSafe(item?.title, "(No title)"),
          },
          {
            label: "Notes",
            value: capitalizeSafe(item?.notes, "(No notes)"),
          },
          {
            label: "Status",
            value:
              typeof item?.status === "string"
                ? item?.status?.charAt(0).toUpperCase() +
                    item?.status
                      ?.slice(1)
                      .split(/(?=[A-Z])/)
                      .join(" ") || "(No status)"
                : "(No status)",
          },
          {
            label: "Due Date",
            value: item?.due?.split("T")[0] || "(No due date)",
          },
        ];

        item?.completed &&
          metaItems.push({
            label: "Completed Time",
            value: item?.completed
              ? item?.completed.split("T")[0]
              : "(No completed time)",
          });
        break;
    }

    return (
      <div className={`details-card calendar-details ${title}`}>
        {/* Header */}
        <div className="details-header calendar-header">
          {/* Description */}
          <div className="details-description">
            <h4 className="details-subtitle">{title}</h4>
          </div>

          {/* Checkbox toggle button */}
          {secondaryType === "task" && (
            <button
              className="btn toggle-task-btn"
              onClick={(e) => handleToggleTask(e, taskListId)}
            >
              {item?.status === "needsAction" ? (
                <Square size={18} className="task" />
              ) : (
                <SquareCheckBig size={18} className="task" />
              )}
            </button>
          )}
        </div>

        {/* Meta Information */}
        <div className="details-meta">
          {metaItems.map(({ label, value }, index) => (
            <div className="details-meta-item" key={index}>
              <h4 className="details-subtitle">{label}</h4>
              <span className="badge steps-badge">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        {(secondaryType === "calendarList" || secondaryType === "taskList") && (
          <div className="details-actions">
            <button
              className={`btn add-${secondaryType === "calendarList" ? "calendar" : "task"}-btn`}
              onClick={() => handleOpenInput(secondaryType)}
              title={`Create ${secondaryType === "calendarList" ? "Calendar" : "Task"}`}
              aria-label={`Create ${secondaryType === "calendarList" ? "Calendar" : "Task"}`}
            >
              <Plus size={16} />
              {`Create ${secondaryType === "calendarList" ? "Calendar" : "Task"}`}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Switch to render details conditionally depending on which item is it
  const renderContent = () => {
    switch (type) {
      case "todo":
        return renderTodoDetails();
      case "health":
        return renderHealthDetails();
      case "calendar":
        return renderCalendarDetails();
      default:
        return <p>Unknown Details Type</p>;
    }
  };
  return <div>{renderContent()}</div>;
};

// Export the DetailsCard component
export default DetailsCard;
