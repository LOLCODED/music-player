import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { markNavigationIntent } from "../utils/navigationIntent";

interface DetailHeaderProps {
  title: string;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <button
        className="btn-icon"
        onClick={() => {
          markNavigationIntent("back");
          navigate(-1);
        }}
        aria-label="Back"
      >
        <ArrowLeft size={18} />
      </button>
      <span className="page-header-title">{title}</span>
    </div>
  );
};

export default DetailHeader;
