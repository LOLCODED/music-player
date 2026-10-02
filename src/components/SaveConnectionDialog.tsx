import React, { useState } from "react";
import Modal from "./Modal";

interface SaveConnectionDialogProps {
  title: string;
  message: string;
  cancelLabel: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const SaveConnectionDialog: React.FC<SaveConnectionDialogProps> = ({
  title,
  message,
  cancelLabel,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim());
  };

  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <form className="modal-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Server name (e.g. Home Server)"
          aria-label="Server name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SaveConnectionDialog;
