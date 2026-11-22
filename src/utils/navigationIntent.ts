export type NavigationIntent = "back" | "gesture";

let pending: NavigationIntent | null = null;

export function markNavigationIntent(intent: NavigationIntent): void {
  pending = intent;
}

export function consumeNavigationIntent(): NavigationIntent | null {
  const intent = pending;
  pending = null;
  return intent;
}
