export interface Point {
  x: number;
  y: number;
}

export const EDGE_WIDTH_PX = 24;
export const MIN_SWIPE_PX = 70;

/** -1 for a swipe in from the left edge (back), 1 from the right edge (forward), 0 otherwise. */
export function edgeSwipeDirection(start: Point, end: Point, viewportWidth: number): -1 | 0 | 1 {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < MIN_SWIPE_PX || Math.abs(dy) > Math.abs(dx) / 2) return 0;
  if (dx > 0 && start.x <= EDGE_WIDTH_PX) return -1;
  if (dx < 0 && start.x >= viewportWidth - EDGE_WIDTH_PX) return 1;
  return 0;
}
