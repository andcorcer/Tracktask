// Import all dependencies
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

// Import Components
import HealthCard from "../../items/HealthCard/HealthCard";
import CalendarCard from "../../items/CalendarCard/CalendarCard";

// Import Styles
import "./MonthView.css";

const formatLocalDate = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Function that returns the date string in the format "YYYY-MM-DD" for any calendar item
const getDateString = (item, type) => {
  // Normalize event dates to "YYYY-MM-DD" string
  if (type === "event") {
    const date = item.start?.dateTime || item.start?.date;
    return date ? date.split("T")[0] : null;
  }

  // Normalize task dates to "YYYY-MM-DD" string
  if (type === "task") {
    return item?.due ? item.due.split("T")[0] : null;
  }

  // Normalize activity dates to "YYYY-MM-DD" string
  if (type === "activity") {
    if (item?.startTimeLocal) return item.startTimeLocal.split(" ")[0];
    if (item?.startTimeGMT) return item.startTimeGMT.split(" ")[0];
  }

  // Normalize workout dates to "YYYY-MM-DD" string
  if (type === "workout") {
    return item?.date ? item.date.split("T")[0] : null;
  }
};

// MonthView Component
const MonthView = ({ selectedDate = new Date(), onViewChange }) => {
  // Events, tasks, activities, workouts and startDate states from the store
  const tasks = useSelector((state) => state.calendar.tasks.items);
  const events = useSelector((state) => state.calendar.events.items);
  const activities = useSelector((state) => state.garmin.activities.items);
  const workouts = useSelector((state) => state.garmin.upcomingWorkouts.items);
  const startDate = useSelector((state) => state.date.startDate);
  const endDate = useSelector((state) => state.date.endDate);

  // We get all dates in the current week based on the startDate from the store
  const monthDates = useMemo(() => {
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const targetMonth = selectedDate.getMonth();

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      return {
        date,
        dateString: date.toISOString().split("T")[0],
        index: i,
        dayNumber: date.getDate(),
        // To style differently the components that aren't in the current month
        isCurrentMonth: date.getMonth() === targetMonth,
      };
    });
  }, [startDate, selectedDate]);

  // Normalize all states
  const { allDayItemsByDay, timedItemsbyDay } = useMemo(() => {
    // We create arrays to hold all-day and timed items for each day of the month
    const allDayByDay = Array.from({ length: 42 }, () => []);
    const timedByDay = Array.from({ length: 42 }, () => []);

    // Map with date string that points to the index of the day in the month
    const dateToIndexMap = {};
    monthDates.forEach(({ dateString, index }) => {
      dateToIndexMap[dateString] = index;
    });

    // Normalize events
    events.forEach((event) => {
      const eventDateString = getDateString(event, "event");
      const dayIndex = dateToIndexMap[eventDateString];
      if (dayIndex === undefined) return; // Skip events that are not in the current month

      if (event.start?.date || !event.start?.dateTime)
        allDayByDay[dayIndex].push({
          id: event.id,
          type: "event",
          data: event,
        });
      else {
        timedByDay[dayIndex].push({
          id: event.id,
          type: "event",
          data: event,
        });
      }
    });

    // Normalize tasks
    tasks.forEach((task) => {
      const taskDateString = getDateString(task, "task");
      const dayIndex = dateToIndexMap[taskDateString];
      if (dayIndex === undefined) return; // Skip tasks that are not in the current month

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
      if (dayIndex === undefined) return; // Skip activities that are not in the current month

      timedByDay[dayIndex]?.push({
        id: activity.id,
        type: "activity",
        data: activity,
      });
    });

    // Normalize workouts
    workouts.forEach((workout) => {
      const workoutDateString = getDateString(workout, "workout");
      const dayIndex = dateToIndexMap[workoutDateString];
      if (dayIndex === undefined) return; // Skip workouts that are not in the current month

      allDayByDay[dayIndex]?.push({
        id: workout.id,
        type: "workout",
        data: workout,
      });
    });

    // Sort timed items by their start row
    timedByDay.forEach((_, index) =>
      timedByDay[index].sort((a, b) => a.startRow - b.startRow),
    );

    return { allDayItemsByDay: allDayByDay, timedItemsbyDay: timedByDay };
  }, [events, tasks, activities, workouts, monthDates]);

  return (
    <div className="month-view-container">
      {/* Header for all 7 days of the week */}
      <div className="month-grid-header">
        <span className="day-name">S</span>
        <span className="day-name">M</span>
        <span className="day-name">T</span>
        <span className="day-name">W</span>
        <span className="day-name">T</span>
        <span className="day-name">F</span>
        <span className="day-name">S</span>
      </div>

      <div className="month-grid-body">
        {monthDates.map((day) => (
          <div
            key={day.dateString}
            className={`month-day-container ${!day.isCurrentMonth ? "not-current-month" : ""}`}
          >
            {/* Header for all days of the month */}
            <div className="month-day-grid-header">
              <div
                onClick={() => onViewChange("day", day.date)}
                role="button"
                tabIndex={0}
                className={`date-circle ${day.dateString === formatLocalDate(new Date()) ? "active" : ""}`}
              >
                {day.dayNumber}
              </div>
            </div>

            {/* Render all-day items */}
            <div className="month-all-day-banner">
                {allDayItemsByDay[day.index].map((item) => {
                  if (item.type === "event" || item.type === "task") {
                    return (
                      <CalendarCard
                        key={item.id}
                        type={item.type}
                        data={item.data}
                        viewMode="month"
                      />
                    );
                  } else {
                    return (
                      <HealthCard
                        key={item.id}
                        type={item.type}
                        data={item.data}
                        viewMode="month"
                      />
                    );
                  }
                })}
            </div>

            {/* Item Cards */}
            {timedItemsbyDay[day.index].map((item) => {
              return (
                <div className="timed-card-wrapper" key={item.id}>
                  {item.type === "event" || item.type === "task" ? (
                    <CalendarCard
                      type={item.type}
                      data={item.data}
                      viewMode="month"
                    />
                  ) : (
                    <HealthCard
                      type={item.type}
                      data={item.data}
                      viewMode="month"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Export the MonthView component
export default MonthView;
