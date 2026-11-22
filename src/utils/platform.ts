import { Capacitor } from "@capacitor/core";

export function isIOS(): boolean {
  if (Capacitor.getPlatform() === "ios") return true;
  const { userAgent, maxTouchPoints } = navigator;
  return /iPad|iPhone|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}
