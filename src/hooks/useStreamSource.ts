import { useCallback, useEffect, useRef, useState } from "react";
import type { SubsonicService } from "../services/SubsonicService";
import { useSettings } from "../contexts/SettingsContext";
import { streamQualityBitRate } from "../types/settings";
import { createTrackPreloader } from "../utils/trackPreloader";
import { useIsCellular } from "./useIsCellular";

// Give the current track a head start on the connection before fetching the next one.
export const PRELOAD_DELAY_MS = 10_000;

/**
 * Resolves the URL each song plays from: a fully preloaded copy when one is
 * ready, otherwise a live stream at the quality set for the current network.
 */
export function useStreamSource(
  subsonicService: SubsonicService | null,
  currentSongId: string | null,
  isPlaying: boolean,
  peekNextSongId: () => string | undefined
) {
  const { wifiStreamQuality, cellularStreamQuality } = useSettings();
  const isCellular = useIsCellular();
  const maxBitRate = streamQualityBitRate(isCellular ? cellularStreamQuality : wifiStreamQuality);
  // Read through a ref so a network change applies from the next song
  // instead of reloading the one that is playing.
  const maxBitRateRef = useRef(maxBitRate);
  useEffect(() => {
    maxBitRateRef.current = maxBitRate;
  });
  const [preloader] = useState(createTrackPreloader);

  const liveStreamUrl = useCallback(
    (songId: string, timeOffset?: number) =>
      subsonicService?.getStreamUrl(songId, timeOffset, maxBitRateRef.current) ?? "",
    [subsonicService]
  );

  const getStreamUrl = useCallback(
    (songId: string, timeOffset?: number) =>
      (timeOffset ? undefined : preloader.urlFor(songId)) ?? liveStreamUrl(songId, timeOffset),
    [preloader, liveStreamUrl]
  );

  useEffect(() => {
    const nextSongId = currentSongId ? peekNextSongId() : undefined;
    preloader.retainOnly([currentSongId, nextSongId].filter((id): id is string => !!id));
    if (!isPlaying || !nextSongId || nextSongId === currentSongId) return;
    const timer = setTimeout(
      () => preloader.preload(nextSongId, liveStreamUrl(nextSongId)),
      PRELOAD_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [preloader, liveStreamUrl, currentSongId, isPlaying, peekNextSongId]);

  return getStreamUrl;
}
