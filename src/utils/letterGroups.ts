export const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

export function letterOf(title: string): string {
  const first = title.trim().normalize("NFD").charAt(0).toUpperCase();
  return first >= "A" && first <= "Z" ? first : "#";
}

/** Index of the first item for each starting letter, in list order. */
export function letterStarts<T>(items: T[], getTitle: (item: T) => string): Map<string, number> {
  const starts = new Map<string, number>();
  items.forEach((item, index) => {
    const letter = letterOf(getTitle(item));
    if (!starts.has(letter)) starts.set(letter, index);
  });
  return starts;
}

export function letterAnchorId(letter: string): string {
  return `letter-${letter === "#" ? "num" : letter}`;
}
