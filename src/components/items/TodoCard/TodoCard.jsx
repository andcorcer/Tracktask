// Import all dependencies
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { CheckCircle2, Circle, Trash2, Tag, Repeat } from "lucide-react";

// Import Components
import DetailsCard from "../../details/DetailsCard/DetailsCard";

// Import Actions
import { toggleTodo, deleteTodo } from "../store/todosSlice";

// Import Styles
import "./TodoCard.css";

// TodoCard Component
const TodoCard = ({ todo, date }) => {
  const dispatch = useDispatch(); // Get the dispatch function from Redux to dispatch actions

  // Local state to render the DetailsCard component conditionally
  const [showDetails, setShowDetails] = useState(false);

  const completed = todo.isDaily ? !!todo.completedDates?.[date] : completed;

  // Handlers
  const handleToggle = () => {
    dispatch(toggleTodo({ id: todo.id, date: todo.date }));
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Doesn't affect parent elements
    dispatch(deleteTodo(todo.id));
  };

  const handleOpenDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className={`todo-card ${completed ? "completed" : ""}`}>
      {/* Button to access the details upon clicking the todo */}
      <button className="btn todo-details" onClick={handleOpenDetails}>
        {/* Checkbox toggle button */}
        <button
          className={`btn checkbox-btn ${completed ? "checked" : ""}`}
          onClick={handleToggle}
          aria-label={completed ? "Todo incomplete" : "Todo complete"}
        >
          {completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
        </button>

        {/* Main task content */}
        <div className="todo-content">
          <p className="todo-text">{todo.data}</p>
          <div className="todo-meta">
            <span className="category-badge">
              <Tag size={12} />
              {todo.category}
            </span>
            {todo.isDaily && (
              <span className="daily-badge">
                <Repeat size={12} />
                Daily
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          className="btn delete-btn"
          onClick={handleDelete}
          title="Delete Todo"
          aria-label="Delete Todo"
        >
          <Trash2 size={14} />
        </button>
      </button>

      {/* Conditionally render the DetailsCard component */}
      {showDetails && (
        <DetailsCard type="todo" item={todo} date={date} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

// Export the TodoCard component
export default TodoCard;
