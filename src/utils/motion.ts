/** Whether page and sheet animations should run (see `useMotionPreference`). */
export function motionAllowed(): boolean {
  if (document.body.dataset.motion) return document.body.dataset.motion !== "off";
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
