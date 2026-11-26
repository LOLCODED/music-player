export const PLAYER_POSITIONS = [
  'bottom',
  'top',
  'left',
  'right',
  'floater-tl',
  'floater-tr',
  'floater-bl',
  'floater-br',
] as const;

export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];

export const MOBILE_PLAYER_POSITIONS = ['top', 'bottom'] as const;

export type MobilePlayerPosition = (typeof MOBILE_PLAYER_POSITIONS)[number];

export const PAGE_ANIMATIONS = ['system', 'on', 'off'] as const;

export type PageAnimations = (typeof PAGE_ANIMATIONS)[number];

export const SKINS = ['default', 'itunes', 'y2k', 'futurism'] as const;

export type Skin = (typeof SKINS)[number];

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

export const STREAM_QUALITIES = ['original', '320', '192', '128'] as const;

export type StreamQuality = (typeof STREAM_QUALITIES)[number];

// Kbps cap sent to the server; undefined streams the original file.
export function streamQualityBitRate(quality: StreamQuality): number | undefined {
  return quality === 'original' ? undefined : Number(quality);
}
