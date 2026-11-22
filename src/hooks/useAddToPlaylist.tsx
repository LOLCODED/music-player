import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AddToPlaylistDialog, { PlaylistTargetSong } from "../components/AddToPlaylistDialog";
import { clearCachedState } from "./usePageCache";

export function useAddToPlaylist(showToast: (message: string) => void) {
  const { subsonicService } = useAuth();
  const [song, setSong] = useState<PlaylistTargetSong | null>(null);

  const openAddToPlaylist = useCallback((target: PlaylistTargetSong) => setSong(target), []);
  const close = useCallback(() => setSong(null), []);

  const handleDone = useCallback(
    (message: string) => {
      clearCachedState(subsonicService, "playlists:");
      setSong(null);
      showToast(message);
    },
    [subsonicService, showToast]
  );

  const addToPlaylistDialog =
    song && subsonicService ? (
      <AddToPlaylistDialog
        song={song}
        subsonicService={subsonicService}
        onDone={handleDone}
        onClose={close}
      />
    ) : null;

  return { openAddToPlaylist, addToPlaylistDialog };
}
