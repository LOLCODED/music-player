import { SubsonicConfig } from "../config/subsonic";
import { buildActionUrl } from "./SubsonicBase";

export function getStreamUrl(
  config: SubsonicConfig,
  salt: string,
  songId: string,
  timeOffset?: number,
  maxBitRate?: number
): string {
  return buildActionUrl(config, salt, "stream", {
    id: songId,
    timeOffset:
      timeOffset !== undefined && timeOffset > 0
        ? Math.floor(timeOffset)
        : undefined,
    maxBitRate:
      maxBitRate !== undefined && maxBitRate > 0 ? maxBitRate : undefined,
    format: "raw",
  });
}

export function getCoverArtUrl(
  config: SubsonicConfig,
  salt: string,
  coverArtId: string,
  size?: number
): string {
  return buildActionUrl(config, salt, "getCoverArt", {
    id: coverArtId,
    size,
  });
}
