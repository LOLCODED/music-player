import React from "react";
import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}) => (
  <Modal title={title} onClose={onCancel}>
    <p>{message}</p>
    <div className="modal-actions">
      <button className="btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        className={destructive ? "btn btn-danger" : "btn btn-primary"}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
