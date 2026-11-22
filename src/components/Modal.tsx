import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Prefer focusing a form field so the close button does not steal focus.
const FIELD_SELECTOR = "input, select, textarea";
const FOCUSABLE_SELECTOR =
  "button, input, select, textarea, [tabindex]:not([tabindex='-1'])";

interface ModalProps {
  title: string;
  onClose: () => void;
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  showCloseButton = false,
  className,
  children,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const target =
      box.querySelector<HTMLElement>(FIELD_SELECTOR) ??
      box.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    target?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Portalled so a transformed page (during a swipe transition) can't become its containing block.
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={boxRef}
        className={className ? `modal-box ${className}` : "modal-box"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton ? (
          <div className="modal-header">
            <h3 id={titleId}>{title}</h3>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        ) : (
          <h3 id={titleId}>{title}</h3>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
