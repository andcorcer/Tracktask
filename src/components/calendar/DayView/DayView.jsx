// Import all dependencies
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

// Import Components
import HealthCard from "../../items/HealthCard/HealthCard";
import CalendarCard from "../../items/CalendarCard/CalendarCard";

// Import Styles
import "./DayView.css";

// Function that returns the rows in the calendar grid using the time range (each row represents 15 minutes)
const getGridRows = (timeString, defaultHour = 1) => {
  if (!timeString) return defaultHour * 4 + 1; // Return the default number of rows if no time string is provided
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return defaultHour * 4 + 1; // Return the default number of rows if the date is invalid

  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 4 + Math.floor(minutes / 15) + 1; // Calculate the row based on the hour and 15-minute intervals
};

// Function that returns an array of hours in the day (00:00-23:00)
const getHoursArray = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, "0") + ":00");
  }
  return hours;
};

const HOURS = getHoursArray();

// Function that safely parses the local time and GMT time returned by the garmin api
const parseGarminTime = (startTimeLocal, GMTTime) => {
  if (startTimeLocal) {
    const localIsoTime = startTimeLocal.replace(" ", "T");
    const localDate = new Date(localIsoTime);
    if (!isNaN(localDate.getTime())) return new Date(localDate);
  }
  if (GMTTime) {
    // Fallback to GMT time if local time is invalid
    const gmtDate = new Date(GMTTime);
    if (!isNaN(gmtDate.getTime())) return new Date(gmtDate);
  }
  return null;
};

// DayView Component
const DayView = ({ currentDate = new Date() }) => {
  // Events, tasks, activities and workouts states from the store
  const tasks = useSelector((state) => state.calendar.tasks.items || []);
  const events = useSelector((state) => state.calendar.events.items || []);
  const activities = useSelector(
    (state) => state.garmin.activities.items || [],
  );
  const workouts = useSelector(
    (state) => state.garmin.upcomingWorkouts.items || [],
  );

  // Normalize all states
  const { allDayItems, timedItems } = useMemo(() => {
    const allDay = [];
    const timed = [];

    // Normalize events
    events.forEach((event) => {
      if (event.start?.date || !event.start?.dateTime)
        allDay.push({ id: event.id, type: "event", data: event });
      else {
        const startRow = getGridRows(event.start?.dateTime);
        const endRow = event.end?.dateTime
          ? getGridRows(event.end?.dateTime)
          : startRow + 4; // Defaults to an hour after the start time
        timed.push({
          id: event.id,
          type: "event",
          data: event,
          startRow,
          endRow: Math.max(startRow + 1, endRow), // If startTime and endtime are in the same row, ensure at least one row apart
        });
      }
    });

    // Normalize tasks
    tasks.forEach((task) => {
      allDay.push({ id: task.id, type: "task", data: task }); // We push all tasks since the tasks returned from the google tasks api don't provide a time (they always return '00:00:00.000Z')
    });

    // Normalize activities
    activities.forEach((activity) => {
      const activityDate = parseGarminTime(
        activity.startTimeLocal,
        activity.startTimeGMT,
      );

      if (activityDate) {
        const startRow = getGridRows(activityDate);
        const durationRows = activity.duration
          ? Math.max(1, Math.round(activity.duration / 900))
          : 4;
        timed.push({
          id: activity.id,
          type: "activity",
          data: activity,
          startRow,
          endRow: startRow + durationRows,
        });
      }
    });

    // Normalize workouts
    workouts.forEach((workout) => {
      const workoutDate = parseGarminTime(
        workout.startTimeLocal,
        workout.startTimeGMT,
      );
      if (workoutDate) {
        allDay.push({
          id: workout.id,
          type: "workout",
          data: workout,
        });
      }
    });

    // Sort timed items by their start row
    timed.sort((a, b) => a.startRow - b.startRow);

    return { allDayItems: allDay, timedItems: timed };
  }, [events, tasks, activities, workouts]);

  // Get the day of the week for the current date
  const dayNumber = new Date(currentDate).getDate();
  const dayName = new Date(currentDate)
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();

  return (
    <div className="day-view-container">
      {/* Date Display */}
      <div className="day-column-grid-header">
        <div className="date">
          <span className="day-name">{dayName}</span>
          <div className="date-circle">{dayNumber}</div>
        </div>
      </div>

      {/* Render all-day items */}
      {allDayItems.length > 0 && (
        <div className="all-day-banner">
          <span className="all-day-label">All Day</span>
          <div className="all-day-items">
            {allDayItems.map((item) => {
              if (item.type === "event" || item.type === "task")
                return (
                  <CalendarCard
                    key={item.id}
                    type={item.type}
                    data={item.data}
                    viewMode="day"
                  />
                );
              else
                return (
                  <HealthCard
                    key={item.id}
                    type={item.type}
                    data={item.data}
                    viewMode="day"
                  />
                );
            })}
          </div>
        </div>
      )}

      {/* Hourly Calendar Grid (96 rows for 15-minute intervals) */}
      <div className="time-grid-scroll-container">
        <div className="time-grid">
          {/* Time labels for each hour */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="time-grid-label"
              style={{
                gridRowStart: index * 4 + 1,
                gridRowEnd: (index + 1) * 4 + 1,
              }}
            >
              {hour}
            </div>
          ))}

          {/* Content borders for grid-hour-rows */}
          {HOURS.map((hour, index) => (
            <div
              key={`line-${hour}-${index + 1}`}
              className="grid-hour-row"
              style={{
                gridRowStart: index * 4 + 1,
                gridRowEnd: (index + 1) * 4 + 1,
              }}
            />
          ))}

          {/* Item Cards */}
          {timedItems.map((item) => {
            return (
              <div
                className="timed-card-wrapper"
                key={item.id}
                style={{ gridRowStart: item.startRow, gridRowEnd: item.endRow }}
              >
                {item.type === "event" || item.type === "task" ? (
                  <CalendarCard
                    type={item.type}
                    data={item.data}
                    viewMode="day"
                  />
                ) : (
                  <HealthCard
                    type={item.type}
                    data={item.data}
                    viewMode="day"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export the DayView component
export default DayView;
