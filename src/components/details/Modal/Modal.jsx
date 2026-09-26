// Import all dependencies
import React, { useEffect } from "react";
import { X } from "lucide-react";

// Import Styles
import "./Modal.css";

// Modal Component
const Modal = ({ title, onClose, children }) => {
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Not allow to scroll on the 'main body'
    document.body.style.overflow = "hidden";

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Allow to scroll on the 'main body'
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
   <div className="modal-overlay" onClick={onClose} role="button" tabIndex={0}>
      <div className="modal-container" onClick={(e) => e.stopPropagation}>

         <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            <button className="btn close-modal-btn" onClick={onClose} aria-label="Close modal button">
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

// Export the Modal component
export default Modal;
