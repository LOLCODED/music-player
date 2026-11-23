import { useEffect, useRef } from "react";
import { Song } from "../types/player";

interface Handlers {
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
}

/**
 * Publishes the current song to the OS (lock screen, Control Centre, headphone
 * buttons) and routes its transport buttons back to the player.
 */
export function useMediaSession(song: Song | null, isPlaying: boolean, handlers: Handlers) {
  const handlersRef = useRef(handlers);
  const playingRef = useRef(isPlaying);
  useEffect(() => {
    handlersRef.current = handlers;
    playingRef.current = isPlaying;
  });

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = song
      ? new MediaMetadata({
          title: song.title,
          artist: song.artist,
          album: song.albumName ?? "",
          artwork: song.albumArtUrl ? [{ src: song.albumArtUrl, sizes: "300x300" }] : [],
        })
      : null;
  }, [song]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = song ? (isPlaying ? "playing" : "paused") : "none";
  }, [song, isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const actions: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ["play", () => { if (!playingRef.current) handlersRef.current.togglePlayPause(); }],
      ["pause", () => { if (playingRef.current) handlersRef.current.togglePlayPause(); }],
      ["nexttrack", () => handlersRef.current.skipNext()],
      ["previoustrack", () => handlersRef.current.skipPrevious()],
      // iOS shows ±10s skip buttons in place of next/previous unless seeking is
      // explicitly unsupported.
      ["seekbackward", null],
      ["seekforward", null],
    ];
    for (const [action, handler] of actions) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Older WebKit throws for actions it doesn't support.
      }
    }
    return () => {
      for (const [action] of actions) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // Same as above.
        }
      }
    };
  }, []);
}
