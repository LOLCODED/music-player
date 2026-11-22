import React, { useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePlaylistCover } from "./usePlaylistCover";
import CoverPasswordForm from "../components/CoverPasswordForm";

const ACCEPTED_IMAGES = "image/png,image/jpeg,image/webp,image/gif";

/**
 * Opens a file picker for a playlist's cover and uploads the choice. Render
 * `picker` once on the page: it holds the hidden input and, when Navidrome
 * needs a fresh session, the password prompt.
 */
export function usePlaylistCoverPicker(
  onUploaded: (playlistId: string) => void,
  onError: (msg: string) => void
) {
  const { subsonicConfig } = useAuth();
  const cover = usePlaylistCover(subsonicConfig, onUploaded, onError);
  const inputRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<string | null>(null);

  const pick = useCallback((playlistId: string) => {
    targetRef.current = playlistId;
    inputRef.current?.click();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && targetRef.current) cover.chooseFile(targetRef.current, file);
  };

  const picker = (
    <>
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGES} hidden onChange={handleChange} />
      {cover.state.step === "needsPassword" && subsonicConfig && (
        <CoverPasswordForm
          username={subsonicConfig.username}
          busy={false}
          error={cover.state.error}
          onSubmit={cover.submitPassword}
          onCancel={cover.cancel}
        />
      )}
    </>
  );

  const uploadingId = cover.state.step === "uploading" ? cover.state.playlistId : null;
  return { pick, picker, uploadingId };
}
