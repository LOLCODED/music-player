/** Whether page and sheet animations should run; `useMotionPreference` keeps the attribute current. */
export function motionAllowed(): boolean {
  if (document.body.dataset.motion) return document.body.dataset.motion !== "off";
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
