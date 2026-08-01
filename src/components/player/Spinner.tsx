import React from "react";

const SPINNER_TRACK_BORDER = "2px solid rgba(255,255,255,0.3)";
const DEFAULT_SPINNER_SIZE = 14;

interface SpinnerProps {
  size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ size = DEFAULT_SPINNER_SIZE }) => (
  <div
    className="spinner"
    style={{ width: size, height: size, border: SPINNER_TRACK_BORDER, borderTopColor: "white" }}
  />
);

export default React.memo(Spinner);
