export type PlayerPosition =
  | 'bottom'
  | 'top'
  | 'left'
  | 'right'
  | 'floater-tl'
  | 'floater-tr'
  | 'floater-bl'
  | 'floater-br';

export type MobilePlayerPosition = 'top' | 'bottom';

export const ACCENT_HOVER_MAP: Record<string, string> = {
  '#8b5cf6': '#a78bfa',
  '#3b82f6': '#60a5fa',
  '#06b6d4': '#22d3ee',
  '#22c55e': '#4ade80',
  '#eab308': '#facc15',
  '#f97316': '#fb923c',
  '#ef4444': '#f87171',
  '#ec4899': '#f472b6',
  '#6366f1': '#818cf8',
};
