import React, { useLayoutEffect, useRef, useState } from "react";
import { LETTERS } from "../utils/letterGroups";
import { scrubIndex } from "../utils/scrubIndex";
import { hapticSelection } from "../utils/haptics";

interface Props {
  available: Set<string>;
  onJump: (letter: string) => void;
}

// Below this height per letter the rail shows every other letter (it still scrubs all of them).
const MIN_LETTER_PX = 14;
const TOUCH_QUERY = "(pointer: coarse)";

function useRailBounds(rail: React.RefObject<HTMLElement | null>) {
  const [compact, setCompact] = useState(false);

  useLayoutEffect(() => {
    const el = rail.current;
    const scroller = el?.parentElement?.querySelector<HTMLElement>(":scope > .page-scroll");
    if (!el || !scroller || !window.matchMedia(TOUCH_QUERY).matches) return;
    const update = () => {
      el.style.top = `${scroller.offsetTop}px`;
      el.style.height = `${scroller.clientHeight}px`;
      setCompact(scroller.clientHeight / LETTERS.length < MIN_LETTER_PX);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [rail]);

  return compact;
}

const LetterRail: React.FC<Props> = ({ available, onJump }) => {
  const railRef = useRef<HTMLElement>(null);
  const lastLetter = useRef<string | null>(null);
  const [scrubbing, setScrubbing] = useState<string | null>(null);
  const compact = useRailBounds(railRef);

  const jumpAt = (clientY: number) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    const letter = LETTERS[scrubIndex(clientY - rect.top, rect.height, LETTERS.length)];
    setScrubbing(letter);
    if (letter === lastLetter.current) return;
    lastLetter.current = letter;
    if (!available.has(letter)) return;
    hapticSelection();
    onJump(letter);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastLetter.current = null;
    jumpAt(e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (scrubbing !== null) jumpAt(e.clientY);
  };
  const endScrub = () => setScrubbing(null);

  return (
    <nav
      ref={railRef}
      className={`letter-rail${compact ? " compact" : ""}${scrubbing ? " scrubbing" : ""}`}
      aria-label="Jump to letter"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endScrub}
      onPointerCancel={endScrub}
    >
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
      {scrubbing && (
        <span className="letter-rail-bubble" aria-hidden="true">
          {scrubbing}
        </span>
      )}
    </nav>
  );
};

export default LetterRail;
