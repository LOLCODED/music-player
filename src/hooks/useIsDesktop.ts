import { useState, useEffect } from "react";
import { DESKTOP_BREAKPOINT_PX } from "../utils/constants";

export function useIsDesktop(breakpoint: number = DESKTOP_BREAKPOINT_PX): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(`(min-width: ${breakpoint}px)`).matches
  );

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    setIsDesktop(query.matches);
    return () => query.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isDesktop;
}
