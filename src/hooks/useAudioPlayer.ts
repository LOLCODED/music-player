import { useRef, useState, useEffect, useCallback } from "react";
import { Song, RepeatMode } from "../types/player";
import { useVolumeControl } from "./useVolumeControl";
import { useProgressDrag } from "./useProgressDrag";

interface UseAudioPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  repeatMode: RepeatMode;
  onSeek: (progress: number) => void;
  onNext: () => void;
  onRequestStreamUrl: (songId: string) => string;
}

export function useAudioPlayer({
  currentSong,
  isPlaying,
  repeatMode,
  onSeek,
  onNext,
  onRequestStreamUrl,
}: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { volume, isMuted, isDragging: isVolumeDragging, toggleMute, handleVolumeMouseDown, handleVolumeWheel } =
    useVolumeControl();

  const formatTime = useCallback((seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleSeek = useCallback(
    (newProgress: number) => {
      if (!audioRef.current || !duration || !currentSong) return;
      const targetTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      onSeek(newProgress);
    },
    [duration, currentSong, onSeek]
  );

  const { isDragging, dragProgress, handleProgressMouseDown } = useProgressDrag(
    duration,
    handleSeek
  );

  // Load new song
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    const audio = audioRef.current;
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    audio.src = onRequestStreamUrl(currentSong.id);
    audio.load();

    const handleLoadedData = () => {
      setIsLoading(false);
      if (isPlayingRef.current) {
        audio.play().catch((err) => {
          console.error("Error auto-playing after load:", err);
          setIsLoading(false);
        });
      }
      audio.removeEventListener("loadeddata", handleLoadedData);
    };
    audio.addEventListener("loadeddata", handleLoadedData);
    return () => { audio.removeEventListener("loadeddata", handleLoadedData); };
  }, [currentSong, onRequestStreamUrl]);

  // Play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

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
      setCurrentTime(audio.currentTime);
      const total = isFinite(audio.duration) ? audio.duration : 0;
      if (total > 0) {
        const pct = (audio.currentTime / total) * 100;
        if (Math.abs(pct - (audio.currentTime / total) * 100) > 0.5) {
          onSeek(pct);
        }
      }
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onNext);
    audio.addEventListener("error", () => setIsLoading(false));
    audio.addEventListener("canplay", () => setIsLoading(false));
    audio.addEventListener("waiting", () => setIsLoading(true));
    audio.addEventListener("playing", () => setIsLoading(false));

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onNext);
      audio.removeEventListener("error", () => setIsLoading(false));
      audio.removeEventListener("canplay", () => setIsLoading(false));
      audio.removeEventListener("waiting", () => setIsLoading(true));
      audio.removeEventListener("playing", () => setIsLoading(false));
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
    handleProgressMouseDown,
    handleVolumeMouseDown,
    handleVolumeWheel,
    formatTime,
  };
}
