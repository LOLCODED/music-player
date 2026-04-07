import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { SubsonicConfig } from "../config/subsonic";
import { useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface SavedCredential extends SubsonicConfig {
  id: string;
  name: string;
}

const LoginPage: React.FC = () => {
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [appName, setAppName] = useState("CascadeMusicPlayer");
  const [apiVersion, setApiVersion] = useState("1.16.1");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<SavedCredential[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [currentConfig, setCurrentConfig] = useState<SubsonicConfig | null>(null);

  const history = useHistory();
  const { login } = useAuth();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("savedCredentials");
    if (saved) {
      try { setSavedCredentials(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleSaveCredential = () => {
    if (!currentConfig || !saveName.trim()) {
      showToast("Please enter a name for the server");
      return;
    }
    const newCredential: SavedCredential = {
      id: Date.now().toString(),
      name: saveName.trim(),
      ...currentConfig,
    };
    const updated = [...savedCredentials, newCredential];
    localStorage.setItem("savedCredentials", JSON.stringify(updated));
    setSavedCredentials(updated);
    setShowSaveDialog(false);
    setSaveName("");
    history.replace("/albums");
  };

  const handleDeleteCredential = (id: string) => {
    const updated = savedCredentials.filter(c => c.id !== id);
    localStorage.setItem("savedCredentials", JSON.stringify(updated));
    setSavedCredentials(updated);
    showToast("Server removed");
  };

  const handleLoadCredential = async (cred: SavedCredential) => {
    setLoading(true);
    try {
      const success = await login(cred, true);
      if (success) {
        history.replace("/albums");
      } else {
        showToast("Failed to connect. Please check your credentials.");
      }
    } catch {
      showToast("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
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
        setCurrentConfig(config);
        setSaveName("");
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

        <div className="login-card">
          <div className="login-field">
            <label>Server URL *</label>
            <input
              type="url"
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              placeholder="http://your-server.com:4040"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="login-field">
            <label>Username *</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="login-field">
            <label>Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="login-field">
            <label>App Name</label>
            <input
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label>API Version</label>
            <input
              type="text"
              value={apiVersion}
              onChange={e => setApiVersion(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} /> Connecting...</> : "Login"}
          </button>
        </div>
      </div>

      {/* Save credentials dialog */}
      {showSaveDialog && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Connection Successful</h3>
            <p>Save these credentials for future use?</p>
            <input
              type="text"
              placeholder="Server name (e.g. Home Server)"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSaveCredential()}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn"
                onClick={() => { setShowSaveDialog(false); history.replace("/albums"); }}
              >
                Skip
              </button>
              <button className="btn btn-primary" onClick={handleSaveCredential}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default LoginPage;
