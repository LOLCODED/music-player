import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import type { Skin } from "../types/settings";

/**
 * The login sleeve follows the theme in every skin; inside the app only iTunes and the
 * default skin's light theme put the status bar over a light background.
 */
export function statusBarStyle(skin: Skin, isDarkMode: boolean, onLoginSleeve = false): Style {
  const lightBackground = onLoginSleeve
    ? !isDarkMode
    : skin === "itunes" || (skin === "default" && !isDarkMode);
  return lightBackground ? Style.Light : Style.Dark;
}

export function useStatusBarStyle() {
  const { skin, isDarkMode } = useSettings();
  const { isAuthenticated, loading } = useAuth();
  const onLoginSleeve = !isAuthenticated && !loading;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void StatusBar.setStyle({ style: statusBarStyle(skin, isDarkMode, onLoginSleeve) }).catch(() => {});
  }, [skin, isDarkMode, onLoginSleeve]);
}
