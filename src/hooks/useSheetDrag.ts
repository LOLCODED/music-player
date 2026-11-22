import { RefObject, useEffect } from "react";

const DISMISS_DISTANCE_PX = 120;
const DISMISS_VELOCITY_PX_PER_MS = 0.6;
const IGNORED_TARGETS = ".progress-bar, .volume-bar, input";

/**
 * Drag a bottom sheet down to dismiss it. The drag starts only when `scroller` is
 * scrolled to the top, so scrolling the sheet's content still works.
 */
export function useSheetDrag(
  sheet: RefObject<HTMLElement | null>,
  scroller: RefObject<HTMLElement | null>,
  onDismiss: () => void
) {
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    let start: { y: number; t: number } | null = null;
    let dy = 0;

    const onStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const ignored = e.target instanceof Element && e.target.closest(IGNORED_TARGETS);
      const atTop = (scroller.current?.scrollTop ?? 0) <= 0;
      start = touch && e.touches.length === 1 && !ignored && atTop ? { y: touch.clientY, t: e.timeStamp } : null;
      dy = 0;
    };
    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!start || !touch) return;
      dy = touch.clientY - start.y;
      if (dy <= 0) {
        el.style.transform = "";
        return;
      }
      e.preventDefault();
      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const velocity = dy / Math.max(1, e.timeStamp - start.t);
      start = null;
      el.style.transition = "";
      if (dy > DISMISS_DISTANCE_PX || (dy > 24 && velocity > DISMISS_VELOCITY_PX_PER_MS)) {
        onDismiss();
      } else {
        el.style.transform = "";
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [sheet, scroller, onDismiss]);
}
