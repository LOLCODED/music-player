import { PlayerPosition } from "../types/settings";
import { DiagramLayout } from "./LayoutDiagram";

export interface LayoutOption {
  value: PlayerPosition;
  label: string;
  layout: DiagramLayout;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  { value: "bottom", label: "Bottom Bar", layout: "bottom" },
  { value: "top", label: "Top Bar", layout: "top" },
  { value: "left", label: "Left Panel", layout: "left" },
  { value: "right", label: "Right Panel", layout: "right" },
];

export const FLOATER_CORNERS: { value: PlayerPosition; label: string }[] = [
  { value: "floater-tl", label: "Top Left" },
  { value: "floater-tr", label: "Top Right" },
  { value: "floater-bl", label: "Bottom Left" },
  { value: "floater-br", label: "Bottom Right" },
];
