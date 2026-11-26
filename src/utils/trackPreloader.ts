// Large enough for a long lossless track; anything bigger isn't worth holding in memory.
export const MAX_PRELOAD_BYTES = 80 * 1024 * 1024;

interface Entry {
  controller: AbortController;
  objectUrl?: string;
}

async function download(fetchImpl: typeof fetch, url: string, signal: AbortSignal): Promise<Blob> {
  const response = await fetchImpl(url, { signal });
  if (!response.ok || !response.body) throw new Error(`Preload failed: HTTP ${response.status}`);
  if (Number(response.headers.get("Content-Length")) > MAX_PRELOAD_BYTES) {
    throw new Error("Preload skipped: track too large");
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_PRELOAD_BYTES) {
      await reader.cancel();
      throw new Error("Preload skipped: track too large");
    }
    chunks.push(value);
  }
  return new Blob(chunks, { type: response.headers.get("Content-Type") ?? "" });
}

/**
 * Downloads upcoming tracks in full so they play from memory, immune to
 * signal drops, and seek without asking the server to re-transcode.
 */
export function createTrackPreloader(fetchImpl: typeof fetch = (...args) => fetch(...args)) {
  const entries = new Map<string, Entry>();

  const discard = (songId: string, entry: Entry) => {
    entry.controller.abort();
    if (entry.objectUrl) URL.revokeObjectURL(entry.objectUrl);
    entries.delete(songId);
  };

  return {
    preload(songId: string, url: string): void {
      if (entries.has(songId)) return;
      const entry: Entry = { controller: new AbortController() };
      entries.set(songId, entry);
      download(fetchImpl, url, entry.controller.signal)
        .then((blob) => {
          if (entries.get(songId) === entry) entry.objectUrl = URL.createObjectURL(blob);
        })
        .catch(() => {
          if (entries.get(songId) === entry) entries.delete(songId);
        });
    },

    // A local URL for the track once it has fully downloaded.
    urlFor(songId: string): string | undefined {
      return entries.get(songId)?.objectUrl;
    },

    retainOnly(songIds: string[]): void {
      for (const [songId, entry] of entries) {
        if (!songIds.includes(songId)) discard(songId, entry);
      }
    },
  };
}

export type TrackPreloader = ReturnType<typeof createTrackPreloader>;
