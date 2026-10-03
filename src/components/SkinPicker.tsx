import React from "react";
import { useSettings } from "../contexts/SettingsContext";
import { SKIN_OPTIONS } from "./skinOptions";

const SkinPicker: React.FC = () => {
  const { skin, setSkin } = useSettings();

  return (
    <div className="skin-picker" role="radiogroup" aria-label="Skin">
      {SKIN_OPTIONS.map(({ value, label, swatch: [background, surface, accent] }) => (
        <button
          key={value}
          role="radio"
          aria-checked={skin === value}
          className={`settings-option-card${skin === value ? " is-selected" : ""}`}
          onClick={() => setSkin(value)}
        >
          <span className="skin-swatch" style={{ background }} aria-hidden="true">
            <span className="skin-swatch-bar" style={{ background: surface }} />
            <span className="skin-swatch-dot" style={{ background: accent }} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default SkinPicker;
