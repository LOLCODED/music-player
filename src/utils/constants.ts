export const COVER_ART_SIZE = 300;
export const SEARCH_DEBOUNCE_MS = 300;
export const DESKTOP_BREAKPOINT_PX = 768;
// A landscape phone is wide enough for the desktop layout but too short for it.
export const DESKTOP_MIN_HEIGHT_PX = 500;

export function desktopMediaQuery(breakpoint: number = DESKTOP_BREAKPOINT_PX): string {
  return `(min-width: ${breakpoint}px) and (min-height: ${DESKTOP_MIN_HEIGHT_PX}px)`;
}
export const TOAST_DURATION_MS = 3000;

export const GRID_PAGE_SIZE = 15;
export const SONGS_PAGE_SIZE = 50;
export const BULK_FETCH_SIZE = 500;
export const ALBUM_SEARCH_LIMIT = 50;
export const SONG_SEARCH_LIMIT = 100;
