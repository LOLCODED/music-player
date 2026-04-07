import { SubsonicConfig } from "../config/subsonic";
import { buildAuthQuery, getServerBase } from "./SubsonicBase";

export function getStreamUrl(
  config: SubsonicConfig,
  salt: string,
  songId: string,
  timeOffset?: number,
  maxBitRate?: number
): string {
  const base = getServerBase(config.serverUrl);
  let url =
    `${base}/rest/stream.view` +
    `?id=${encodeURIComponent(songId)}` +
    `&${buildAuthQuery(config, salt)}`;

  if (timeOffset !== undefined && timeOffset > 0) {
    url += `&timeOffset=${Math.floor(timeOffset)}`;
  }
  if (maxBitRate !== undefined && maxBitRate > 0) {
    url += `&maxBitRate=${maxBitRate}`;
  }
  url += `&format=raw`;
  return url;
}

export function getCoverArtUrl(
  config: SubsonicConfig,
  salt: string,
  coverArtId: string,
  size?: number
): string {
  const base = getServerBase(config.serverUrl);
  let url =
    `${base}/rest/getCoverArt.view` +
    `?id=${encodeURIComponent(coverArtId)}` +
    `&${buildAuthQuery(config, salt)}`;

  if (size) {
    url += `&size=${size}`;
  }
  return url;
}
