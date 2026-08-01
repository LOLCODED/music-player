import React from "react";
import { Star } from "lucide-react";

interface StarActionButtonProps {
  starred: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const StarActionButton: React.FC<StarActionButtonProps> = ({ starred, onClick }) => {
  const label = starred ? "Remove from favorites" : "Add to favorites";
  return (
    <button
      className="btn-icon table-delete-btn"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Star size={13} fill={starred ? "currentColor" : "none"} />
    </button>
  );
};

export default StarActionButton;
