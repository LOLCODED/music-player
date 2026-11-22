import { useCallback, useState } from "react";
import { SubsonicConfig } from "../config/subsonic";
import {
  NativeAuthError,
  nativeLogin,
  uploadPlaylistCover,
} from "../services/NavidromeNativeService";
import { clearNativeSession, getNativeSession, setNativeSession } from "../utils/nativeSession";
import { toErrorMessage } from "../utils/errors";

interface PendingUpload {
  playlistId: string;
  file: File;
}

type CoverState =
  | { step: "idle" }
  | ({ step: "needsPassword"; error?: string } & PendingUpload)
  | { step: "uploading"; playlistId: string };

export function usePlaylistCover(
  config: SubsonicConfig | null,
  onUploaded: (playlistId: string) => void,
  onError: (msg: string) => void
) {
  const [state, setState] = useState<CoverState>({ step: "idle" });

  const upload = useCallback(
    async ({ playlistId, file }: PendingUpload, token: string) => {
      if (!config) return;
      setState({ step: "uploading", playlistId });
      try {
        const refreshed = await uploadPlaylistCover(config.serverUrl, token, playlistId, file);
        setNativeSession(config.serverUrl, config.username, refreshed ?? token);
        setState({ step: "idle" });
        onUploaded(playlistId);
      } catch (err) {
        if (err instanceof NativeAuthError) {
          clearNativeSession(config.serverUrl, config.username);
          setState({ step: "needsPassword", playlistId, file });
          return;
        }
        setState({ step: "idle" });
        onError(toErrorMessage(err));
      }
    },
    [config, onUploaded, onError]
  );

  const chooseFile = useCallback(
    (playlistId: string, file: File) => {
      if (!config) return;
      const token = getNativeSession(config.serverUrl, config.username);
      if (token) void upload({ playlistId, file }, token);
      else setState({ step: "needsPassword", playlistId, file });
    },
    [config, upload]
  );

  const submitPassword = useCallback(
    async (password: string) => {
      if (!config || state.step !== "needsPassword") return;
      const pending = { playlistId: state.playlistId, file: state.file };
      setState({ step: "uploading", playlistId: pending.playlistId });
      try {
        const token = await nativeLogin(config.serverUrl, config.username, password);
        await upload(pending, token);
      } catch (err) {
        setState({ step: "needsPassword", ...pending, error: toErrorMessage(err) });
      }
    },
    [config, state, upload]
  );

  const cancel = useCallback(() => setState({ step: "idle" }), []);

  return { state, chooseFile, submitPassword, cancel };
}
