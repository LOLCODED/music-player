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

export type SwipeDirection = -1 | 1;

const COMMIT_PROGRESS = 0.35;
const COMMIT_VELOCITY_PX_PER_MS = 0.5;
export const UNDER_PARALLAX = 0.3;
export const MAX_DIM = 0.28;

export function edgeAt(x: number, viewportWidth: number): -1 | 0 | 1 {
  if (x <= EDGE_WIDTH_PX) return -1;
  if (x >= viewportWidth - EDGE_WIDTH_PX) return 1;
  return 0;
}

export function swipeProgress(dx: number, width: number, direction: SwipeDirection): number {
  if (width <= 0) return 0;
  return Math.min(1, Math.max(0, (-direction * dx) / width));
}

export function shouldCommitSwipe(progress: number, velocityPxPerMs: number, direction: SwipeDirection): boolean {
  const towardCommit = -direction * velocityPxPerMs;
  if (towardCommit < -COMMIT_VELOCITY_PX_PER_MS) return false;
  return progress > COMMIT_PROGRESS || (progress > 0.05 && towardCommit > COMMIT_VELOCITY_PX_PER_MS);
}

export interface SwipeOffsets {
  top: number;
  under: number;
  dim: number;
}

/**
 * Translations for the two layers. Going back, the current page (top) follows the finger
 * off to the right over the previous page; going forward, the next page (top) slides in
 * from the right over the current one.
 */
export function swipeOffsets(progress: number, width: number, direction: SwipeDirection): SwipeOffsets {
  if (direction === -1) {
    return { top: progress * width, under: -UNDER_PARALLAX * width * (1 - progress), dim: MAX_DIM * (1 - progress) };
  }
  return { top: width * (1 - progress), under: -UNDER_PARALLAX * width * progress, dim: MAX_DIM * progress };
}
