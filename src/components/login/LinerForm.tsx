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

type EnterKeyHint = React.InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];

const ROWS: { key: keyof LoginFields; label: string; type: string; placeholder: string; autoComplete: string; enterKeyHint: EnterKeyHint }[] = [
  { key: "serverUrl", label: "Server", type: "url", placeholder: "https://your.server", autoComplete: "url", enterKeyHint: "next" },
  { key: "username", label: "Username", type: "text", placeholder: "", autoComplete: "username", enterKeyHint: "next" },
  { key: "password", label: "Password", type: "password", placeholder: "", autoComplete: "current-password", enterKeyHint: "go" },
];

// Wait for the keyboard to finish opening before centring the field it covers.
const KEYBOARD_SETTLE_MS = 300;

function revealField(e: React.FocusEvent<HTMLInputElement>) {
  const field = e.currentTarget;
  window.setTimeout(() => field.scrollIntoView({ block: "center", behavior: "smooth" }), KEYBOARD_SETTLE_MS);
}

function advanceOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== "Enter" || e.currentTarget.enterKeyHint !== "next") return;
  const fields = [...(e.currentTarget.form?.querySelectorAll("input") ?? [])];
  const next = fields[fields.indexOf(e.currentTarget) + 1];
  if (!next) return;
  e.preventDefault();
  next.focus();
}

/** The sign-in fields laid out as a record's tracklist. */
const LinerForm: React.FC<Props> = ({ fields, connecting, onChange, onSubmit }) => {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="liner-form" onSubmit={submit}>
      {ROWS.map(({ key, label, type, placeholder, autoComplete, enterKeyHint }, i) => (
        <label key={key} className="liner-row">
          <span className="liner-row-number">{trackNumber(i)}</span>
          <span className="liner-row-label">{label}</span>
          <input
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint={enterKeyHint}
            onFocus={revealField}
            onKeyDown={advanceOnEnter}
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
