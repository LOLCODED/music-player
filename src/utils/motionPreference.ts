import type { PageAnimations } from "../types/settings";

export function resolveMotion(setting: PageAnimations, systemReducesMotion: boolean): "on" | "off" {
  if (setting === "system") return systemReducesMotion ? "off" : "on";
  return setting;
}
