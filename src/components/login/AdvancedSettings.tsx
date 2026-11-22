import React, { useState } from "react";

interface Props {
  appName: string;
  apiVersion: string;
  onAppNameChange: (value: string) => void;
  onApiVersionChange: (value: string) => void;
}

const AdvancedSettings: React.FC<Props> = ({
  appName, apiVersion, onAppNameChange, onApiVersionChange,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="login-advanced">
      <button
        type="button"
        className="login-advanced-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Advanced
      </button>
      {open && (
        <div className="login-advanced-fields">
          <div className="login-field">
            <label htmlFor="login-app-name">Client name</label>
            <input id="login-app-name" type="text" value={appName} onChange={(e) => onAppNameChange(e.target.value)} />
          </div>
          <div className="login-field">
            <label htmlFor="login-api-version">API version</label>
            <input id="login-api-version" type="text" value={apiVersion} onChange={(e) => onApiVersionChange(e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
