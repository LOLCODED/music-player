import { Capacitor } from "@capacitor/core";

/** iPhone, iPad (including iPadOS's desktop user agent) or the iOS app. */
export function isIOS(): boolean {
  if (Capacitor.getPlatform() === "ios") return true;
  const { userAgent, maxTouchPoints } = navigator;
  return /iPad|iPhone|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}
