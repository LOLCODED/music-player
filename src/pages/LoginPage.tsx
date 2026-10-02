import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { SubsonicConfig, APP_NAME, API_VERSION } from "../config/subsonic";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import SaveConnectionDialog from "../components/SaveConnectionDialog";
import Toast from "../components/Toast";
import { useSavedConnections, type SavedConnection } from "../hooks/useSavedConnections";

const LoginPage: React.FC = () => {
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [appName, setAppName] = useState(APP_NAME);
  const [apiVersion, setApiVersion] = useState(API_VERSION);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  // subsonicConfig holds the token+salt form of the credentials after a
  // successful login, so saved servers never contain the raw password.
  const { login, subsonicConfig } = useAuth();
  const {
    connections: savedCredentials,
    loadFailed,
    saveConnection,
    removeConnection,
  } = useSavedConnections();

  useEffect(() => {
    if (loadFailed) showToast("Could not load saved servers");
  }, [loadFailed, showToast]);

  const handleSaveCredential = (name: string) => {
    if (!subsonicConfig || !name) {
      showToast("Please enter a name for the server");
      return;
    }
    saveConnection(subsonicConfig, name);
    setShowSaveDialog(false);
    navigate("/albums", { replace: true });
  };

  const handleDeleteCredential = (id: string) => {
    removeConnection(id);
    showToast("Server removed");
  };

  const handleLoadCredential = async (cred: SavedConnection) => {
    setLoading(true);
    try {
      const success = await login(cred, true);
      if (success) {
        navigate("/albums", { replace: true });
      } else {
        showToast("Failed to connect. Please check your credentials.");
      }
    } catch {
      showToast("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl || !username || !password) {
      showToast("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const config: SubsonicConfig = {
        serverUrl: serverUrl.trim(),
        username: username.trim(),
        password,
        appName,
        apiVersion,
      };
      const success = await login(config, false);
      if (success) {
        setShowSaveDialog(true);
      } else {
        showToast("Failed to connect. Please check your credentials.");
      }
    } catch {
      showToast("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipSave = () => {
    setShowSaveDialog(false);
    navigate("/albums", { replace: true });
  };

  return (
    <div className="login-page">
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Cascade</div>
          <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Connect to your Subsonic server</div>
        </div>

        {savedCredentials.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Saved Servers
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {savedCredentials.map(cred => (
                <div key={cred.id} className="saved-server">
                  <div className="saved-server-info" onClick={() => handleLoadCredential(cred)}>
                    <div className="saved-server-name">{cred.name}</div>
                    <div className="saved-server-url">{cred.serverUrl} · {cred.username}</div>
                  </div>
                  <button
                    className="btn-icon"
                    onClick={() => handleDeleteCredential(cred.id)}
                    aria-label="Remove server"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="login-server-url">Server URL *</label>
            <input
              id="login-server-url"
              type="url"
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              placeholder="http://your-server.com:4040"
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-username">Username *</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-password">Password *</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-app-name">App Name</label>
            <input
              id="login-app-name"
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-api-version">API Version</label>
            <input
              id="login-api-version"
              type="text"
              value={apiVersion}
              onChange={e => setApiVersion(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} /> Connecting...</> : "Login"}
          </button>
        </form>
      </div>

      {showSaveDialog && (
        <SaveConnectionDialog
          title="Connection Successful"
          message="Save these credentials for future use?"
          cancelLabel="Skip"
          onSave={handleSaveCredential}
          onCancel={handleSkipSave}
        />
      )}

      <Toast message={toast} />
    </div>
  );
};

export default LoginPage;
