import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useSettings } from "../contexts/SettingsContext";
import type { Skin } from "../types/settings";

/** Only iTunes and the default skin's light theme put the status bar over a light background. */
export function statusBarStyle(skin: Skin, isDarkMode: boolean): Style {
  const lightBackground = skin === "itunes" || (skin === "default" && !isDarkMode);
  return lightBackground ? Style.Light : Style.Dark;
}

export function useStatusBarStyle() {
  const { skin, isDarkMode } = useSettings();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void StatusBar.setStyle({ style: statusBarStyle(skin, isDarkMode) }).catch(() => {});
  }, [skin, isDarkMode]);
}
