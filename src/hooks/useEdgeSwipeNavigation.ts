import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { edgeSwipeDirection, Point } from "../utils/edgeSwipe";

const IGNORED_TARGETS = ".player-area, .player-fullscreen, input, textarea";

/** Safari-style history swipes from the screen edges. */
export function useEdgeSwipeNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    let start: Point | null = null;

    const onStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const ignored = e.target instanceof Element && e.target.closest(IGNORED_TARGETS);
      start = touch && e.touches.length === 1 && !ignored ? { x: touch.clientX, y: touch.clientY } : null;
    };
    const onEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!start || !touch) return;
      const direction = edgeSwipeDirection(start, { x: touch.clientX, y: touch.clientY }, window.innerWidth);
      start = null;
      if (direction) navigate(direction);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [navigate]);
}
