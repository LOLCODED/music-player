import React from "react";
import { LETTERS, letterAnchorId } from "../utils/letterGroups";

interface Props {
  available: Set<string>;
}

/** A–Z strip that jumps the list to the first item for a letter. */
const LetterRail: React.FC<Props> = ({ available }) => (
  <nav className="letter-rail" aria-label="Jump to letter">
    {LETTERS.map((letter) => (
      <button
        key={letter}
        type="button"
        disabled={!available.has(letter)}
        onClick={() =>
          document.getElementById(letterAnchorId(letter))?.scrollIntoView({ block: "start" })
        }
      >
        {letter}
      </button>
    ))}
  </nav>
);

export default LetterRail;
