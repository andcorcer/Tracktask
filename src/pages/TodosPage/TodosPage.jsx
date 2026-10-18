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

// TodosPage Component
const TodosPage = () => {
  const dispatch = useDispatch();
  // Local states
  const [viewMode, setViewMode] = useState("date"); // "date" || "active" || "archived"

  // Get the selected date from the store
  const date = useSelector((state) => state.date.selectedDate);
  const selectedDate = useMemo(() => new Date(date), [date]);

  // Get todos from the store
  const todos = useSelector((state) => state.todos.items || []);

  // Handler to handle navigation
  const handleNavigation = (direction) => {
    const newDate = new Date(selectedDate);
    // Handle "today" navigation
    if (direction === "today") {
      dispatch(
        setSelectedDate({
          selectedDate: new Date().toISOString().split("T")[0],
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
    dispatch(
      setSelectedDate({ selectedDate: newDate.toISOString().split("T")[0] }),
    );
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
        <div className="date-navigation">
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
          <h2 className="calendar-header-title">{formattedDate}</h2>
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
