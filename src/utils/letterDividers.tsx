import React from "react";
import { letterAnchorId, letterOf } from "./letterGroups";

/** Puts a letter heading before the first item of each letter, when headings apply. */
export function withLetterHeadings<T>(
  items: T[],
  starts: Map<string, number> | null,
  sortKey: (item: T) => string,
  renderItem: (item: T, index: number) => React.ReactNode,
  renderHeading: (letter: string, isAnchor: boolean, index: number) => React.ReactNode
): React.ReactNode[] {
  let previous: string | null = null;
  return items.flatMap((item, index) => {
    const node = renderItem(item, index);
    if (!starts) return [node];
    const letter = letterOf(sortKey(item));
    const changed = letter !== previous;
    previous = letter;
    if (!changed) return [node];
    return [renderHeading(letter, starts.get(letter) === index, index), node];
  });
}

export function tableHeading(columns: number, letter: string, isAnchor: boolean, index: number) {
  return (
    <tr key={`letter-${letter}-${index}`} id={isAnchor ? letterAnchorId(letter) : undefined} className="letter-divider">
      <td colSpan={columns}>{letter}</td>
    </tr>
  );
}

export function gridHeading(letter: string, isAnchor: boolean, index: number) {
  return (
    <div key={`letter-${letter}-${index}`} id={isAnchor ? letterAnchorId(letter) : undefined} className="letter-divider letter-divider-grid">
      {letter}
    </div>
  );
}
