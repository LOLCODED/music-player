import { DESKTOP_BREAKPOINT_PX, desktopMediaQuery } from "../utils/constants";
import { useMediaQuery } from "./useMediaQuery";

export function useIsDesktop(breakpoint: number = DESKTOP_BREAKPOINT_PX): boolean {
  return useMediaQuery(desktopMediaQuery(breakpoint));
}
