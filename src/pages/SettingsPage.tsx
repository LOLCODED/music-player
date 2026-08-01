import React from "react";
import { useSettings } from "../contexts/SettingsContext";
import { PlayerPosition } from "../types/settings";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { LayoutDiagram } from "../components/LayoutDiagram";
import { LAYOUT_OPTIONS, FLOATER_CORNERS } from "../components/layoutOptions";

const ACCENT_COLORS = [
  { label: "Purple", value: "#8b5cf6" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Green", value: "#22c55e" },
  { label: "Yellow", value: "#eab308" },
  { label: "Orange", value: "#f97316" },
  { label: "Red", value: "#ef4444" },
  { label: "Pink", value: "#ec4899" },
  { label: "Indigo", value: "#6366f1" },
];

const MOBILE_POSITIONS = ["bottom", "top"] as const;

const SettingsPage: React.FC = () => {
  const {
    isDarkMode, toggleTheme, accentColor, setAccentColor,
    playerPosition, setPlayerPosition, mobilePlayerPosition, setMobilePlayerPosition,
  } = useSettings();
  const isDesktop = useIsDesktop();

  const isFloaterSelected = playerPosition.startsWith("floater");
  const selectedFloaterCorner = isFloaterSelected ? playerPosition : "floater-br";

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-header-title">Settings</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        <div className="settings-section-label">Appearance</div>

        <div className="settings-row">
          <span>Theme</span>
          <button
            className="settings-pill"
            style={{ minWidth: 100 }}
            onClick={toggleTheme}
          >
            {isDarkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        <div className="settings-section-label">Accent Color</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 8, paddingBottom: 16 }}>
          {ACCENT_COLORS.map(c => (
            <button
              key={c.value}
              title={c.label}
              aria-label={c.label}
              onClick={() => setAccentColor(c.value)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: c.value,
                border: accentColor === c.value
                  ? "3px solid var(--fg)"
                  : "3px solid transparent",
                outline: accentColor === c.value ? `2px solid ${c.value}` : "none",
                outlineOffset: 1,
                cursor: "pointer",
                padding: 0,
                transition: "transform 0.1s ease",
                transform: accentColor === c.value ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {!isDesktop && (
          <>
            <div className="settings-section-label">Mobile Player Position</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, paddingTop: 8 }}>
              {MOBILE_POSITIONS.map(pos => (
                <button
                  key={pos}
                  className={`settings-pill${mobilePlayerPosition === pos ? " is-selected" : ""}`}
                  onClick={() => setMobilePlayerPosition(pos)}
                >
                  {pos}
                </button>
              ))}
            </div>
          </>
        )}

        {isDesktop && (
          <>
            <div className="settings-section-label">Desktop Player Layout</div>
            <p style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 12 }}>
              Choose where the player appears on desktop.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              {LAYOUT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`settings-option-card${playerPosition === opt.value ? " is-selected" : ""}`}
                  onClick={() => setPlayerPosition(opt.value)}
                >
                  <LayoutDiagram layout={opt.layout} />
                  <span>{opt.label}</span>
                </button>
              ))}

              <button
                className={`settings-option-card${isFloaterSelected ? " is-selected" : ""}`}
                onClick={() => setPlayerPosition(selectedFloaterCorner as PlayerPosition)}
              >
                <LayoutDiagram layout="floater" />
                <span>Floater</span>
              </button>
            </div>

            {isFloaterSelected && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 8 }}>
                  Corner position
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {FLOATER_CORNERS.map(corner => (
                    <button
                      key={corner.value}
                      className={`settings-pill${playerPosition === corner.value ? " is-selected" : ""}`}
                      onClick={() => setPlayerPosition(corner.value)}
                    >
                      {corner.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
