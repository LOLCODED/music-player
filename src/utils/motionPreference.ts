import type { PageAnimations } from "../types/settings";

/** Resolves the Page animations setting against the system's Reduce Motion. */
export function resolveMotion(setting: PageAnimations, systemReducesMotion: boolean): "on" | "off" {
  if (setting === "system") return systemReducesMotion ? "off" : "on";
  return setting;
}
