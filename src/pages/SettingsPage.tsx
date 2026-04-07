import React, { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { PlayerPosition } from "../types/settings";
import { LayoutDiagram, LAYOUT_OPTIONS, FLOATER_CORNERS } from "../components/LayoutDiagram";

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

const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleTheme, accentColor, setAccentColor, playerPosition, setPlayerPosition, mobilePlayerPosition, setMobilePlayerPosition } = useSettings();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isFloaterSelected = playerPosition.startsWith("floater");
  const selectedFloaterCorner = isFloaterSelected ? playerPosition : "floater-br";

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid var(--border)",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--fg-muted)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 24,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="page-header">
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Settings</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>

        {/* Appearance */}
        <div style={sectionLabelStyle}>Appearance</div>

        <div style={rowStyle}>
          <span>Theme</span>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--fg)",
              fontSize: 12,
              fontFamily: "inherit",
              cursor: "pointer",
              minWidth: 100,
              justifyContent: "center",
            }}
          >
            {isDarkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {/* Accent Color */}
        <div style={sectionLabelStyle}>Accent Color</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 8, paddingBottom: 16 }}>
          {ACCENT_COLORS.map(c => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setAccentColor(c.value)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: c.value,
                border: accentColor === c.value
                  ? `3px solid var(--fg)`
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

        {/* Mobile Player Position — mobile only */}
        {!isDesktop && (
          <>
            <div style={sectionLabelStyle}>Mobile Player Position</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, paddingTop: 8 }}>
              {(['bottom', 'top'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => setMobilePlayerPosition(pos)}
                  style={{
                    padding: "5px 16px",
                    background: mobilePlayerPosition === pos ? "var(--accent)" : "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 5,
                    color: mobilePlayerPosition === pos ? "white" : "var(--fg)",
                    fontSize: 11,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    textTransform: "capitalize",
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Player Layout (desktop only) */}
        {isDesktop && (
          <>
            <div style={sectionLabelStyle}>Desktop Player Layout</div>
            <p style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 12 }}>
              Choose where the player appears on desktop.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              {LAYOUT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPlayerPosition(opt.value)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    background: playerPosition === opt.value ? "var(--bg-elevated)" : "var(--bg-surface)",
                    border: playerPosition === opt.value
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border)",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "var(--fg)",
                    fontSize: 11,
                    fontFamily: "inherit",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  {opt.diagram}
                  <span>{opt.label}</span>
                </button>
              ))}

              {/* Floater option */}
              <button
                onClick={() => setPlayerPosition(selectedFloaterCorner as PlayerPosition)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  background: isFloaterSelected ? "var(--bg-elevated)" : "var(--bg-surface)",
                  border: isFloaterSelected
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "var(--fg)",
                  fontSize: 11,
                  fontFamily: "inherit",
                  transition: "border-color 0.15s ease",
                }}
              >
                <LayoutDiagram layout="floater" />
                <span>Floater</span>
              </button>
            </div>

            {/* Desktop floater corner picker */}
            {isFloaterSelected && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 8 }}>Corner position</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {FLOATER_CORNERS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setPlayerPosition(c.value)}
                      style={{
                        padding: "5px 12px",
                        background: playerPosition === c.value ? "var(--accent)" : "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: 5,
                        color: playerPosition === c.value ? "white" : "var(--fg)",
                        fontSize: 11,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {c.label}
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
