import { useKeyboardState } from "../hooks/useKeyboardState";

/** App-wide hooks that mirror device state (keyboard, status bar) onto the page. */
const DeviceEffects = () => {
  useKeyboardState();
  return null;
};

export default DeviceEffects;
