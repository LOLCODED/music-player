import React from "react";

const TrackListHeader: React.FC = () => (
  <div className="track-row header">
    <span className="track-row-num">#</span>
    <span className="track-row-main">Title</span>
    <span className="track-row-time">Time</span>
    <span className="track-row-actions" />
  </div>
);

export default TrackListHeader;
