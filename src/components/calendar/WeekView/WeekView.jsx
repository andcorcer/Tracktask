// Import all dependencies
import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

// Import Components
import HealthCard from "../../items/HealthCard/HealthCard";
import CalendarCard from "../../items/CalendarCard/CalendarCard";

// Import Actions
import { setSelectedDate } from "../../../store/slices/dateSlice";

// Import Styles
import "./WeekView.css";

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

// Function that returns the date string in the format "YYYY-MM-DD" for any calendar item
const getDateString = (item, type) => {
  // Normalize event dates to "YYYY-MM-DD" string
  if (type === "event") {
    const date = new Date(item.start?.dateTime || item.start?.date);
    if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
  }

  // Normalize task dates to "YYYY-MM-DD" string
  if (type === "task") {
    const date = new Date(item.due);
    if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
  }

  // Normalize activity dates to "YYYY-MM-DD" string
  if (type === "activity") {
    if (item?.startTimeLocal) {
      const date = new Date(item.startTimeLocal.split(" ")[0]);
      if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
    }
    if (item?.startTimeGMT) {
      const gmtDate = new Date(item?.startTimeGMT.split(" ")[0]);
      if (!isNaN(gmtDate.getTime())) return gmtDate.toISOString().split("T")[0];
    }
  }

  // Normalize workout dates to "YYYY-MM-DD" string
  if (type === "workout") {
    if (item?.date) {
      return item.date;
    }
  }
};

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

