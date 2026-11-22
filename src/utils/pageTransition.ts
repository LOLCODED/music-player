export type NavigationKind = "PUSH" | "POP" | "REPLACE";
export type PageTransition = "push" | "pop" | "none";

interface ClassifyOptions {
  animate: boolean;
  tabSwitch: boolean;
  appBack: boolean;
}

/**
 * Which slide a navigation gets. Only navigation the app starts animates: pushes (taps
 * on links) and back-taps the app marked. A bare POP (browser back, Safari's own swipe)
 * stays instant so it doesn't animate twice; tab switches are instant like iOS tab bars.
 */
export function classifyNavigation(type: NavigationKind, { animate, tabSwitch, appBack }: ClassifyOptions): PageTransition {
  if (!animate) return "none";
  if (type === "PUSH") return tabSwitch ? "none" : "push";
  if (type === "POP") return appBack ? "pop" : "none";
  return "none";
}

export function isTabNavigationState(state: unknown): boolean {
  return typeof state === "object" && state !== null && (state as { tab?: unknown }).tab === true;
}
