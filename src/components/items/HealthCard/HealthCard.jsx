// Import all dependencies
import React, { useState } from "react";
import {
  Activity,
  SportShoe,
  Footprints,
  DoorStairwell,
  Flame,
  HeartPulse,
  GlassWater,
  Wind,
  Clock,
  FaceAngry,
  Dumbbell,
  WavesLadder,
} from "lucide-react";

// Import Styles
import "./HealthCard.css";

// HealthCard Component
const HealthCard = ({ type, data }) => {
  // Local state to render the DetailsCard component conditionally
  const [showDetails, setShowDetails] = useState(false);
  const [type, setType] = useState(null);

  const handleOpenDetails = (type2) => {
    setShowDetails(true);
    setType(type, type2);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Function that transforms a time passed in seconds to it's HH:MM:SS format
  const transformTimeFormat = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    // We add padding to the times so that it follows the HH:MM:SS format
    const paddedHours = hours < 10 ? `0${hours}` : hours;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    // We return MM:SS format if time is under an hour
    return hours
      ? `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
      : `${paddedMinutes}:${paddedSeconds}`;
  };

  // Render Daily Summary
  const renderDailySummary = () => (
    <div className="health-content summary-container">
      <div className="metric steps">
        <button
          className="btn summary-details steps"
          onClick={() => handleOpenDetails("steps")}
        >
          <Footprints size={16} className="steps-icon" />
          <span>
            {data?.totalSteps?.toLocaleString() || 0} of
            {data?.dailyStepGoal?.toLocaleString() || "Unknown"} Steps
          </span>
        </button>
      </div>

      <div className="metric floors">
        <button
          className="btn summary-details floors"
          onClick={() => handleOpenDetails("floors")}
        >
          <DoorStairwell size={16} className="floors-icon" />
          <span>
            {data?.floorsAscended?.toLocaleString() || 0} of
            {data?.floorsAscendedGoal?.toLocaleString() || "Unknown"} Floors
            Ascended
          </span>
        </button>
      </div>

      <div className="metric calories">
        <button
          className="btn summary-details calories"
          onClick={() => handleOpenDetails("calories")}
        >
          <Flame size={16} className="calories-icon" />
          <span>{data?.totalKilocalories?.toLocaleString() || 0}</span>
        </button>
      </div>

      <div className="metric heart-rate">
        <button
          className="btn summary-details heart-rate"
          onClick={() => handleOpenDetails("heartRate")}
        >
          <HeartPulse size={16} className="heart-rate-icon" />
          <span>{data?.restingHeartRate || "--"} BPM</span>
        </button>
      </div>

      <div className="metric stress">
        <button
          className="btn summary-details stress"
          onClick={() => handleOpenDetails("stress")}
        >
          <FaceAngry size={16} className="stress-icon" />
          <span>{data?.averageStressLevel || 0}</span>
        </button>
      </div>

      <div className="metric body-battery">
        <button
          className="btn summary-details body-battery"
          onClick={() => handleOpenDetails("bodyBattery")}
        >
          <Activity size={16} className="body-battery-icon" />
          <span>{data?.bodyBatteryMostRecentValue || "--"}</span>
        </button>
      </div>

      <div className="metric hydration">
        <button
          className="btn summary-details hydration"
          onClick={() => handleOpenDetails("hydration")}
        >
          <GlassWater size={16} className="hydration-icon" />
          <span>
            {data?.hydrationAmount || 0} of
            {data?.hydrationGoal?.toLocaleString() || "Unknown"}
          </span>
        </button>
      </div>

      <div className="metric respiration">
        <button
          className="btn summary-details respiration"
          onClick={() => handleOpenDetails("respiration")}
        >
          <Wind size={16} className="respiration-icon" />
          <span>{data?.respirationAverage || 0}</span>
        </button>
      </div>

      <div className="metric intensity-minutes">
        <button
          className="btn summary-details intensity-minutes"
          onClick={() => handleOpenDetails("intensityMinutes")}
        >
          <Clock size={16} className="intensity-minutes-icon" />
          <span>{data?.totalIntensityMinutes || 0}</span>
        </button>
      </div>
    </div>
  );

  // Render Activity
  const renderActivity = () => {
    const isStrength = data?.activityType?.includes("strength");
    const isRunning = data?.activityType?.includes("running");
    const isSwimming = data?.activityType?.includes("swimming");

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
      subtext2 = `${transformTimeFormat(data?.duration / (data?.distance / 1000))} /km`;
    } else if (isSwimming) {
      ActivityIcon = WavesLadder;
      activityString = "Swimming";
      subtext1 = `${(data?.distance / 1000).toFixed(2)} km`;
      subtext2 = `${transformTimeFormat(data?.duration / (data?.distance / 1000))} /km`;
    }

    return (
      <div className="health-content activity-container">
        <button
          className={`btn activity-details ${activityString}`}
          onClick={() => handleOpenDetails(activityString.toLowerCase())}
        >
          <div className="activity-main">
            <ActivityIcon size={18} className={activityString} />
            <div className="main-data">
              <h4>
                {activityString !== "Other"
                  ? activityString
                  : data?.activityName}
              </h4>
              <p>
                {subtext1}
                {subtext2}
              </p>
            </div>
          </div>

          <div className="activity-stats">
            <div className="stats-badge duration">
              <Clock size={12} className="duration-icon" />
              <span className="duration-text">
                {transformTimeFormat(data?.duration)}
              </span>
            </div>
          </div>
        </button>
      </div>
    );
  };

  // Render Training Plan
  const renderTrainingPlan = () => (
    <div className="health-content plan-container">
      <button
        className={`btn plan-details ${activityString}`}
        onClick={() => handleOpenDetails()}
      >
        <div className="plan-main">
          <ClipboardClock size={18} className="training-plan" />
          <h4>{data?.name || "Active Training Plan"}</h4>
          <p>{data?.status || "ACTIVE"}</p>
        </div>

        <div className="plan-meta">
          <span className="badge">
            {`${data?.startDate} - ${data?.endDate}`}
          </span>
        </div>
      </button>
    </div>
  );

  // Render Workouts
  const renderWorkouts = () => {
    const workoutType = data?.sportTypeKey;
    return (
      <div className="health-content workout-container">
        <button
          className="btn workout-details"
          onClick={() => handleOpenDetails(workoutType.toLowerCase())}
        >
          <div className="workout-main">
            <CalendarClock size={18} className="workout" />
            <h4>{data?.title || "Scheduled Workout"}</h4>
            <p>{data?.date ? new Date(data?.date) : "Upcoming"}</p>
          </div>
        </button>
      </div>
    );
  };

  // Switch to render each item conditionally depending on which is it
  const renderContent = () => {
    switch (type) {
      case "summary":
        return renderSummary();
      case "activity":
        return renderActivity();
      case "training_plan":
        return renderTrainingPlan();
      case "calendar":
        return renderCalendarEvent();
      default:
        return <p>Unknown Garmin Data</p>;
    }
  };

  return <div className="health-card">{renderContent()}</div>;
};

// Export the HealthCard component
export default HealthCard;
