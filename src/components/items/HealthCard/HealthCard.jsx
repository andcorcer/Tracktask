// Import all dependencies
import React, { useState } from "react";
import {
  Activity,
  SportShoe,
  Footprints,
  TrendingUp,
  Flame,
  HeartPulse,
  Clock,
  FaceAngry,
  Dumbbell,
  WavesLadder,
  CalendarClock,
  ClipboardClock,
} from "lucide-react";

// Import Components
import DetailsCard from "../../details/DetailsCard/DetailsCard";
import Modal from "../../details/Modal/Modal";

// Import Styles
import "./HealthCard.css";

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

// Function that formats a date to it's local date
const formatLocalDate = (date) => {
  if (!date) return "Upcoming";
  const cleanedDate = date.split("T")[0];
  const [year, month, day] = cleanedDate.split("-");
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString();
};

// HealthCard Component
const HealthCard = ({ type, data, viewMode }) => {
  // Local state to render the DetailsCard component conditionally
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSubType, setSelectedSubType] = useState(null);

  const handleOpenDetails = (secondaryType) => {
    setShowDetails(true);
    setSelectedSubType(secondaryType);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedSubType(null);
  };

  // Render Daily Summary
  const renderDailySummary = () => (
    <div className="health-content summary-container">
      <div
        className="metric steps"
        onClick={() => handleOpenDetails("steps")}
        role="button"
        tabIndex={0}
      >
        <Footprints size={16} className="steps-icon" />
        <span>
          {data?.totalSteps?.toLocaleString() || 0} of{" "}
          {data?.dailyStepGoal?.toLocaleString() || "Goal"} Steps
        </span>
      </div>

      <div
        className="metric floors"
        onClick={() => handleOpenDetails("floors")}
        role="button"
        tabIndex={0}
      >
        <TrendingUp size={16} className="floors-icon" />
        <span>
          {Math.floor(data?.floorsAscended || 0).toLocaleString()} of{" "}
          {Number.isNaN(Math.floor(data?.floorsAscendedGoal)) ||
          data?.floorsAscendedGoal === null
            ? "Goal"
            : Math.floor(data?.floorsAscendedGoal).toLocaleString()}{" "}
          Floors
        </span>
      </div>

      <div
        className="metric calories"
        onClick={() => handleOpenDetails("calories")}
        role="button"
        tabIndex={0}
      >
        <Flame size={16} className="calories-icon" />
        <span>{data?.totalKilocalories?.toLocaleString() || 0}</span>
      </div>

      <div
        className="metric heart-rate"
        onClick={() => handleOpenDetails("heartRate")}
        role="button"
        tabIndex={0}
      >
        <HeartPulse size={16} className="heart-rate-icon" />
        <span>{data?.restingHeartRate || "--"} BPM</span>
      </div>

      <div
        className="metric stress"
        onClick={() => handleOpenDetails("stress")}
        role="button"
        tabIndex={0}
      >
        <FaceAngry size={16} className="stress-icon" />
        <span>{data?.averageStressLevel || 0}</span>
      </div>

      <div
        className="metric body-battery"
        onClick={() => handleOpenDetails("bodyBattery")}
        role="button"
        tabIndex={0}
      >
        <Activity size={16} className="body-battery-icon" />
        <span>{data?.bodyBatteryMostRecentValue || "--"}</span>
      </div>

      <div
        className="metric intensity-minutes"
        onClick={() => handleOpenDetails("intensityMinutes")}
        role="button"
        tabIndex={0}
      >
        <Clock size={16} className="intensity-minutes-icon" />
        <span>{data?.totalIntensityMinutes || 0}</span>
      </div>
    </div>
  );

  // Render Activity
  const renderActivity = () => {
    const isStrength = data?.activityType?.typeKey?.includes("strength");
    const isRunning = data?.activityType?.typeKey?.includes("running");
    const isSwimming = data?.activityType?.typeKey?.includes("swimming");

    // We set initial values for the metrics displayed
    let ActivityIcon = Footprints;
    let activityString = "Other";
    let subtext1 = `${data?.averageHR} HR`;
    let subtext2 = `${data?.calories} Calories`;

    // We modify the values displayed depending on which activity it is
    if (isStrength) {
      ActivityIcon = Dumbbell;
      activityString = "Strength";
      subtext1 = `${data?.totalReps} Reps`;
    } else if (isRunning) {
      ActivityIcon = SportShoe;
      activityString = "Running";
      subtext1 = `${(data?.distance / 1000).toFixed(2)} km`;
      subtext2 = data?.distance
        ? `${transformTimeFormat(data?.duration / (data?.distance / 1000))} /km`
        : "--";
    } else if (isSwimming) {
      ActivityIcon = WavesLadder;
      activityString = "Swimming";
      subtext1 = `${(data?.distance / 1000).toFixed(2)} km`;
      subtext2 = `${transformTimeFormat(data?.duration / (data?.distance / 1000))} /km`;
    }

    // We render the activities conditionally for the calendar in its different view modes
    if (viewMode === "month") {
      return (
        <button
          className="month-element activity-element"
          onClick={() =>
            handleOpenDetails(`activity ${activityString?.toLowerCase()}`)
          }
        >
          <span className="activity-title">
            <ActivityIcon size={10} className={activityString} />
            {activityString !== "Other" ? activityString : data?.activityName}
          </span>
        </button>
      );
    } else if (viewMode === "week") {
      return (
        <div
          className="week-element activity-element"
          onClick={() =>
            handleOpenDetails(`activity ${activityString?.toLowerCase()}`)
          }
          role="button"
          tabIndex={0}
        >
          <div className="activity-title">
            <ActivityIcon size={14} className={activityString} />
            <h5>
              {activityString !== "Other" ? activityString : data?.activityName}
            </h5>
          </div>
          <span className="duration-text">
            <Clock size={12} className="duration-icon" />
            {transformTimeFormat(data?.duration)}
          </span>
        </div>
      );
    }

    return (
      <div
        className="health-content activity-element"
        onClick={() =>
          handleOpenDetails(`activity ${activityString?.toLowerCase()}`)
        }
        role="button"
        tabIndex={0}
      >
        <div className="activity-title">
          <ActivityIcon size={18} className={activityString} />
          <h4>
            {activityString !== "Other" ? activityString : data?.activityName}
          </h4>
        </div>
        <div className="activity-subtext">
          <p>{subtext1}</p>
          <p>{subtext2}</p>
        </div>

        <div className="activity-stats">
          <div className="stats-badge duration">
            <Clock size={12} className="duration-icon" />
            <span className="duration-text">
              {transformTimeFormat(data?.duration)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render Training Plan
  const renderTrainingPlan = () => (
    <div
      className="health-content plan-container"
      onClick={() => handleOpenDetails(type)}
      role="button"
      tabIndex={0}
    >
      <div className="plan-title">
        <ClipboardClock size={18} className="training-plan" />
        <h4>{data?.name || "Active Training Plan"}</h4>
      </div>

      <div className="plan-meta">
        <p>{data?.status || "ACTIVE"}</p>
        <span className="badge">
          {data?.startDate && data?.endDate
            ? `${data?.startDate.split("T")[0]} --- ${data?.endDate.split("T")[0]}`
            : "Ongoing"}
        </span>
      </div>
    </div>
  );

  // Render Workouts
  const renderWorkouts = () => {
    // We render workouts conditionally for the calendar in its different view modes
    if (viewMode === "month") {
      return (
        <button
          className="month-element workout-element"
          onClick={() => handleOpenDetails("workout")}
        >
          <span className="workout-title">
            <CalendarClock size={10} className="workout" />
            {data?.title || "Scheduled Workout"}
          </span>
        </button>
      );
    } else if (viewMode === "week") {
      return (
        <div
          className="week-element workout-element"
          onClick={() => handleOpenDetails("workout")}
          role="button"
          tabIndex={0}
        >
          <div className="workout-title">
            <CalendarClock size={14} className="workout" />
            <h5>{data?.title || "Scheduled Workout"}</h5>
          </div>
          <p>{formatLocalDate(data?.date)}</p>
        </div>
      );
    }

    return (
      <div
        className="health-content workout-element"
        onClick={() => handleOpenDetails("workout")}
        role="button"
        tabIndex={0}
      >
        <div className="workout-title">
          <CalendarClock size={18} className="workout" />
          <h4>{data?.title || "Scheduled Workout"}</h4>
        </div>
        <p>{formatLocalDate(data?.date)}</p>
      </div>
    );
  };

  // Switch to render each item conditionally depending on which is it
  const renderContent = () => {
    switch (type) {
      case "summary":
        return renderDailySummary();
      case "activity":
        return renderActivity();
      case "trainingPlan":
        return renderTrainingPlan();
      case "workout":
        return renderWorkouts();
      default:
        return <p>Unknown Garmin Data</p>;
    }
  };

  return (
    <div
      className={`health-card ${viewMode ? `${viewMode}-view` : ""} ${type ? `${type}-element` : ""}`}
    >
      {renderContent()}

      {/* Conditionally render the DetailsCard component */}
      {showDetails && (
        <Modal onClose={handleCloseDetails} title="Health Details">
          <DetailsCard
            type="health"
            secondaryType={selectedSubType}
            item={data}
            onClose={handleCloseDetails}
          />
        </Modal>
      )}
    </div>
  );
};

// Export the HealthCard component
export default HealthCard;
