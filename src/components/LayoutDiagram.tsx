import React from "react";
import { PlayerPosition } from "../types/settings";

type DiagramLayout = "bottom" | "top" | "left" | "right" | "floater";

interface LayoutDiagramProps {
  layout: DiagramLayout;
}

export const LayoutDiagram: React.FC<LayoutDiagramProps> = ({ layout }) => {
  const base: React.CSSProperties = {
    width: 72, height: 48,
    border: "1px solid var(--border)", borderRadius: 4,
    overflow: "hidden", position: "relative",
    display: "flex", flexShrink: 0,
  };
  const sidebar: React.CSSProperties = {
    width: 14, background: "var(--bg-elevated)",
    borderRight: "1px solid var(--border)", flexShrink: 0,
  };
  const content: React.CSSProperties = { flex: 1, background: "var(--bg)" };
  const bar: React.CSSProperties = { background: "var(--accent)", opacity: 0.6 };

  if (layout === "bottom") return (
    <div style={{ ...base, flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={sidebar} /><div style={content} />
      </div>
      <div style={{ ...bar, height: 8 }} />
    </div>
  );
  if (layout === "top") return (
    <div style={{ ...base, flexDirection: "column" }}>
      <div style={{ ...bar, height: 8 }} />
      <div style={{ display: "flex", flex: 1 }}>
        <div style={sidebar} /><div style={content} />
      </div>
    </div>
  );
  if (layout === "left") return (
    <div style={{ ...base }}>
      <div style={sidebar} />
      <div style={{ ...bar, width: 18 }} />
      <div style={content} />
    </div>
  );
  if (layout === "right") return (
    <div style={{ ...base }}>
      <div style={sidebar} /><div style={content} />
      <div style={{ ...bar, width: 18 }} />
    </div>
  );
  return (
    <div style={{ ...base }}>
      <div style={sidebar} />
      <div style={{ ...content, position: "relative" }}>
        <div style={{
          position: "absolute", bottom: 6, right: 6,
          width: 12, height: 12, borderRadius: "50%",
          background: "var(--accent)", opacity: 0.8,
        }} />
      </div>
    </div>
  );
};

export const LAYOUT_OPTIONS: { value: PlayerPosition; label: string; diagram: React.ReactNode }[] = [
  { value: "bottom", label: "Bottom Bar", diagram: <LayoutDiagram layout="bottom" /> },
  { value: "top", label: "Top Bar", diagram: <LayoutDiagram layout="top" /> },
  { value: "left", label: "Left Panel", diagram: <LayoutDiagram layout="left" /> },
  { value: "right", label: "Right Panel", diagram: <LayoutDiagram layout="right" /> },
];

export const FLOATER_CORNERS: { value: PlayerPosition; label: string }[] = [
  { value: "floater-tl", label: "Top Left" },
  { value: "floater-tr", label: "Top Right" },
  { value: "floater-bl", label: "Bottom Left" },
  { value: "floater-br", label: "Bottom Right" },
];
