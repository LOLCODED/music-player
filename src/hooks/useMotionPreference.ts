import { useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { useMediaQuery } from "./useMediaQuery";
import { resolveMotion } from "../utils/motionPreference";

export function useMotionPreference() {
  const { pageAnimations } = useSettings();
  const systemReduces = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    document.body.dataset.motion = resolveMotion(pageAnimations, systemReduces);
  }, [pageAnimations, systemReduces]);
}
