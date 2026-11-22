import React from "react";
import { ListPlus } from "lucide-react";

interface AddToPlaylistButtonProps {
  className: string;
  onClick: () => void;
}

const AddToPlaylistButton: React.FC<AddToPlaylistButtonProps> = ({ className, onClick }) => (
  <button
    className={`btn-icon ${className}`}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    aria-label="Add to playlist"
    title="Add to playlist"
  >
    <ListPlus size={14} />
  </button>
);

export default AddToPlaylistButton;
