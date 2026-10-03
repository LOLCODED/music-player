import { Skin } from "../types/settings";

export interface SkinOption {
  value: Skin;
  label: string;
  swatch: [background: string, surface: string, accent: string];
}

export const SKIN_OPTIONS: SkinOption[] = [
  { value: "default", label: "Default", swatch: ["#0a0a0a", "#1a1a1a", "#8b5cf6"] },
  { value: "itunes", label: "iTunes", swatch: ["#ffffff", "linear-gradient(#e6e6e6, #a8a8a8)", "#3d80df"] },
  { value: "y2k", label: "Y2K", swatch: ["#121212", "linear-gradient(#5c5f63, #1a1b1d)", "#7dff3c"] },
  { value: "futurism", label: "Futurism", swatch: ["#04060c", "#0a1424", "linear-gradient(90deg, #00e5ff, #ff2bd6)"] },
];
