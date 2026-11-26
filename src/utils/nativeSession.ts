import { connectionKey } from "./connectionKey";

const STORAGE_KEY = "navidromeSessions";

type Sessions = Record<string, string>;

function readAll(): Sessions {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Sessions) : {};
  } catch {
    return {};
  }
}

function writeAll(sessions: Sessions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Without storage the session lasts until reload, which is acceptable.
  }
}

export function getNativeSession(serverUrl: string, username: string): string | null {
  return readAll()[connectionKey(serverUrl, username)] ?? null;
}

export function setNativeSession(serverUrl: string, username: string, token: string): void {
  writeAll({ ...readAll(), [connectionKey(serverUrl, username)]: token });
}

export function clearNativeSession(serverUrl: string, username: string): void {
  const { [connectionKey(serverUrl, username)]: _removed, ...rest } = readAll();
  writeAll(rest);
}
