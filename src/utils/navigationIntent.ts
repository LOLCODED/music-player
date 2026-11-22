export type NavigationIntent = "back" | "gesture";

let pending: NavigationIntent | null = null;

/** Marks the next history pop as started by the app (a back button or a committed swipe). */
export function markNavigationIntent(intent: NavigationIntent): void {
  pending = intent;
}

export function consumeNavigationIntent(): NavigationIntent | null {
  const intent = pending;
  pending = null;
  return intent;
}
