import MD5 from "crypto-js/md5";
import { SubsonicConfig } from "../config/subsonic";
import { SubsonicEnvelope, SubsonicOkPayload } from "../types/subsonic";

const REQUEST_TIMEOUT_MS = 15000;

export class SubsonicError extends Error {
  constructor(
    message: string,
    readonly code?: number
  ) {
    super(message);
    this.name = "SubsonicError";
  }
}

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

export function deriveAuthToken(
  config: SubsonicConfig,
  salt: string
): { token: string; salt: string } {
  if (config.token && config.salt) {
    return { token: config.token, salt: config.salt };
  }
  if (!config.password) {
    throw new SubsonicError(
      "Missing credentials: config has neither password nor token/salt"
    );
  }
  return { token: MD5(config.password + salt).toString(), salt };
}

type QueryValue = string | number | boolean | undefined;

export function buildActionUrl(
  config: SubsonicConfig,
  salt: string,
  action: string,
  params: Record<string, QueryValue | QueryValue[]> = {}
): string {
  const auth = deriveAuthToken(config, salt);
  const search = new URLSearchParams({
    u: config.username,
    t: auth.token,
    s: auth.salt,
    v: config.apiVersion,
    c: config.appName,
    f: "json",
  });
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) search.append(key, String(item));
    }
  }
  return `${getServerBase(config.serverUrl)}/rest/${action}.view?${search.toString()}`;
}

export async function subsonicGet<T>(
  url: string,
  signal?: AbortSignal
): Promise<SubsonicOkPayload<T>> {
  const response = await fetch(url, {
    signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new SubsonicError(`Server responded with HTTP ${response.status}`);
  }
  const data = (await response.json()) as SubsonicEnvelope<T>;
  const payload = data["subsonic-response"];
  if (!payload || typeof payload.status !== "string") {
    throw new SubsonicError("Malformed Subsonic response");
  }
  if (payload.status !== "ok") {
    throw new SubsonicError(
      payload.error?.message ?? "Subsonic request failed",
      payload.error?.code
    );
  }
  return payload;
}

export function request<T>(
  config: SubsonicConfig,
  salt: string,
  action: string,
  params?: Record<string, QueryValue | QueryValue[]>
): Promise<SubsonicOkPayload<T>> {
  return subsonicGet<T>(buildActionUrl(config, salt, action, params));
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
