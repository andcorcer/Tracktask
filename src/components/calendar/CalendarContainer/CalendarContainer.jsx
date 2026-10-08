// Import all dependencies
import React, { useState } from "react";
import { X } from "lucide-react";

// Import Styles
import "./CalendarContainer.css";

// CalendarContainer Component
const CalendarContainer = ({}) => {
  // Local state to handle the view mode
  const [viewMode, setViewMode] = useState("day"); // Default view mode is "day"

  // Handlers
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          <button
            className="btn close-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* We render whichever component is passed between the modals opening and closing tags */}
          {children}
        </div>
      </div>
    </div>
  );
};

// Export the CalendarContainer component
export default CalendarContainer;
