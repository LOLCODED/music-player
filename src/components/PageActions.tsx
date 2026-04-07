import React, { useState, useEffect, useRef } from "react";
import { LogOut, Menu, RefreshCw, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";

interface PageActionsProps {
  onRefresh: () => void;
}

const menuItemStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  background: "transparent",
  border: "none",
  color: "var(--fg)",
  fontSize: 12,
  fontFamily: "inherit",
  cursor: "pointer",
};

const PageActions: React.FC<PageActionsProps> = ({ onRefresh }) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!isMobile) {
    return (
      <button className="btn-icon" onClick={onRefresh} title="Refresh" aria-label="Refresh">
        ↻
      </button>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn-icon" onClick={() => setOpen((v) => !v)} aria-label="Menu">
        <Menu size={18} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            minWidth: 140,
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <button
            style={menuItemStyle}
            onClick={() => { setOpen(false); onRefresh(); }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            style={menuItemStyle}
            onClick={() => { setOpen(false); history.push("/settings"); }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            style={menuItemStyle}
            onClick={() => { setOpen(false); logout(); }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default PageActions;
