// Import all dependencies
import React, { useState } from "react";
import { useDispatch } from "react-redux";

// Import Actions
import { createTodo } from "../../../store/slices/todosSlice";

// Import Styles
import "./TodoInput.css";

// TodoInput Component
const TodoInput = ({ date, onClose }) => {
  const dispatch = useDispatch(); // Get the dispatch function from Redux to dispatch actions

  // Local states to track what the input fields have
  const [data, setData] = useState("");
  const [category, setCategory] = useState("General");
  const [isDaily, setIsDaily] = useState(false);

  // Handler functions
  const handleSubmit = (e) => {
    e.preventDefault();

    // Not allow empty submissions
    if (!data.trim()) return;

    // We determine the date using the passed down date or create a new one (We just grab the date and not the time)
    const targetDate = date || new Date().toISOString().split("T")[0];

    dispatch(
      createTodo({ data: data.trim(), category, isDaily, date: targetDate }),
    );

    // After submiting we close the Modal component
    onClose();
  };

  return (
    <form className="todo-input-form" onSubmit={handleSubmit}>
      <div className="description">
        <label htmlFor="todo-data">Description</label>
        <input
          id="todo-data"
          type="text"
          value={data}
          onChange={({ target }) => setData(target.value)}
          placeholder="What do you need to do?"
          autoFocus
          required
        />
      </div>

      <div className="other-data">
        <div className="category">
          <label htmlFor="todo-category">Category</label>
          <select
            id="todo-category"
            value={category}
            onChange={({ target }) => setCategory(target.value)}
          >
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="School">School</option>
            <option value="Health">Health</option>
            <option value="Errands">Errands</option>
          </select>
        </div>

        <div className="daily">
          <label htmlFor="todo-isDaily">Daily Habit</label>
          <input
            id="todo-isDaily"
            type="checkbox"
            checked={isDaily}
            onChange={({ target }) => setIsDaily(target.checked)}
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn clear-btn"
          onClick={() => {
            setData("");
            setCategory("General");
            setIsDaily(false);
          }}
        >
          Clear
        </button>

        <button
          className="btn submit-btn"
          type="submit"
          disabled={!data.trim()}
        >
          Save Todo
        </button>
      </div>
    </form>
  );
};

// Export the TodoInput component
export default TodoInput;
