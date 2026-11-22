import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { SubsonicPlaylist } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { toErrorMessage } from "../utils/errors";
import Modal from "./Modal";
import CreatePlaylistDialog from "./CreatePlaylistDialog";

export interface PlaylistTargetSong {
  id: string;
  title: string;
}

interface AddToPlaylistDialogProps {
  song: PlaylistTargetSong;
  subsonicService: SubsonicService;
  onDone: (message: string) => void;
  onClose: () => void;
}

const AddToPlaylistDialog: React.FC<AddToPlaylistDialogProps> = ({
  song,
  subsonicService,
  onDone,
  onClose,
}) => {
  const [playlists, setPlaylists] = useState<SubsonicPlaylist[] | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    subsonicService
      .getPlaylists()
      .then((list) => !cancelled && setPlaylists(list))
      .catch((err) => !cancelled && onDone(`Failed to load playlists: ${toErrorMessage(err)}`));
    return () => {
      cancelled = true;
    };
  }, [subsonicService, onDone]);

  const addTo = async (playlist: SubsonicPlaylist) => {
    try {
      await subsonicService.addToPlaylist(playlist.id, [song.id]);
      onDone(`Added "${song.title}" to "${playlist.name}"`);
    } catch (err) {
      onDone(`Failed to add to playlist: ${toErrorMessage(err)}`);
    }
  };

  const create = async (name: string) => {
    try {
      await subsonicService.createPlaylist(name, [song.id]);
      onDone(`Created playlist "${name}" with "${song.title}"`);
    } catch (err) {
      onDone(`Failed to create playlist: ${toErrorMessage(err)}`);
    }
  };

  if (creating) {
    return <CreatePlaylistDialog onSubmit={create} onClose={onClose} />;
  }

  return (
    <Modal title="Add to Playlist" onClose={onClose} showCloseButton>
      <button className="btn modal-list-btn" onClick={() => setCreating(true)}>
        <Plus size={14} /> Create New Playlist
      </button>
      {playlists?.map((playlist) => (
        <button key={playlist.id} className="btn modal-list-btn" onClick={() => addTo(playlist)}>
          {playlist.name}
        </button>
      ))}
    </Modal>
  );
};

export default AddToPlaylistDialog;
