import React from "react";
import { Play } from "lucide-react";
import { trackNumber } from "../../utils/trackNumber";

export interface LoginFields {
  serverUrl: string;
  username: string;
  password: string;
}

interface Props {
  fields: LoginFields;
  connecting: boolean;
  onChange: (fields: LoginFields) => void;
  onSubmit: () => void;
}

const ROWS: { key: keyof LoginFields; label: string; type: string; placeholder: string; autoComplete: string }[] = [
  { key: "serverUrl", label: "Server", type: "url", placeholder: "https://your.server", autoComplete: "url" },
  { key: "username", label: "Username", type: "text", placeholder: "", autoComplete: "username" },
  { key: "password", label: "Password", type: "password", placeholder: "", autoComplete: "current-password" },
];

/** The sign-in fields laid out as a record's tracklist. */
const LinerForm: React.FC<Props> = ({ fields, connecting, onChange, onSubmit }) => {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="liner-form" onSubmit={submit}>
      {ROWS.map(({ key, label, type, placeholder, autoComplete }, i) => (
        <label key={key} className="liner-row">
          <span className="liner-row-number">{trackNumber(i)}</span>
          <span className="liner-row-label">{label}</span>
          <input
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            value={fields[key]}
            onChange={(e) => onChange({ ...fields, [key]: e.target.value })}
            disabled={connecting}
          />
        </label>
      ))}
      <button type="submit" className="liner-connect" disabled={connecting}>
        {connecting ? <span className="spinner liner-connect-spinner" /> : <Play size={14} fill="currentColor" />}
        {connecting ? "Connecting…" : "Play / Connect"}
      </button>
    </form>
  );
};

export default LinerForm;
