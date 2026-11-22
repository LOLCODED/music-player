const STORAGE_KEY = "navidromeSessions";

type Sessions = Record<string, string>;

function sessionKey(serverUrl: string, username: string): string {
  return `${serverUrl.replace(/\/+$/, "")}|${username}`;
}

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
  return readAll()[sessionKey(serverUrl, username)] ?? null;
}

export function setNativeSession(serverUrl: string, username: string, token: string): void {
  writeAll({ ...readAll(), [sessionKey(serverUrl, username)]: token });
}

export function clearNativeSession(serverUrl: string, username: string): void {
  const { [sessionKey(serverUrl, username)]: _removed, ...rest } = readAll();
  writeAll(rest);
}
