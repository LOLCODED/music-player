import { SubsonicConfig } from "../config/subsonic";
import { buildActionUrl } from "./SubsonicBase";

export function getStreamUrl(
  config: SubsonicConfig,
  salt: string,
  songId: string,
  timeOffset?: number,
  maxBitRate?: number
): string {
  const transcode = maxBitRate !== undefined && maxBitRate > 0;
  return buildActionUrl(config, salt, "stream", {
    id: songId,
    timeOffset:
      timeOffset !== undefined && timeOffset > 0
        ? Math.floor(timeOffset)
        : undefined,
    maxBitRate: transcode ? maxBitRate : undefined,
    // "raw" disables transcoding. MP3 plays everywhere, and an estimated
    // length lets the player show the duration of a transcoded stream.
    format: transcode ? "mp3" : "raw",
    estimateContentLength: transcode ? true : undefined,
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
