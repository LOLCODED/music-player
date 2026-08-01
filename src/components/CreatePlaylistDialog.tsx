import React, { useState } from "react";
import Modal from "./Modal";

interface CreatePlaylistDialogProps {
  onSubmit: (name: string) => void;
  onClose: () => void;
}

const CreatePlaylistDialog: React.FC<CreatePlaylistDialogProps> = ({
  onSubmit,
  onClose,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Modal title="Create New Playlist" onClose={onClose} showCloseButton>
      <form className="modal-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Playlist name"
          aria-label="Playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePlaylistDialog;
