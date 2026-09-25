// Import all dependencies
import React from "react";
import { useSelector } from "react-redux";

// Import Components
import TodoCard from "../../items/TodoCard/TodoCard";

// Import Styles
import './TodoList.css'

// TodoList Component 
const TodoList = ({ date }) => {

   // We get the todos from the redux store 
   const todos = useSelector((state) => state.todos.items);

   // We filter the todos to disply only the ones on a given date
   const filteredTodosForDate = todos.filter((todo) => {
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
   });

   return (
    <div className="todo-list-container">
      {/* We render todos conditionally weather filteredTodosForDate has any items or not */}
      {filteredTodosForDate.length > 0 ? (
         <div className="todo-list">
            {filteredTodosForDate.map((todo) => {
               <TodoCard key={todo.id} todo={todo} date={date} />
            })}
         </div>
      ) : (
         <div className="empty-list">
            <p>No todos for this date.</p>
         </div>
      )}
    </div>
   ); 
}

// Export the TodoList component
export default TodoList;