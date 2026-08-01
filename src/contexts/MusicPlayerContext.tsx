import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { SubsonicSong, SubsonicAlbum } from "../services/SubsonicService";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";
import { COVER_ART_SIZE } from "../utils/constants";
import { shuffleArray } from "../utils/shuffle";
import { useAuth } from "./AuthContext";
import { Song, RepeatMode } from "../types/player";
import { recordSongPlay, recordPlaylistPlay } from "../utils/recentlyPlayed";

export type { RepeatMode } from "../types/player";
// Backwards-compat alias
export type PlayableSong = Song;

interface MusicPlayerContextType {
  // Current state
  currentSong: Song | null;
  currentAlbum: SubsonicAlbum | null;
  currentPlaylist: SubsonicSong[];
  currentSourcePath: string | null;
  isPlaying: boolean;
  progress: number;
  shuffle: boolean;
  repeatMode: RepeatMode;

  // Actions
  playSong: (
    song: SubsonicSong,
    album?: SubsonicAlbum,
    playlist?: SubsonicSong[]
  ) => void;
  playAlbum: (
    album: SubsonicAlbum,
    songs: SubsonicSong[],
    startIndex?: number,
    playlistId?: string
  ) => void;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  setProgress: (progress: number) => void;
  getStreamUrl: (songId: string, timeOffset?: number) => string;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  stop: () => void;

  // Utility
  isCurrentSong: (songId: string) => boolean;
  getCurrentSongIndex: () => number;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};

