import { useKeyboardState } from "../hooks/useKeyboardState";
import { useMotionPreference } from "../hooks/useMotionPreference";

/** App-wide hooks that mirror device state (keyboard, motion, status bar) onto the page. */
const DeviceEffects = () => {
  useKeyboardState();
  useMotionPreference();
  return null;
};

export default DeviceEffects;
