import React from "react";
import { LETTERS } from "../utils/letterGroups";

interface Props {
  available: Set<string>;
  onJump: (letter: string) => void;
}

/** A–Z strip that jumps the list to the first item for a letter. */
const LetterRail: React.FC<Props> = ({ available, onJump }) => (
  <nav className="letter-rail" aria-label="Jump to letter">
    {LETTERS.map((letter) => (
      <button
        key={letter}
        type="button"
        disabled={!available.has(letter)}
        onClick={() => onJump(letter)}
      >
        {letter}
      </button>
    ))}
  </nav>
);

export default LetterRail;
