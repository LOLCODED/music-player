import { useState, useCallback } from "react";
import React from "react";
import { SubsonicService } from "../services/SubsonicService";
import { StarableType } from "../services/SubsonicFavoritesService";
import { toErrorMessage } from "../utils/errors";

export function useStarToggle(
  subsonicService: SubsonicService | null,
  onError?: (msg: string) => void
) {
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map());

  const isStarred = useCallback(
    (id: string, starred?: string): boolean => {
      if (overrides.has(id)) return overrides.get(id)!;
      return !!starred;
    },
    [overrides]
  );

  const toggleStar = useCallback(
    async (
      id: string,
      type: StarableType,
      currentlyStarred: boolean,
      e: React.MouseEvent
    ) => {
      e.stopPropagation();
      if (!subsonicService) return;
      setOverrides((prev) => new Map(prev).set(id, !currentlyStarred));
      try {
        if (currentlyStarred) {
          await subsonicService.unstar(id, type);
        } else {
          await subsonicService.star(id, type);
        }
      } catch (err) {
        setOverrides((prev) => new Map(prev).set(id, currentlyStarred));
        onError?.(`Failed to update favorite: ${toErrorMessage(err)}`);
      }
    },
    [subsonicService, onError]
  );

  return { isStarred, toggleStar };
}
