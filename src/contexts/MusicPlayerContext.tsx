import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { SubsonicSong, SubsonicAlbum } from "../services/SubsonicService";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Add ref to prevent excessive updates
  const lastProgressUpdate = useRef<number>(0);

  const getCoverArtUrl = useCallback(
    (coverArtId?: string) => {
      if (!coverArtId || !subsonicService)
        return DEFAULT_ALBUM_ART;
      return subsonicService.getCoverArtUrl(coverArtId, 300);
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
    (song: SubsonicSong, album?: SubsonicAlbum) => ({
      id: song.id,
      title: song.title,
      artist: song.artist || album?.artist || "Unknown Artist",
      albumName: album?.name,
      albumId: album?.id,
      albumArtUrl: album?.coverArt ? getCoverArtUrl(album.coverArt) : undefined,
      audioUrl: getStreamUrl(song.id),
    }),
    [getCoverArtUrl, getStreamUrl]
  );

  const playSong = useCallback(
    (song: SubsonicSong, album?: SubsonicAlbum, playlist?: SubsonicSong[]) => {
      if (currentSong?.id === song.id) {
        setIsPlaying(!isPlaying);
      } else {
        recordSongPlay(song);
        const playableSong = buildPlayableSong(song, album);
        setCurrentSong(playableSong);
        setCurrentAlbum(album || null);
        setCurrentPlaylist(playlist || [song]);
        setCurrentSourcePath(album ? `/album/${album.id}` : null);
        setProgressState(0);
        setIsPlaying(true);
      }
    },
    [currentSong, isPlaying, buildPlayableSong]
  );

  const playAlbum = useCallback(
    (album: SubsonicAlbum, songs: SubsonicSong[], startIndex: number = 0, playlistId?: string) => {
      if (songs.length === 0) return;

      const songToPlay = songs[startIndex];
      recordSongPlay(songToPlay);
      if (playlistId) recordPlaylistPlay(playlistId);
      const playableSong = buildPlayableSong(songToPlay, album);

      setCurrentSong(playableSong);
      setCurrentAlbum(album);
      setCurrentPlaylist(songs);
      setCurrentSourcePath(playlistId ? `/playlist/${playlistId}` : `/album/${album.id}`);
      setProgressState(0);
      setIsPlaying(true);
    },
    [buildPlayableSong]
  );

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const getCurrentSongIndex = useCallback(() => {
    if (!currentSong || !currentPlaylist.length) return -1;
    return currentPlaylist.findIndex((song) => song.id === currentSong.id);
  }, [currentSong, currentPlaylist]);

  const stop = useCallback(() => {
    setCurrentSong(null);
    setIsPlaying(false);
    setProgressState(0);
    setCurrentPlaylist([]);
    setCurrentAlbum(null);
    setCurrentSourcePath(null);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const toggleRepeat = useCallback(() => {
    setRepeatMode(m => m === 'off' ? 'all' : m === 'all' ? 'one' : 'off');
  }, []);

  const skipNext = useCallback(() => {
    if (!currentSong || !currentPlaylist.length) return;

    const currentIndex = getCurrentSongIndex();
    let nextIndex: number;

    if (shuffle && currentPlaylist.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * currentPlaylist.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= currentPlaylist.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    const nextSong = currentPlaylist[nextIndex];
    recordSongPlay(nextSong);
    const playableSong = buildPlayableSong(nextSong, currentAlbum || undefined);

    setCurrentSong(playableSong);
    setProgressState(0);
    setIsPlaying(true);
  }, [
    currentSong,
    currentPlaylist,
    currentAlbum,
    getCurrentSongIndex,
    buildPlayableSong,
    shuffle,
    repeatMode,
  ]);

  const skipPrevious = useCallback(() => {
    if (!currentSong || !currentPlaylist.length) return;

    const currentIndex = getCurrentSongIndex();
    const previousIndex = currentIndex - 1;

    if (previousIndex < 0) return;

    const previousSong = currentPlaylist[previousIndex];
    recordSongPlay(previousSong);
    const playableSong = buildPlayableSong(
      previousSong,
      currentAlbum || undefined
    );

    setCurrentSong(playableSong);
    setProgressState(0);
    setIsPlaying(true);
  }, [
    currentSong,
    currentPlaylist,
    currentAlbum,
    getCurrentSongIndex,
    buildPlayableSong,
  ]);

  const setProgress = useCallback((newProgress: number) => {
    const now = Date.now();

    // Throttle updates to avoid excessive calls
    if (now - lastProgressUpdate.current > 100) {
      // Update at most every 100ms
      if (!isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
        setProgressState(newProgress);
        lastProgressUpdate.current = now;
      }
    }
  }, []);

  const isCurrentSong = useCallback(
    (songId: string) => {
      return currentSong?.id === songId;
    },
    [currentSong]
  );

  const value: MusicPlayerContextType = {
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
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
