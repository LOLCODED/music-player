import CryptoJS from "crypto-js";
import { SubsonicConfig } from "../config/subsonic";

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getServerBase(serverUrl: string): string {
  return serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
}

export function buildAuthQuery(config: SubsonicConfig, salt: string): string {
  const token = CryptoJS.MD5(config.password! + salt).toString();
  return (
    `u=${encodeURIComponent(config.username)}` +
    `&t=${token}` +
    `&s=${salt}` +
    `&v=${config.apiVersion}` +
    `&c=${config.appName}`
  );
}

export function buildActionUrl(
  config: SubsonicConfig,
  salt: string,
  action: string
): string {
  return (
    `${getServerBase(config.serverUrl)}/rest/${action}.view` +
    `?${buildAuthQuery(config, salt)}&f=json`
  );
}
