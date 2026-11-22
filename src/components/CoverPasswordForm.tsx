import React, { useState } from "react";

interface Props {
  username: string;
  busy: boolean;
  error?: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

const CoverPasswordForm: React.FC<Props> = ({ username, busy, error, onSubmit, onCancel }) => {
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) onSubmit(password);
  };

  return (
    <form className="cover-password" onSubmit={submit}>
      <label htmlFor="cover-password-input" className="cover-password-label">
        Navidrome password for {username}, needed once to upload covers
      </label>
      <div className="cover-password-row">
        <input
          id="cover-password-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          autoFocus
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !password}>
          {busy ? "Uploading…" : "Upload"}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
      {error && <div className="cover-password-error">{error}</div>}
    </form>
  );
};

export default CoverPasswordForm;
