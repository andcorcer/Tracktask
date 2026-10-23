// Import all dependencies
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CircleChevronRight,
  CircleChevronLeft,
  Calendar,
  ShieldCheck,
  Archive,
} from "lucide-react";

// Import Components
import TodoList from "../../components/lists/TodoList/TodoList";

// Import Actions
import { setSelectedDate } from "../../store/slices/dateSlice";
import { deleteTodosPermanently } from "../../store/slices/todosSlice";

// Import Styles
import "./TodosPage.css";

// Function that gets the local current date
const getLocalCurrentDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Function that safely parses a date string into a local Date object
const parseLocalDate = (date) => {
  if (!date) return getLocalCurrentDate();
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Function that safely formats a local Date object into "YYYY-MM-DD" format
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// TodosPage Component
const TodosPage = () => {
  const dispatch = useDispatch();
  // Local states
  const [viewMode, setViewMode] = useState("date"); // "date" || "active" || "archived"

  // Get the selected date from the store
  const date = useSelector((state) => state.date.selectedDate);
  const selectedDate = useMemo(() => parseLocalDate(date), [date]);

  // Get todos from the store
  const todos = useSelector((state) => state.todos.items || []);

  // Handler to handle navigation
  const handleNavigation = (direction) => {
    const newDate = new Date(selectedDate);
    // Handle "today" navigation
    if (direction === "today") {
      dispatch(
        setSelectedDate({
          selectedDate: formatLocalDate(getLocalCurrentDate()),
        }),
      );
      return;
    }

    // Handle "next" and "prev" navigation
    if (direction === "next") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    }
    dispatch(setSelectedDate({ selectedDate: formatLocalDate(newDate) }));
  };

  // Handle permanent deletion of todos
  const handleDeletePermanently = () => {
    dispatch(deleteTodosPermanently());
  };

  // Formatted date string
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="todos-page-container">
      {/* Header and Todo Actions */}
      <header className="todos-page-header">
        <div className="todos-page-actions">
          <h2 className="todos-page-title">Todos</h2>
          {/* Permanent Delete Button */}
          {todos.length > 0 && (
            <button
              type="button"
              className="btn delete-permanently-btn"
              onClick={handleDeletePermanently}
            >
              Delete All Permanently
            </button>
          )}
        </div>
        <div className="todos-page-controls">
          {/* View Mode Switcher */}
          <div
            className="view-mode-switcher"
            role="radiogroup"
            aria-label="Todo-Filter-Options"
          >
            <button
              role="button"
              className={`btn view-btn ${viewMode === "date" ? "active" : ""}`}
              onClick={() => setViewMode("date")}
            >
              <Calendar size={16} />
              <span>By Date</span>
            </button>

            <button
              role="button"
              className={`btn view-btn ${viewMode === "active" ? "active" : ""}`}
              onClick={() => setViewMode("active")}
            >
              <ShieldCheck size={16} />
              <span>Active</span>
            </button>

            <button
              role="button"
              className={`btn view-btn ${viewMode === "archived" ? "active" : ""}`}
              onClick={() => setViewMode("archived")}
            >
              <Archive size={16} />
              <span>Archived</span>
            </button>
          </div>

          {/* Date Navigation */}
          {viewMode === "date" && (
            <div className="date-navigation">
            <span className="nav-date">{formattedDate}</span>
            <div className="nav-controls">
              <button
                type="button"
                className="btn today-btn"
                onClick={() => handleNavigation("today")}
              >
                Today
              </button>

              <div className="nav-arrows">
                <button
                  type="button"
                  className="btn nav-btn"
                  onClick={() => handleNavigation("prev")}
                >
                  <CircleChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="btn nav-btn"
                  onClick={() => handleNavigation("next")}
                >
                  <CircleChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </header>

      {/* Todo List Section */}
      <div className="todo-list-section">
        <TodoList
          date={date}
          viewMode={viewMode}
          itemsLimit={viewMode !== "date" ? 10 : undefined}
        />
      </div>
    </div>
  );
};

// Export the TodosPage component
export default TodosPage;
