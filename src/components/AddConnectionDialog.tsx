import React, { useState } from "react";
import Modal from "./Modal";
import { API_VERSION, APP_NAME, SubsonicConfig } from "../config/subsonic";

interface AddConnectionDialogProps {
  onConnect: (config: SubsonicConfig, name: string) => Promise<boolean>;
  onClose: () => void;
}

const FIELDS = [
  { key: "name", label: "Name", type: "text", placeholder: "Home Server" },
  { key: "serverUrl", label: "Server URL", type: "url", placeholder: "http://your-server.com:4040" },
  { key: "username", label: "Username", type: "text", placeholder: "" },
  { key: "password", label: "Password", type: "password", placeholder: "" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

const EMPTY_VALUES: Record<FieldKey, string> = { name: "", serverUrl: "", username: "", password: "" };

const AddConnectionDialog: React.FC<AddConnectionDialogProps> = ({ onConnect, onClose }) => {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [connecting, setConnecting] = useState(false);

  const isComplete = FIELDS.every(({ key }) => values[key].trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || connecting) return;
    setConnecting(true);
    const config: SubsonicConfig = {
      serverUrl: values.serverUrl.trim(),
      username: values.username.trim(),
      password: values.password,
      appName: APP_NAME,
      apiVersion: API_VERSION,
    };
    const connected = await onConnect(config, values.name.trim());
    if (!connected) setConnecting(false);
  };

  return (
    <Modal title="Add Connection" onClose={onClose} showCloseButton>
      <form className="modal-form" onSubmit={handleSubmit}>
        {FIELDS.map(({ key, label, type, placeholder }) => (
          <div key={key} className="login-field">
            <label htmlFor={`connection-${key}`}>{label}</label>
            <input
              id={`connection-${key}`}
              type={type}
              placeholder={placeholder}
              value={values[key]}
              onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isComplete || connecting}>
            {connecting ? "Connecting..." : "Connect"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddConnectionDialog;
