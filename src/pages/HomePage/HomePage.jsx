// Import all dependencies
import React from "react";
import { useSelector } from "react-redux";

// Import Components
import CalendarContainer from "../../components/calendar/CalendarContainer/CalendarContainer";
import TodoList from "../../components/lists/TodoList/TodoList";
import HealthList from "../../components/lists/HealthList/HealthList";

// Import Styles
import './HomePage.css'

// Function that safely parses a date string into a local Date object
const parseLocalDate = (date) => {
  if (!date) return new Date();
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// HomePage Component 
const HomePage = () => {
   // Get states from the store
   const date = useSelector((state) => state.date.selectedDate);
   const activities = useSelector((state) => state.garmin.activities?.items);
   const workouts = useSelector((state) => state.garmin.upcomingWorkouts?.items);

   const startDate = date;
   const endDate = date;

   const localDateObject = parseLocalDate(date);
   const dateString = localDateObject.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
   }); 

   return (
    <div className="home-page-container">
      {/* Main Calendar Section */}
      <section className="home-calendar-section">
         <CalendarContainer isHomePage={true} />
      </section>

      {/* Dashboard Widgets Section */}
      <aside className="home-dashboard-widgets">

         {/* Todo Widget */}
         <div className="dashboard-widget todo-widget">
            <h3 className="widget-title">Todos for {dateString}</h3>
            <TodoList date={date} />
         </div>

         {/* Health Widget */}
         <div className="dashboard-widget health-summary-widget">
            <h3 className="widget-title">Health Summary for {dateString}</h3>
            <HealthList type="summary" startDate={startDate} />
         </div>

         {/* Workouts Widget */}
         {workouts.length > 0 && (
            <div className="dashboard-widget workouts-widget">
               <h3 className="widget-title">Scheduled Workouts for {dateString}</h3>
               <HealthList type="workout" startDate={startDate} endDate={endDate} />
            </div>
         )}

         {/* Activities Widget */}
         {activities.length > 0 && (
            <div className="dashboard-widget activities-widget">
               <h3 className="widget-title">Recorded Activities for {dateString}</h3>
               <HealthList type="activity" startDate={startDate} endDate={endDate} />
            </div>
         )}
      </aside>

    </div>
   ); 
}

export default HomePage;