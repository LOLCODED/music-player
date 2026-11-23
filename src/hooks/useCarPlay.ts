import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { CarPlay, CarPlayListRequest, CarPlaySelection } from "../services/CarPlayPlugin";
import type { SubsonicService } from "../services/SubsonicService";
import { loadCarPlaySection, loadCarPlaySelection } from "../utils/carPlayLibrary";
import { toErrorMessage } from "../utils/errors";

export const CARPLAY_SIGNED_OUT_MESSAGE = "Sign in to Cascade on your iPhone";
export const CARPLAY_EMPTY_MESSAGE = "Nothing here yet";

async function answerListRequest(
  service: SubsonicService | null,
  { requestId, section }: CarPlayListRequest
): Promise<void> {
  if (!service) {
    await CarPlay.resolveList({ requestId, items: [], emptyMessage: CARPLAY_SIGNED_OUT_MESSAGE });
    return;
  }
  try {
    const items = await loadCarPlaySection(service, section);
    await CarPlay.resolveList({ requestId, items, emptyMessage: CARPLAY_EMPTY_MESSAGE });
  } catch (err) {
    await CarPlay.resolveList({
      requestId,
      items: [],
      emptyMessage: `Couldn't load: ${toErrorMessage(err)}`,
    });
  }
}

/**
 * Serves the CarPlay screen: answers its list requests from the Subsonic
 * library and plays what the driver picks through the regular player.
 */
export function useCarPlay() {
  const { subsonicService, loading } = useAuth();
  const { playAlbum } = useMusicPlayer();
  const serviceRef = useRef(subsonicService);
  const playAlbumRef = useRef(playAlbum);
  useEffect(() => {
    serviceRef.current = subsonicService;
    playAlbumRef.current = playAlbum;
  });

  useEffect(() => {
    if (!Capacitor.isPluginAvailable("CarPlay")) return;
    const handleSelection = async ({ kind, id }: CarPlaySelection) => {
      const service = serviceRef.current;
      if (!service) return;
      try {
        const { album, songs, playlistId } = await loadCarPlaySelection(service, kind, id);
        playAlbumRef.current(album, songs, undefined, playlistId);
      } catch (err) {
        console.error("CarPlay playback failed:", err);
      }
    };
    const handles = [
      CarPlay.addListener("listRequested", (request) => {
        void answerListRequest(serviceRef.current, request).catch(() => {});
      }),
      CarPlay.addListener("itemSelected", (selection) => void handleSelection(selection)),
    ];
    return () => handles.forEach((handle) => handle.then((h) => h.remove()));
  }, []);

  useEffect(() => {
    if (loading || !Capacitor.isPluginAvailable("CarPlay")) return;
    void CarPlay.ready().catch(() => {});
  }, [loading, subsonicService]);
}
