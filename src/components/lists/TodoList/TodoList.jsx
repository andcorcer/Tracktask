// Import all dependencies
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";

// Import Components
import TodoCard from "../../items/TodoCard/TodoCard";
import TodoInput from "../../inputs/TodoInput/TodoInput";
import Modal from "../../details/Modal/Modal";

// Import Styles
import "./TodoList.css";

// TodoList Component
const TodoList = ({ date, viewMode = "date" }) => {
  // We get the todos from the redux store
  const todos = useSelector((state) => state.todos.items);

  // Local state to render the TodoInput component conditionally
  const [showInput, setShowInput] = useState(false);

  const handleOpenInput = () => {
    setShowInput(true);
  };

  const handleCloseInput = () => {
    setShowInput(false);
  };

  // We filter the todos to display only the ones given by the viewMode prop
  const filteredTodos = todos.filter((todo) => {
    switch (viewMode) {
      // We filter for all "active" or non archived todos
      case "active":
        return !todo.archivedAt;

      // We filter for all "archived" todos
      case "archived":
        return !!todo.archivedAt;

      // We filter for "active" todos in a given date
      case "date":
        if (todo.isDaily) {
          // For daily todos, we check if it was created before the given date and not archived yet
          const wasCreatedBeforeDate = todo.createdAt <= date;
          const notArchivedYet = !todo.archivedAt || todo.archivedAt > date;
          // We return a boolean to indicate the filter weather to inlude the todo or not
          return wasCreatedBeforeDate && notArchivedYet;
        } else {
          // For non daily todos, we just check if the todo corresponds for the date it was set on
          return todo.createdAt === date;
        }

      default:
        return null;
    }
  });

  return (
    <div className="todo-list-container">
      {viewMode === "date" && (
        <button
          className="btn add-todo-btn"
          onClick={handleOpenInput}
          aria-label="Add Todo Button"
        >
          {<Plus size={14} />}
        </button>
      )}

      {/* We render todos conditionally weather filteredTodos has any items or not */}
      {filteredTodos.length > 0 ? (
        <div className="todo-list">
          {filteredTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} date={date} />
          ))}
        </div>
      ) : (
        <div className="empty-list">
          <p>
            {viewMode === "date" && "No todos for this date."}
            {viewMode === "active" && "No active todos."}
            {viewMode === "date" && "No archived todos."}
          </p>
        </div>
      )}

      {/* Conditionally render the TodoInput component */}
      {showInput && (
        <Modal onClose={handleCloseInput} title="Add Todo">
          <TodoInput date={date} onClose={handleCloseInput} />
        </Modal>
      )}
    </div>
  );
};

// Export the TodoList component
export default TodoList;
