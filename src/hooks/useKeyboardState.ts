import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { isTextEntry } from "../utils/textEntry";

const COARSE_POINTER = "(pointer: coarse)";

function setKeyboardOpen(open: boolean) {
  if (open) document.body.dataset.keyboard = "open";
  else delete document.body.dataset.keyboard;
}

export function useKeyboardState() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const handles = [
        Keyboard.addListener("keyboardWillShow", () => setKeyboardOpen(true)),
        Keyboard.addListener("keyboardWillHide", () => setKeyboardOpen(false)),
      ];
      return () => {
        handles.forEach((handle) => handle.then((h) => h.remove()));
        setKeyboardOpen(false);
      };
    }

    if (!window.matchMedia(COARSE_POINTER).matches) return;
    const onFocusIn = (e: FocusEvent) => setKeyboardOpen(isTextEntry(e.target as Element));
    // Focus moving between two fields fires focusout first; wait for the next focus to land.
    const onFocusOut = () => requestAnimationFrame(() => setKeyboardOpen(isTextEntry(document.activeElement)));
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      setKeyboardOpen(false);
    };
  }, []);
}
