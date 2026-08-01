import { useCallback } from "react";
import { SubsonicService } from "../services/SubsonicService";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";
import { COVER_ART_SIZE } from "../utils/constants";

// Returns a stable resolver from a coverArt id to a display URL, falling back
// to the inline placeholder when there is no art or no service yet.
export function useCoverArtUrl(subsonicService: SubsonicService | null) {
  return useCallback(
    (coverArtId?: string): string => {
      if (!coverArtId || !subsonicService) return DEFAULT_ALBUM_ART;
      return subsonicService.getCoverArtUrl(coverArtId, COVER_ART_SIZE);
    },
    [subsonicService]
  );
}