// WeekView Component
const WeekView = ({ currentDate = new Date(), onViewChange }) => {
  const dispatch = useDispatch();

  // Events, tasks, activities, workouts and startDate states from the store
  const tasks = useSelector((state) => state.calendar.tasks.items || []);
  const events = useSelector((state) => state.calendar.events.items || []);
  const activities = useSelector(
    (state) => state.garmin.activities.items || [],
  );
  const workouts = useSelector(
    (state) => state.garmin.upcomingWorkouts.items || [],
  );
  const startDate = useSelector((state) => state.calendar.startDate);

  // We get all dates in the current week based on the startDate from the store
  const weekDates = useMemo(() => {
    if (!startDate) return [];

    const start = new Date(startDate);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      return {
        date,
        dateString: date.toISOString().split("T")[0],
        index: i,
        dayName: date
          .toLocaleDateString("en-US", { weekday: "short" })
          .toUpperCase(),
        dayNumber: date.getDate(),
      };
    });
  }, [startDate]);

  // Normalize all states
  const { allDayItemsByDay, timedItemsbyDay } = useMemo(() => {
    // We create arrays to hold all-day and timed items for each day of the week
    const allDayByDay = Array.from({ length: 7 }, () => []);
    const timedByDay = Array.from({ length: 7 }, () => []);

    // Map with date string that points to the index of the day in the week
    const dateToIndexMap = {};
    weekDates.forEach(({ dateString, index }) => {
      dateToIndexMap[dateString] = index;
    });

    // Normalize events
    events.forEach((event) => {
      const eventDateString = getDateString(event, "event");
      const dayIndex = dateToIndexMap[eventDateString];
      if (dayIndex === undefined) return; // Skip events that are not in the current week

      if (event.start?.date || !event.start?.dateTime)
        allDayByDay[dayIndex].push({
          id: event.id,
          type: "event",
          data: event,
        });
      else {
        const startRow = getGridRows(event.start?.dateTime);
        const endRow = event.end?.dateTime
          ? getGridRows(event.end?.dateTime)
          : startRow + 4; // Defaults to an hour after the start time
        timedByDay[dayIndex].push({
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
      const taskDateString = getDateString(task, "task");
      const dayIndex = dateToIndexMap[taskDateString];
      if (dayIndex === undefined) return; // Skip tasks that are not in the current week

      allDayByDay[dayIndex]?.push({
        id: task.id,
        type: "task",
        data: task,
      }); // We push all tasks since the tasks returned from the google tasks api don't provide a time (they always return '00:00:00.000Z')
    });

    // Normalize activities
    activities.forEach((activity) => {
      const activityDateString = getDateString(activity, "activity");
      const dayIndex = dateToIndexMap[activityDateString];
      if (dayIndex === undefined) return; // Skip activities that are not in the current week

      const activityDate = parseGarminTime(
        activity.startTimeLocal,
        activity.startTimeGMT,
      );

      if (activityDate) {
        const startRow = getGridRows(activityDate);
        const durationRows = activity.duration
          ? Math.max(1, Math.round(activity.duration / 900))
          : 4;
        timedByDay[dayIndex]?.push({
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
      const workoutDateString = getDateString(workout, "workout");
      const dayIndex = dateToIndexMap[workoutDateString];
      if (dayIndex === undefined) return; // Skip activities that are not in the current week

      if (workoutDateString) {
        allDayByDay[dayIndex]?.push({
          id: workout.id,
          type: "workout",
          data: workout,
        });
      }
    });

    // Sort timed items by their start row
    timedByDay.forEach((_, index) =>
      timedByDay[index].sort((a, b) => a.startRow - b.startRow),
    );

    return { allDayItemsByDay: allDayByDay, timedItemsbyDay: timedByDay };
  }, [events, tasks, activities, workouts, weekDates]);

  // We convert the current date to a string for easy comparison with the week dates
  const currentDateString = currentDate.toISOString().split("T")[0];

  return (
    <div className="week-view-container">
      {/* Header for all 7 days of the week */}
      <div className="week-grid-header">
        {weekDates.map((day) => (
          <div key={day.dateString} className="day-column-grid-header">
            <span className="day-name">{day.dayName}</span>
            <div
              onClick={() => {
                onViewChange("day");
                dispatch(
                  setSelectedDate({
                    selectedDate: day.date.toISOString().split("T")[0],
                  }),
                );
              }}
              role="button"
              tabIndex={0}
              className={`date-circle ${day.dateString === currentDateString ? "active" : ""}`}
            >
              {day.dayNumber}
            </div>
          </div>
        ))}
      </div>

      {/* Render all-day items */}
      <div className="week-all-day-banner">
        <span className="all-day-label">All Day</span>
        {weekDates.map((day) => (
          <div
            key={`all-day ${day.dateString}`}
            className="all-day-column"
            style={{ gridColumnStart: day.index + 2 }}
          >
            {allDayItemsByDay[day.index].map((item) => {
              if (item.type === "event" || item.type === "task")
                return (
                  <CalendarCard
                    key={item.id}
                    type={item.type}
                    data={item.data}
                    viewMode="week"
                  />
                );
              else
                return (
                  <HealthCard
                    key={item.id}
                    type={item.type}
                    data={item.data}
                    viewMode="week"
                  />
                );
            })}
          </div>
        ))}
      </div>

      {/* Hourly Calendar Grid (96 rows for 15-minute intervals) */}
      <div className="time-grid-scroll-container">
        <div className="week-time-grid">
          {/* Time labels for each hour */}
          {HOURS.map((hour, index) => (
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
                gridColumn: "2 / -1", // Span all columns except the time label column
              }}
            />
          ))}

          {/* Item Cards */}
          {weekDates.map((day) =>
            timedItemsbyDay[day.index].map((item) => {
              return (
                <div
                  className="timed-card-wrapper"
                  key={item.id}
                  style={{
                    gridRowStart: item.startRow,
                    gridRowEnd: item.endRow,
                    gridColumnStart: day.index + 2,
                    gridColumnEnd: day.index + 3,
                  }}
                >
                  {item.type === "event" || item.type === "task" ? (
                    <CalendarCard
                      type={item.type}
                      data={item.data}
                      viewMode="week"
                    />
                  ) : (
                    <HealthCard
                      type={item.type}
                      data={item.data}
                      viewMode="week"
                    />
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};

// Export the WeekView component
export default WeekView;
