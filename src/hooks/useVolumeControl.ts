import { useState, useRef, useCallback, useEffect } from "react";

export function useVolumeControl() {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const activeRect = useRef<DOMRect | null>(null);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  const calcVolume = (clientX: number, rect: DOMRect) =>
    Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

  const handleVolumeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    activeRect.current = rect;
    setIsDragging(true);
    setVolume(calcVolume(e.clientX, rect));
    setIsMuted(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeRect.current) return;
    setVolume(calcVolume(e.clientX, activeRect.current));
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    activeRect.current = null;
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleVolumeWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setVolume((prev) => {
      const next = Math.max(0, Math.min(1, prev + delta));
      if (next > 0) setIsMuted(false);
      return next;
    });
  }, []);

  return { volume, isMuted, isDragging, toggleMute, handleVolumeMouseDown, handleVolumeWheel };
}
