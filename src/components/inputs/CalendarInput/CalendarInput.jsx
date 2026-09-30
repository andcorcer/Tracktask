// Import all dependencies
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, SquareCheck } from "lucide-react";

// Import Actions
import { createTask } from "../../../store/slices/calendarSlice";
import { createCalendarEvent } from "../../../store/slices/calendarSlice";

// Import Styles
import "./CalendarInput.css";

// Function to get the current local date
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDay()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// CalendarInput Component
const CalendarInput = ({ date, onClose }) => {
  const dispatch = useDispatch(); // Get the dispatch function from Redux to dispatch actions

  const { calendarList, tasksList } = useSelector((state) => state.calendar);

  // Local states to track what the input fields have
  const [entryType, setEntryType] = useState("event");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("General");
  const [selectedDate, setSelectedDate] = useState(date || getLocalDate());
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [isAllDay, setIsAllDay] = useState(false);

  // List ID selection

  const [calendarListId, setCalendarListId] = useState(
    calendarList?.selectedListId || "primary",
  );
  const [tasksListId, setTasksListId] = useState(
    tasksList?.selectedListId || "@default",
  );

  // Handler functions
  const handleSubmit = (e) => {
    e.preventDefault();

    // Not allow empty submissions
    if (!title.trim()) return;

    // If the enrty Type is event
    if (entryType === "event") {
      const eventData = {
        summary: title.trim(),
        description: description.trim(),
      };

      if (isAllDay) {
        eventData.start = { date: selectedDate };
        eventData.end = { date: selectedDate };
      } else {
        eventData.start = {
          dateTime: new Date(`${selectedDate}T${startTime}:00`).toISOString(),
        };
        eventData.end = {
          dateTime: new Date(`${selectedDate}T${endTime}:00`).toISOString(),
        };
      }

      dispatch(createCalendarEvent({ eventData, calendarListId }));
    } else {
      // If the enrty Type is task
      const taskData = {
        title: title.trim(),
        notes: description.trim(),
        due: new Date(`${selectedDate}T${endTime}:00`).toISOString(),
      };

      dispatch(createTask({ taskData, listId: tasksListId }));
    }

    // After submiting we close the Modal component
    onClose();
  };

  const handleClear = () => {
    setEntryType("event");
    setTitle("");
    setDescription("");
    setSelectedDate(date || getLocalDate());
    setStartTime("00:00");
    setEndTime("00:00");
    setIsAllDay(false);
    setCalendarListId(calendarList?.selectedListId || "primary");
    setTasksListId(tasksList?.selectedListId || "@default");
  };

  return (
    <form className="calendar-input-form" onSubmit={handleSubmit}>
      {/* Entry Selector */}
      <div className="form-group entry-type">
        <button
          type="button"
          className={`btn ${entryType === "event" ? "active" : ""}`}
          onClick={() => setEntryType("event")}
        >
          <Calendar size={18} />
          Event
        </button>
        <button
          type="button"
          className={`btn ${entryType === "task" ? "active" : ""}`}
          onClick={() => setEntryType("task")}
        >
          <SquareCheck size={18} />
          Task
        </button>
      </div>

      {/* Target List */}
      <div className="form-group target-list">
        <label htmlFor="target-list">
          {entryType === "event" ? "Calendar List" : "Tasks List"}
        </label>
        {entryType === "event" ? (
          <select
            id="target-list"
            value={calendarListId}
            onChange={({ target }) => setCalendarListId(target.value)}
          >
            <option value="primary">Primary Calendar List</option>
            {calendarList?.items.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
        ) : (
          <select
            id="target-list"
            value={tasksListId}
            onChange={({ target }) => setTasksListId(target.value)}
          >
            <option value="@default">Default Task List</option>
            {tasksList?.items.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Date */}
      <div className="form-row">
        <div className="form-group date">
          <label htmlFor="entry-date">Date</label>
          <input
            id="entry-date"
            type="date"
            value={selectedDate}
            onChange={({ target }) => setSelectedDate(target.value)}
            required
          />
        </div>

        {entryType === "event" && (
          <div className="form-group all-day">
            <label htmlFor="all-day-checkbox">
              <input
                id="all-day-checkbox"
                type="checkbox"
                checked={isAllDay}
                onChange={({ target }) => setIsAllDay(target.checked)}
              />
              All Day
            </label>
          </div>
        )}
      </div>

      {/* Time Selectors */}
      {!isAllDay && (
        <div className="form-row">
          {entryType === "event" && (
            <div className="form-group start-time">
              <label htmlFor="start-time">Start Time</label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={({ target }) => setStartTime(target.value)}
              />
            </div>
          )}

          <div className="form-group end-time">
            <label htmlFor="end-time">
              {entryType === "event" ? "End Time" : "Due Time"}
            </label>
            <input
              id="end-time"
              type="time"
              value={endTime}
              onChange={({ target }) => setEndTime(target.value)}
            />
          </div>
        </div>
      )}

      {/* Title / Description */}
      <div className="form-row">
        <div className="form-group title">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            placeholder="Title"
          />
        </div>

        <div className="form-group description">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={({ target }) => setDescription(target.value)}
            placeholder="Description"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="form-group actions">
        <button type="button" className="btn clear-btn" onClick={handleClear}>
          Clear
        </button>

        <button
          className="btn submit-btn"
          type="submit"
          disabled={!title.trim()}
        >
          {`Save ${entryType === "event" ? "Event" : "Task"}`}
        </button>
      </div>
    </form>
  );
};

// Export the CalendarInput component
export default CalendarInput;
