import { useRef, useState, useEffect, useCallback } from "react";
import { Song, RepeatMode } from "../types/player";
import { formatTrackDuration } from "../utils/duration";
import { useVolumeControl } from "./useVolumeControl";
import { useProgressDrag } from "./useProgressDrag";

// Report progress to the context only when it moves by at least this many
// percentage points, so timeupdate (which fires several times a second)
// doesn't re-render every context consumer.
const PROGRESS_REPORT_STEP = 1;

interface UseAudioPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  repeatMode: RepeatMode;
  onSeek: (progress: number) => void;
  onNext: () => void;
  onRequestStreamUrl: (songId: string) => string;
  // Called when the browser refuses to start playback (e.g. autoplay policy)
  // so the owner can flip its "playing" state back to paused.
  onPlaybackBlocked?: () => void;
}

export function useAudioPlayer({
  currentSong,
  isPlaying,
  repeatMode,
  onSeek,
  onNext,
  onRequestStreamUrl,
  onPlaybackBlocked,
}: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  const onPlaybackBlockedRef = useRef(onPlaybackBlocked);
  useEffect(() => {
    onPlaybackBlockedRef.current = onPlaybackBlocked;
  }, [onPlaybackBlocked]);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastReportedProgressRef = useRef(0);

  const {
    volume,
    isMuted,
    isDragging: isVolumeDragging,
    toggleMute,
    handleVolumePointerDown,
    handleVolumeWheel,
  } = useVolumeControl();

  const handlePlayFailure = useCallback((err: unknown) => {
    // AbortError just means a new load() interrupted play() — not a failure.
    if (err instanceof DOMException && err.name === "AbortError") return;
    console.error("Audio playback failed:", err);
    setIsLoading(false);
    onPlaybackBlockedRef.current?.();
  }, []);

  const handleSeek = useCallback(
    (newProgress: number) => {
      if (!audioRef.current || !duration || !currentSong) return;
      const targetTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      lastReportedProgressRef.current = newProgress;
      onSeek(newProgress);
    },
    [duration, currentSong, onSeek]
  );

  const { isDragging, dragProgress, handleProgressPointerDown } = useProgressDrag(
    duration,
    handleSeek
  );

  // Load new song
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    const audio = audioRef.current;
    const streamUrl = onRequestStreamUrl(currentSong.id);
    if (!streamUrl) return;

    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    lastReportedProgressRef.current = 0;
    audio.src = streamUrl;
    audio.load();

    const handleLoadedData = () => {
      setIsLoading(false);
      if (isPlayingRef.current) {
        audio.play().catch(handlePlayFailure);
      }
    };
    audio.addEventListener("loadeddata", handleLoadedData);
    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [currentSong, onRequestStreamUrl, handlePlayFailure]);

  // Play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(handlePlayFailure);
    } else {
      audio.pause();
    }
  }, [isPlaying, handlePlayFailure]);

  // Stop streaming when the player unmounts (a detached <audio> element can
  // otherwise keep downloading/playing).
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
    };
  }, []);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(isFinite(audio.duration) ? audio.duration : 0);
      setIsLoading(false);
    };
    const onTimeUpdate = () => {
      if (isDragging) return;
      // Commit state at ~1Hz (when the displayed second changes), not on
      // every timeupdate tick.
      setCurrentTime((prev) =>
        Math.floor(prev) === Math.floor(audio.currentTime) ? prev : audio.currentTime
      );
      const total = isFinite(audio.duration) ? audio.duration : 0;
      if (total > 0) {
        const pct = (audio.currentTime / total) * 100;
        if (Math.abs(pct - lastReportedProgressRef.current) >= PROGRESS_REPORT_STEP) {
          lastReportedProgressRef.current = pct;
          onSeek(pct);
        }
      }
    };
    const onError = () => setIsLoading(false);
    const onCanPlay = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onNext);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onNext);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
    };
  }, [isDragging, onSeek, onNext]);

  // Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Repeat one — native loop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = repeatMode === "one";
    }
  }, [repeatMode]);

  const displayProgress = isDragging
    ? dragProgress
    : duration > 0
      ? (currentTime / duration) * 100
      : 0;

  return {
    audioRef,
    duration,
    currentTime,
    isLoading,
    volume,
    isMuted,
    isDragging,
    isVolumeDragging,
    dragProgress,
    displayProgress,
    toggleMute,
    handleProgressPointerDown,
    handleVolumePointerDown,
    handleVolumeWheel,
    formatTime: formatTrackDuration,
  };
}
