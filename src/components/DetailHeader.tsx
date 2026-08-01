import React from "react";
import { ArrowLeft } from "lucide-react";
import { useHistory } from "react-router-dom";

interface DetailHeaderProps {
  title: string;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ title }) => {
  const history = useHistory();

  return (
    <div className="page-header">
      <button
        className="btn-icon"
        onClick={() => history.goBack()}
        aria-label="Back"
      >
        <ArrowLeft size={18} />
      </button>
      <span className="page-header-title">{title}</span>
    </div>
  );
};

export default DetailHeader;
