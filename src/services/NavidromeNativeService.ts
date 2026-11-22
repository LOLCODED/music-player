import { getServerBase } from "./SubsonicBase";

// Navidrome's own API (not Subsonic) authenticates with a session JWT sent in
// this header, and returns a refreshed token in the same header.
const AUTH_HEADER = "x-nd-authorization";

export class NativeAuthError extends Error {
  constructor(message = "Navidrome session expired") {
    super(message);
    this.name = "NativeAuthError";
  }
}

async function failure(res: Response, action: string): Promise<Error> {
  if (res.status === 401) return new NativeAuthError();
  if (res.status === 403) return new Error(`${action} not allowed for this account`);
  const detail = (await res.text().catch(() => "")).trim();
  return new Error(`${action} failed (${res.status})${detail ? `: ${detail}` : ""}`);
}

export async function nativeLogin(
  serverUrl: string,
  username: string,
  password: string
): Promise<string> {
  const res = await fetch(`${getServerBase(serverUrl)}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 401) throw new Error("Wrong password");
  if (!res.ok) throw await failure(res, "Sign-in");
  const { token } = (await res.json()) as { token?: string };
  if (!token) throw new Error("Sign-in returned no session token");
  return token;
}

/** Uploads a playlist cover. Returns the server's refreshed session token, if any. */
export async function uploadPlaylistCover(
  serverUrl: string,
  sessionToken: string,
  playlistId: string,
  image: Blob
): Promise<string | null> {
  const body = new FormData();
  body.append("image", image);
  const res = await fetch(
    `${getServerBase(serverUrl)}/api/playlist/${encodeURIComponent(playlistId)}/image`,
    { method: "POST", headers: { [AUTH_HEADER]: `Bearer ${sessionToken}` }, body }
  );
  if (!res.ok) throw await failure(res, "Cover upload");
  return res.headers.get(AUTH_HEADER)?.replace(/^Bearer\s+/i, "") || null;
}
