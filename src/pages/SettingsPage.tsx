import React from "react";
import { useSettings } from "../contexts/SettingsContext";
import { PageAnimations, PlayerPosition } from "../types/settings";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { LayoutDiagram } from "../components/LayoutDiagram";
import { LAYOUT_OPTIONS, FLOATER_CORNERS } from "../components/layoutOptions";
import SkinPicker from "../components/SkinPicker";
import PageTitle from "../components/PageTitle";

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

const MOBILE_POSITIONS = [
  { value: "bottom", label: "Above tabs" },
  { value: "top", label: "Top" },
] as const;

const ANIMATION_OPTIONS: { value: PageAnimations; label: string }[] = [
  { value: "system", label: "System" },
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

interface PillGroupProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}

function PillGroup<T extends string>({ label, options, selected, onSelect }: PillGroupProps<T>) {
  return (
    <div className="settings-pill-group" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`settings-pill${selected === option.value ? " is-selected" : ""}`}
          aria-pressed={selected === option.value}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const AppearanceSection: React.FC = () => {
  const { isDarkMode, toggleTheme, accentColor, setAccentColor } = useSettings();
  return (
    <>
      <div className="settings-section-label">Appearance</div>
      <div className="settings-row">
        <span>Theme</span>
        <button className="settings-pill" style={{ minWidth: 100 }} onClick={toggleTheme}>
          {isDarkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
      <div className="settings-section-label">Accent Color</div>
      <div className="accent-swatches">
        {ACCENT_COLORS.map((c) => (
          <button
            key={c.value}
            className={`accent-swatch${accentColor === c.value ? " is-selected" : ""}`}
            title={c.label}
            aria-label={c.label}
            aria-pressed={accentColor === c.value}
            onClick={() => setAccentColor(c.value)}
            style={{ color: c.value }}
          >
            <span />
          </button>
        ))}
      </div>
    </>
  );
};

const MotionSection: React.FC = () => {
  const { pageAnimations, setPageAnimations } = useSettings();
  return (
    <>
      <div className="settings-section-label">Motion</div>
      <div className="settings-row">
        <span>Page animations</span>
        <PillGroup label="Page animations" options={ANIMATION_OPTIONS} selected={pageAnimations} onSelect={setPageAnimations} />
      </div>
      <p className="settings-hint">
        System follows Reduce Motion in your device settings. Off keeps swipe-back working, but pages change instantly.
      </p>
    </>
  );
};

const DesktopLayoutSection: React.FC = () => {
  const { playerPosition, setPlayerPosition } = useSettings();
  const isFloaterSelected = playerPosition.startsWith("floater");
  const selectedFloaterCorner = isFloaterSelected ? playerPosition : "floater-br";

  return (
    <>
      <div className="settings-section-label">Desktop Player Layout</div>
      <p style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 12 }}>
        Choose where the player appears on desktop.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        {LAYOUT_OPTIONS.map((opt) => (
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
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 8 }}>Corner position</div>
          <PillGroup label="Corner position" options={FLOATER_CORNERS} selected={playerPosition} onSelect={setPlayerPosition} />
        </div>
      )}
    </>
  );
};

const SettingsPage: React.FC = () => {
  const { mobilePlayerPosition, setMobilePlayerPosition, skin } = useSettings();
  const isDesktop = useIsDesktop();

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-header-title desktop-only">Settings</span>
        <PageTitle title="Settings" phoneOnly />
      </div>

      <div className="settings-body">
        <div className="settings-section-label">Skin</div>
        <SkinPicker />
        {skin === "default" ? (
          <AppearanceSection />
        ) : (
          <p className="settings-hint">This skin uses its own colors. Switch back to Default to change theme or accent.</p>
        )}
        <MotionSection />
        {isDesktop ? (
          <DesktopLayoutSection />
        ) : (
          <>
            <div className="settings-section-label">Mini Player</div>
            <PillGroup label="Mini player position" options={MOBILE_POSITIONS} selected={mobilePlayerPosition} onSelect={setMobilePlayerPosition} />
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