interface MusicPlayerProviderProps {
  children: React.ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({
  children,
}) => {
  const { subsonicService } = useAuth();

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<SubsonicAlbum | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<SubsonicSong[]>([]);
  const [currentSourcePath, setCurrentSourcePath] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  // Playback order used while shuffle is on: a permutation of playlist
  // indexes, regenerated whenever the playlist changes or shuffle toggles on.
  const shuffleOrderRef = useRef<number[]>([]);

  const getCoverArtUrl = useCallback(
    (coverArtId?: string) => {
      if (!coverArtId || !subsonicService) return DEFAULT_ALBUM_ART;
      return subsonicService.getCoverArtUrl(coverArtId, COVER_ART_SIZE);
    },
    [subsonicService]
  );

  const getStreamUrl = useCallback(
    (songId: string, timeOffset?: number) => {
      if (!subsonicService) return "";
      return subsonicService.getStreamUrl(songId, timeOffset);
    },
    [subsonicService]
  );

  const buildPlayableSong = useCallback(
    (song: SubsonicSong, album?: SubsonicAlbum): Song => {
      const coverArt = song.coverArt ?? album?.coverArt;
      return {
        id: song.id,
        title: song.title,
        artist: song.artist || album?.artist || "Unknown Artist",
        albumName: song.album || album?.name,
        albumId: album?.id ?? song.parent,
        albumArtUrl: coverArt ? getCoverArtUrl(coverArt) : undefined,
      };
    },
    [getCoverArtUrl]
  );

  const regenerateShuffleOrder = useCallback((length: number, startIndex: number) => {
    const rest = Array.from({ length }, (_, i) => i).filter((i) => i !== startIndex);
    shuffleOrderRef.current = [startIndex, ...shuffleArray(rest)];
  }, []);

  const startPlayback = useCallback(
    (
      songs: SubsonicSong[],
      index: number,
      album: SubsonicAlbum | null,
      sourcePath: string | null
    ) => {
      const song = songs[index];
      if (!song) return;
      recordSongPlay(song);
      setCurrentSong(buildPlayableSong(song, album ?? undefined));
      setCurrentAlbum(album);
      setCurrentPlaylist(songs);
      setCurrentSourcePath(sourcePath);
      setCurrentIndex(index);
      setProgressState(0);
      setIsPlaying(true);
      regenerateShuffleOrder(songs.length, index);
    },
    [buildPlayableSong, regenerateShuffleOrder]
  );

  const playSong = useCallback(
    (song: SubsonicSong, album?: SubsonicAlbum, playlist?: SubsonicSong[]) => {
      if (currentSong?.id === song.id) {
        setIsPlaying((playing) => !playing);
        return;
      }
      const songs = playlist?.length ? playlist : [song];
      const index = Math.max(
        songs.findIndex((s) => s.id === song.id),
        0
      );
      startPlayback(songs, index, album ?? null, album ? `/album/${album.id}` : null);
    },
    [currentSong, startPlayback]
  );

  const playAlbum = useCallback(
    (
      album: SubsonicAlbum,
      songs: SubsonicSong[],
      startIndex: number = 0,
      playlistId?: string
    ) => {
      if (songs.length === 0) return;
      if (playlistId) recordPlaylistPlay(playlistId);
      startPlayback(
        songs,
        startIndex,
        album,
        playlistId ? `/playlist/${playlistId}` : `/album/${album.id}`
      );
    },
    [startPlayback]
  );

  const togglePlayPause = useCallback(() => {
    setIsPlaying((playing) => !playing);
  }, []);

  const getCurrentSongIndex = useCallback(() => {
    if (!currentSong || !currentPlaylist.length) return -1;
    if (currentIndex >= 0 && currentPlaylist[currentIndex]?.id === currentSong.id) {
      return currentIndex;
    }
    return currentPlaylist.findIndex((song) => song.id === currentSong.id);
  }, [currentSong, currentPlaylist, currentIndex]);

  const stop = useCallback(() => {
    setCurrentSong(null);
    setIsPlaying(false);
    setProgressState(0);
    setCurrentPlaylist([]);
    setCurrentAlbum(null);
    setCurrentSourcePath(null);
    setCurrentIndex(-1);
    shuffleOrderRef.current = [];
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((wasOn) => {
      if (!wasOn) {
        regenerateShuffleOrder(currentPlaylist.length, currentIndex);
      }
      return !wasOn;
    });
  }, [currentPlaylist.length, currentIndex, regenerateShuffleOrder]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  const jumpToIndex = useCallback(
    (index: number) => {
      const song = currentPlaylist[index];
      if (!song) return;
      recordSongPlay(song);
      setCurrentSong(buildPlayableSong(song, currentAlbum ?? undefined));
      setCurrentIndex(index);
      setProgressState(0);
      setIsPlaying(true);
    },
    [currentPlaylist, currentAlbum, buildPlayableSong]
  );

  const stepThroughOrder = useCallback(
    (direction: 1 | -1) => {
      if (!currentSong || !currentPlaylist.length) return;

      const index = getCurrentSongIndex();
      const order = shuffle
        ? shuffleOrderRef.current
        : Array.from({ length: currentPlaylist.length }, (_, i) => i);
      const position = order.indexOf(index);
      const nextPosition = position + direction;

      if (nextPosition >= order.length) {
        if (repeatMode === "all") {
          if (shuffle) regenerateShuffleOrder(currentPlaylist.length, order[0]);
          jumpToIndex(shuffle ? shuffleOrderRef.current[0] : 0);
        } else {
          setIsPlaying(false);
        }
        return;
      }
      if (nextPosition < 0) {
        if (repeatMode === "all") {
          jumpToIndex(order[order.length - 1]);
        } else {
          // At the start of the queue: restart the current track.
          jumpToIndex(index);
        }
        return;
      }
      jumpToIndex(order[nextPosition]);
    },
    [
      currentSong,
      currentPlaylist,
      getCurrentSongIndex,
      shuffle,
      repeatMode,
      regenerateShuffleOrder,
      jumpToIndex,
    ]
  );

  const skipNext = useCallback(() => stepThroughOrder(1), [stepThroughOrder]);
  const skipPrevious = useCallback(() => stepThroughOrder(-1), [stepThroughOrder]);

  const setProgress = useCallback((newProgress: number) => {
    if (!isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
      setProgressState(newProgress);
    }
  }, []);

  const isCurrentSong = useCallback(
    (songId: string) => currentSong?.id === songId,
    [currentSong]
  );

  const value = useMemo<MusicPlayerContextType>(
    () => ({
      currentSong,
      currentAlbum,
      currentPlaylist,
      currentSourcePath,
      isPlaying,
      progress,
      shuffle,
      repeatMode,
      playSong,
      playAlbum,
      togglePlayPause,
      skipNext,
      skipPrevious,
      setProgress,
      getStreamUrl,
      toggleShuffle,
      toggleRepeat,
      stop,
      isCurrentSong,
      getCurrentSongIndex,
    }),
    [
      currentSong,
      currentAlbum,
      currentPlaylist,
      currentSourcePath,
      isPlaying,
      progress,
      shuffle,
      repeatMode,
      playSong,
      playAlbum,
      togglePlayPause,
      skipNext,
      skipPrevious,
      setProgress,
      getStreamUrl,
      toggleShuffle,
      toggleRepeat,
      stop,
      isCurrentSong,
      getCurrentSongIndex,
    ]
  );

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
