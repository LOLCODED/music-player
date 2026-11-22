import React from "react";
import { SubsonicAlbum } from "../types/subsonic";
import { formatTotalDuration } from "../utils/duration";
import { gridHeading, tableHeading, withLetterHeadings } from "../utils/letterDividers";
import MediaCard from "./MediaCard";
import MediaTable, { MediaTableHeader } from "./MediaTable";
import MediaTableRow from "./MediaTableRow";
import StarActionButton from "./StarActionButton";

const TABLE_HEADERS: MediaTableHeader[] = [
  { label: "Title" },
  { label: "Artist" },
  { label: "Time", align: "right", width: 56 },
];
const TABLE_COLUMNS = TABLE_HEADERS.length + 1;

interface Props {
  albums: SubsonicAlbum[];
  viewMode: "grid" | "table";
  letterStarts: Map<string, number> | null;
  sortKey: (album: SubsonicAlbum) => string;
  isStarred: (id: string, starred?: string) => boolean;
  toggleStar: (id: string, type: "album", starred: boolean, e: React.MouseEvent) => void;
  onOpen: (album: SubsonicAlbum) => void;
  onPlay: (album: SubsonicAlbum) => void;
  getCoverArtUrl: (coverArt?: string) => string;
}

/** The album list as a grid or a table, with letter headings on alphabetical sorts. */
const AlbumCollection: React.FC<Props> = (props) => {
  const { albums, letterStarts, sortKey, isStarred, toggleStar } = props;

  const card = (album: SubsonicAlbum, i: number) => {
    const starred = isStarred(album.id, album.starred);
    return (
      <MediaCard
        index={i}
        key={album.id}
        imageUrl={props.getCoverArtUrl(album.coverArt)}
        title={album.name}
        subtitle={album.artist}
        starred={starred}
        onClick={() => props.onOpen(album)}
        onPlay={() => props.onPlay(album)}
        onToggleStar={(e) => toggleStar(album.id, "album", starred, e)}
      />
    );
  };

  const row = (album: SubsonicAlbum, i: number) => {
    const starred = isStarred(album.id, album.starred);
    return (
      <MediaTableRow
        index={i}
        key={album.id}
        title={album.name}
        cells={[album.artist]}
        time={formatTotalDuration(album.duration)}
        onClick={() => props.onOpen(album)}
        onPlay={() => props.onPlay(album)}
        trailingAction={<StarActionButton starred={starred} onClick={(e) => toggleStar(album.id, "album", starred, e)} />}
      />
    );
  };

  return props.viewMode === "grid" ? (
    <div className="album-grid">{withLetterHeadings(albums, letterStarts, sortKey, card, gridHeading)}</div>
  ) : (
    <MediaTable headers={TABLE_HEADERS}>
      {withLetterHeadings(albums, letterStarts, sortKey, row, (letter, anchor, i) => tableHeading(TABLE_COLUMNS, letter, anchor, i))}
    </MediaTable>
  );
};

export default AlbumCollection;
