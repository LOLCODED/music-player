import React, { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useToast } from "../hooks/useToast";
import {
  isSameConnection,
  useSavedConnections,
  type SavedConnection,
} from "../hooks/useSavedConnections";
import { SubsonicConfig } from "../config/subsonic";
import { withTokenAuth } from "../services/SubsonicBase";
import AddConnectionDialog from "../components/AddConnectionDialog";
import SaveConnectionDialog from "../components/SaveConnectionDialog";
import Toast from "../components/Toast";

interface ConnectionRowProps {
  connection: SavedConnection;
  isActive: boolean;
  isSwitching: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const ConnectionRow: React.FC<ConnectionRowProps> = ({
  connection, isActive, isSwitching, onSelect, onRemove,
}) => (
  <div className={`saved-server${isActive ? " is-active" : ""}`}>
    <button
      className="saved-server-info"
      onClick={onSelect}
      disabled={isActive}
      aria-current={isActive ? "true" : undefined}
    >
      <div className="saved-server-name">{connection.name}</div>
      <div className="saved-server-url">{connection.serverUrl} · {connection.username}</div>
    </button>
    {isSwitching && <div className="spinner" style={{ width: 14, height: 14 }} />}
    {isActive && <Check size={14} className="saved-server-active-icon" aria-label="Connected" />}
    <button
      className="btn-icon"
      onClick={onRemove}
      aria-label={`Remove ${connection.name}`}
    >
      <Trash2 size={14} />
    </button>
  </div>
);

const ConnectionsPage: React.FC = () => {
  const { login, subsonicConfig } = useAuth();
  const { stop } = useMusicPlayer();
  const { toast, showToast } = useToast();
  const { connections, loadFailed, saveConnection, removeConnection } = useSavedConnections();
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    if (loadFailed) showToast("Could not load saved servers");
  }, [loadFailed, showToast]);

  const isActive = (connection: SubsonicConfig) =>
    subsonicConfig !== null && isSameConnection(connection, subsonicConfig);

  const connectTo = async (config: SubsonicConfig, name: string): Promise<boolean> => {
    const switched = await login(config, true);
    if (!switched) {
      showToast(`Could not connect to ${name}`);
      return false;
    }
    stop();
    showToast(`Connected to ${name}`);
    return true;
  };

  const handleSelect = async (connection: SavedConnection) => {
    if (switchingId) return;
    setSwitchingId(connection.id);
    await connectTo(connection, connection.name);
    setSwitchingId(null);
  };

  const handleAdd = async (config: SubsonicConfig, name: string): Promise<boolean> => {
    const authConfig = withTokenAuth(config);
    if (!(await connectTo(authConfig, name))) return false;
    saveConnection(authConfig, name);
    setShowAddDialog(false);
    return true;
  };

  const handleSaveCurrent = (name: string) => {
    if (!subsonicConfig || !name) {
      showToast("Please enter a name for the server");
      return;
    }
    saveConnection(subsonicConfig, name);
    setShowSaveDialog(false);
  };

  const isCurrentUnsaved = subsonicConfig !== null && !connections.some(isActive);

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-header-title">Connections</span>
        <button className="btn btn-primary" onClick={() => setShowAddDialog(true)}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="connections-list">
        {isCurrentUnsaved && (
          <div className="saved-server is-active">
            <div className="saved-server-info">
              <div className="saved-server-name">Current connection</div>
              <div className="saved-server-url">{subsonicConfig.serverUrl} · {subsonicConfig.username}</div>
            </div>
            <button className="btn" onClick={() => setShowSaveDialog(true)}>
              Save
            </button>
          </div>
        )}
        {connections.map((connection) => (
          <ConnectionRow
            key={connection.id}
            connection={connection}
            isActive={isActive(connection)}
            isSwitching={switchingId === connection.id}
            onSelect={() => handleSelect(connection)}
            onRemove={() => removeConnection(connection.id)}
          />
        ))}
      </div>

      {showAddDialog && (
        <AddConnectionDialog onConnect={handleAdd} onClose={() => setShowAddDialog(false)} />
      )}
      {showSaveDialog && (
        <SaveConnectionDialog
          title="Save Connection"
          message="Name this connection so you can switch back to it later."
          cancelLabel="Cancel"
          onSave={handleSaveCurrent}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
};

export default ConnectionsPage;
