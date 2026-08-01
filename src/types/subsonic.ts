export interface SubsonicAlbum {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  coverArt?: string;
  songCount: number;
  duration: number;
  created: string;
  year?: number;
  genre?: string;
  starred?: string;
}

export interface SubsonicSong {
  id: string;
  parent: string;
  title: string;
  album: string;
  artist: string;
  track?: number;
  year?: number;
  genre?: string;
  coverArt?: string;
  size: number;
  duration: number;
  bitRate?: number;
  path: string;
  suffix: string;
  contentType: string;
  starred?: string;
}

export interface SubsonicPlaylist {
  id: string;
  name: string;
  comment?: string;
  owner?: string;
  public?: boolean;
  songCount: number;
  duration: number;
  created: string;
  changed?: string;
  coverArt?: string;
}

export interface SubsonicApiError {
  code: number;
  message: string;
}

export type SubsonicOkPayload<T> = { status: "ok"; version: string } & Partial<T>;

interface SubsonicFailedPayload {
  status: "failed";
  version: string;
  error?: SubsonicApiError;
}

export interface SubsonicEnvelope<T> {
  "subsonic-response": SubsonicOkPayload<T> | SubsonicFailedPayload;
}
