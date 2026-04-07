import { useState, useRef, useCallback, useEffect } from "react";

export function useProgressDrag(
  duration: number,
  onSeekCommit: (progress: number) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const activeProgressRect = useRef<DOMRect | null>(null);

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!duration) return;
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      activeProgressRect.current = rect;
      const percent = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      setDragProgress(percent);
    },
    [duration]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !activeProgressRect.current) return;
      const rect = activeProgressRect.current;
      const percent = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      setDragProgress(percent);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    onSeekCommit(dragProgress);
  }, [isDragging, dragProgress, onSeekCommit]);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { isDragging, dragProgress, handleProgressMouseDown };
}
