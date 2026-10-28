// Import all dependencies
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

// Import Components
import CalendarCard from "../../items/CalendarCard/CalendarCard";

// Import Styles
import "./CalendarList.css";

// CalendarList Component
const CalendarList = ({ type = "calendarList", itemsLimit }) => {
  // Select items from Redux store depending on whether we want calendar lists or task lists
  const calendarLists = useSelector((state) => state.calendar.calendarList.items);
  const taskLists = useSelector((state) => state.calendar.tasksList.items);

  // Determine items based on requested type ("calendarList" or "taskList")
  const rawItems = type === "taskList" ? taskLists : calendarLists;

  // Local state to keep track of displayed items count (for pagination/load more)
  const [displayedCount, setDisplayedCount] = useState(itemsLimit || 10);

  // Reset displayedCount when itemsLimit or type change
  useEffect(() => {
    setDisplayedCount(itemsLimit || 10);
  }, [itemsLimit, type]);

  const displayedItems = rawItems.slice(0, displayedCount);

  return (
    <div className="calendar-lists-container">
      {displayedItems.length > 0 ? (
        <div className="lists-grid">
          {displayedItems.map((item) => (
            <CalendarCard
              key={item.id}
              type={type}      
              data={item}
            />
          ))}
        </div>
      ) : (
        <div className="empty-list">
          <p>
            {type === "taskList" && "No task lists available."}
            {type === "calendarList" && "No calendar lists available."}
          </p>
        </div>
      )}

      {/* Load More Button */}
      {rawItems.length > displayedCount && (
        <div className="load-more-container">
          <button
            className="btn load-more-btn"
            onClick={() => setDisplayedCount((prev) => prev + 10)}
          >
            Load More ({Math.max(0, rawItems.length - displayedCount)} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

// Export the CalendarList component
export default CalendarList;