export function scrubIndex(offset: number, length: number, count: number): number {
  if (count <= 0 || length <= 0) return 0;
  const index = Math.floor((offset / length) * count);
  return Math.min(count - 1, Math.max(0, index));
}
