import { useCallback, useState } from "react";
import { SubsonicConfig } from "../config/subsonic";
import {
  NativeAuthError,
  nativeLogin,
  uploadPlaylistCover,
} from "../services/NavidromeNativeService";
import { clearNativeSession, getNativeSession, setNativeSession } from "../utils/nativeSession";
import { toErrorMessage } from "../utils/errors";

type CoverState =
  | { step: "idle" }
  | { step: "needsPassword"; file: File; error?: string }
  | { step: "uploading" };

export function usePlaylistCover(
  playlistId: string,
  config: SubsonicConfig | null,
  onUploaded: () => void,
  onError: (msg: string) => void
) {
  const [state, setState] = useState<CoverState>({ step: "idle" });

  const upload = useCallback(
    async (file: File, token: string) => {
      if (!config) return;
      setState({ step: "uploading" });
      try {
        const refreshed = await uploadPlaylistCover(config.serverUrl, token, playlistId, file);
        setNativeSession(config.serverUrl, config.username, refreshed ?? token);
        setState({ step: "idle" });
        onUploaded();
      } catch (err) {
        if (err instanceof NativeAuthError) {
          clearNativeSession(config.serverUrl, config.username);
          setState({ step: "needsPassword", file });
          return;
        }
        setState({ step: "idle" });
        onError(toErrorMessage(err));
      }
    },
    [config, playlistId, onUploaded, onError]
  );

  const chooseFile = useCallback(
    (file: File) => {
      if (!config) return;
      const token = getNativeSession(config.serverUrl, config.username);
      if (token) void upload(file, token);
      else setState({ step: "needsPassword", file });
    },
    [config, upload]
  );

  const submitPassword = useCallback(
    async (password: string) => {
      if (!config || state.step !== "needsPassword") return;
      const { file } = state;
      setState({ step: "uploading" });
      try {
        const token = await nativeLogin(config.serverUrl, config.username, password);
        await upload(file, token);
      } catch (err) {
        setState({ step: "needsPassword", file, error: toErrorMessage(err) });
      }
    },
    [config, state, upload]
  );

  const cancel = useCallback(() => setState({ step: "idle" }), []);

  return { state, chooseFile, submitPassword, cancel };
}
