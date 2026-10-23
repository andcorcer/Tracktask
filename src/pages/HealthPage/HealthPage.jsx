// Import all dependencies
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CircleChevronRight,
  CircleChevronLeft,
  ClipboardClock,
  CalendarClock,
  SportShoe,
  Maximize2,
} from "lucide-react";

// Import Components
import HealthList from "../../components/lists/HealthList/HealthList";
import Modal from "../../components/details/Modal/Modal";

// Import Actions
import { setSelectedDate } from "../../store/slices/dateSlice";

// Import Styles
import "./HealthPage.css";

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

// HealthPage Component
const HealthPage = () => {
  const dispatch = useDispatch();

  // Local state to manage the selected category for the modal component ("activities", "trainingPlans", "workouts")
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Get the selected date from the store
  const date = useSelector((state) => state.date.selectedDate);
  const selectedDate = useMemo(() => parseLocalDate(date), [date]);

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

  // Formatted date string
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="health-page-container">
      {/* Daily Summary Section */}
      <section className="daily-summary-section">
        <div className="daily-summary-header">
          {/* Date Navigation */}
          <h2 className="daily-summary-header-title">Daily Summary</h2>
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
        </div>
        <div className="daily-summary-content">
          <HealthList type="summary" startDate={date} />
        </div>
      </section>

      {/* All Other Health Data */}
      <div className="health-grid-sections">
        {/* Activities Section */}
        <section className="health-section">
          <div className="section-header">
            <h3 className="section-title">
              <SportShoe size={20} /> Recent Activities
            </h3>
            <button
              type="button"
              className="btn view-all-btn"
              onClick={() => setSelectedCategory("activities")}
            >
              <Maximize2 size={16} />
              View All
            </button>
          </div>
          <div
            className="section-content"
            onClick={() => setSelectedCategory("activities")}
          >
            <HealthList type="activity" itemLimit={10} />
          </div>
        </section>

        {/* Workouts Section */}
        <section className="health-section">
          <div className="section-header">
            <h3 className="section-title">
              <CalendarClock size={20} /> Upcoming Workouts
            </h3>
            <button
              type="button"
              className="btn view-all-btn"
              onClick={() => setSelectedCategory("workouts")}
            >
              <Maximize2 size={16} />
              View All
            </button>
          </div>
          <div
            className="section-content"
            onClick={() => setSelectedCategory("workouts")}
          >
            <HealthList type="workout" itemLimit={10} />
          </div>
        </section>

        {/* Training Plans Section */}
        <section className="health-section">
          <div className="section-header">
            <h3 className="section-title">
              <ClipboardClock size={20} /> Training Plans
            </h3>
            <button
              type="button"
              className="btn view-all-btn"
              onClick={() => setSelectedCategory("trainingPlans")}
            >
              <Maximize2 size={16} />
              View All
            </button>
          </div>
          <div
            className="section-content"
            onClick={() => setSelectedCategory("trainingPlans")}
          >
            <HealthList type="trainingPlan" itemLimit={10} />
          </div>
        </section>
      </div>

      {/* Modal Component to display the full Health List */}
      {selectedCategory && (
        <Modal
          title={`All ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
          onClose={() => setSelectedCategory(null)}
        >
          <div className="modal-full-list">
            <HealthList
              type={
                selectedCategory === "activities"
                  ? "activity"
                  : selectedCategory === "workouts"
                    ? "workout"
                    : "trainingPlan"
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

// Export the HealthPage component
export default HealthPage;
