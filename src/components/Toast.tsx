import React from "react";

interface ToastProps {
  message: string;
  className?: string;
}

const Toast: React.FC<ToastProps> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div
      className={`toast${className ? ` ${className}` : ""}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default Toast;
