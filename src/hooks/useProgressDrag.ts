import { useState, useRef, useCallback, useEffect } from "react";

// Starts a pointer drag on the element that received the pointerdown. Pointer
// capture keeps move/up events flowing to the element (no document listeners),
// which also makes dragging work for touch input. Listeners are attached once
// per drag, so there is no per-move listener churn.
export function trackPointerDrag(
  e: React.PointerEvent,
  onMove: (clientX: number, bar: HTMLElement) => void,
  onEnd: (clientX: number | null, bar: HTMLElement) => void
): void {
  const bar = e.currentTarget as HTMLElement;
  const pointerId = e.pointerId;
  bar.setPointerCapture(pointerId);

  const handleMove = (event: PointerEvent) => {
    if (event.pointerId === pointerId) onMove(event.clientX, bar);
  };
  const cleanup = () => {
    bar.removeEventListener("pointermove", handleMove);
    bar.removeEventListener("pointerup", handleUp);
    bar.removeEventListener("pointercancel", handleCancel);
    if (bar.hasPointerCapture(pointerId)) bar.releasePointerCapture(pointerId);
  };
  const handleUp = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    cleanup();
    onEnd(event.clientX, bar);
  };
  const handleCancel = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    cleanup();
    onEnd(null, bar);
  };

  bar.addEventListener("pointermove", handleMove);
  bar.addEventListener("pointerup", handleUp);
  bar.addEventListener("pointercancel", handleCancel);
  onMove(e.clientX, bar);
}

// Rect is read per move (not cached at drag start) so it stays correct after
// scroll or resize mid-drag.
function progressFromPointer(clientX: number, bar: HTMLElement): number {
  const rect = bar.getBoundingClientRect();
  return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
}

export function useProgressDrag(
  duration: number,
  onSeekCommit: (progress: number) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const durationRef = useRef(duration);
  const onSeekCommitRef = useRef(onSeekCommit);
  useEffect(() => {
    durationRef.current = duration;
    onSeekCommitRef.current = onSeekCommit;
  });

  // Name kept for the useAudioPlayer pass-through; it is a pointerdown handler.
  const handleProgressPointerDown = useCallback((e: React.PointerEvent) => {
    if (!durationRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    trackPointerDrag(
      e,
      (clientX, bar) => setDragProgress(progressFromPointer(clientX, bar)),
      (clientX, bar) => {
        setIsDragging(false);
        if (clientX === null) return;
        onSeekCommitRef.current(progressFromPointer(clientX, bar));
      }
    );
  }, []);

  return { isDragging, dragProgress, handleProgressPointerDown };
}
