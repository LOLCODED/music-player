export function trackNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}
