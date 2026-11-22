import { useKeyboardState } from "../hooks/useKeyboardState";
import { useMotionPreference } from "../hooks/useMotionPreference";
import { useStatusBarStyle } from "../hooks/useStatusBarStyle";

/** App-wide hooks that mirror device state (keyboard, motion, status bar) onto the page. */
const DeviceEffects = () => {
  useKeyboardState();
  useMotionPreference();
  useStatusBarStyle();
  return null;
};

export default DeviceEffects;
