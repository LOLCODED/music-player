import { useState, useRef, useCallback, useEffect } from "react";
import { trackPointerDrag } from "./useProgressDrag";

const WHEEL_VOLUME_STEP = 0.05;
const VOLUME_STORAGE_KEY = "playerVolume";
const MUTED_STORAGE_KEY = "playerMuted";

const clampVolume = (value: number) => Math.max(0, Math.min(1, value));

function readStoredVolume(): number {
  try {
    const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (stored === null) return 1;
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? clampVolume(parsed) : 1;
  } catch {
    return 1;
  }
}

function readStoredMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function persistSetting(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, quota) — volume just won't persist.
  }
}

function volumeFromPointer(clientX: number, bar: HTMLElement): number {
  const rect = bar.getBoundingClientRect();
  return clampVolume((clientX - rect.left) / rect.width);
}

export function useVolumeControl() {
  const [volume, setVolume] = useState(readStoredVolume);
  const [isMuted, setIsMuted] = useState(readStoredMuted);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    persistSetting(VOLUME_STORAGE_KEY, String(volume));
  }, [volume]);
  useEffect(() => {
    persistSetting(MUTED_STORAGE_KEY, String(isMuted));
  }, [isMuted]);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  // Name kept for the useAudioPlayer pass-through; it is a pointerdown handler.
  const handleVolumePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setIsMuted(false);
    trackPointerDrag(
      e,
      (clientX, bar) => setVolume(volumeFromPointer(clientX, bar)),
      () => setIsDragging(false)
    );
  }, []);

  const applyWheelDelta = useCallback((deltaY: number) => {
    const delta = deltaY < 0 ? WHEEL_VOLUME_STEP : -WHEEL_VOLUME_STEP;
    setVolume((prev) => {
      const next = clampVolume(prev + delta);
      if (next > 0) setIsMuted(false);
      return next;
    });
  }, []);

  const wheelCleanupRef = useRef<(() => void) | null>(null);

  // Ref callback for the volume bar element. React registers onWheel passively
  // at the root, so preventDefault there is a no-op; a non-passive listener
  // attached directly to the element is required to stop page scroll.
  const handleVolumeWheel = useCallback(
    (element: HTMLElement | null) => {
      wheelCleanupRef.current?.();
      wheelCleanupRef.current = null;
      if (!element) return;
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        applyWheelDelta(e.deltaY);
      };
      element.addEventListener("wheel", onWheel, { passive: false });
      wheelCleanupRef.current = () => element.removeEventListener("wheel", onWheel);
    },
    [applyWheelDelta]
  );

  return { volume, isMuted, isDragging, toggleMute, handleVolumePointerDown, handleVolumeWheel };
}
