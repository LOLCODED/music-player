import React from "react";

export type RepeatMode = 'off' | 'all' | 'one';

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumName?: string;
  albumId?: string;
  albumArtUrl?: string;
}

export interface QueueEntry {
  id: string;
  title: string;
  artist?: string;
}

export interface PlayerVariantProps {
  currentSong: Song;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  displayProgress: number;
  volume: number;
  isMuted: boolean;
  isDragging: boolean;
  isVolumeDragging: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  queue?: QueueEntry[];
  currentQueueIndex?: number;
  sourcePath?: string | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onStop: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleMute: () => void;
  onProgressPointerDown: (e: React.PointerEvent) => void;
  onVolumePointerDown: (e: React.PointerEvent) => void;
  volumeWheelRef: (element: HTMLElement | null) => void;
  onPlayQueueSong?: (index: number) => void;
  formatTime: (seconds: number) => string;
  handleArtClick: () => void;
}
