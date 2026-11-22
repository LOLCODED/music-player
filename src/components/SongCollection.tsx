import React from "react";
import { SubsonicSong } from "../types/subsonic";
import { formatTrackDuration } from "../utils/duration";
import { gridHeading, tableHeading, withLetterHeadings } from "../utils/letterDividers";
import MediaCard from "./MediaCard";
import MediaTable, { MediaTableHeader } from "./MediaTable";
import MediaTableRow from "./MediaTableRow";
import StarActionButton from "./StarActionButton";
import AddToPlaylistButton from "./AddToPlaylistButton";

const TABLE_HEADERS: MediaTableHeader[] = [
  { label: "Title" },
  { label: "Artist" },
  { label: "Album" },
  { label: "Time", align: "right", width: 56 },
];
const TABLE_COLUMNS = TABLE_HEADERS.length + 1;

export interface SongCollectionProps {
  songs: SubsonicSong[];
  viewMode: "grid" | "table";
  letterStarts: Map<string, number> | null;
  sortKey: (song: SubsonicSong) => string;
  isStarred: (id: string, starred?: string) => boolean;
  toggleStar: (id: string, type: "song", starred: boolean, e: React.MouseEvent) => void;
  isCurrentSong: (id: string) => boolean;
  isPlaying: boolean;
  onPlay: (song: SubsonicSong) => void;
  getCoverArtUrl: (coverArt?: string) => string;
  onAddToPlaylist: (song: SubsonicSong) => void;
}

function songRow(props: SongCollectionProps, song: SubsonicSong, index: number) {
  const starred = props.isStarred(song.id, song.starred);
  const current = props.isCurrentSong(song.id);
  return (
    <MediaTableRow
      key={song.id}
      index={index}
      title={song.title}
      cells={[song.artist, song.album]}
      time={song.duration ? formatTrackDuration(song.duration) : ""}
      active={current}
      playing={current && props.isPlaying}
      onClick={() => props.onPlay(song)}
      onPlay={() => props.onPlay(song)}
      trailingAction={
        <>
          <AddToPlaylistButton className="table-delete-btn" onClick={() => props.onAddToPlaylist(song)} />
          <StarActionButton starred={starred} onClick={(e) => props.toggleStar(song.id, "song", starred, e)} />
        </>
      }
    />
  );
}

function songCard(props: SongCollectionProps, song: SubsonicSong, index: number) {
  const starred = props.isStarred(song.id, song.starred);
  return (
    <MediaCard
      key={song.id}
      index={index}
      imageUrl={props.getCoverArtUrl(song.coverArt)}
      title={song.title}
      subtitle={song.artist}
      starred={starred}
      playing={props.isCurrentSong(song.id) && props.isPlaying}
      onClick={() => props.onPlay(song)}
      onPlay={() => props.onPlay(song)}
      onToggleStar={(e) => props.toggleStar(song.id, "song", starred, e)}
    />
  );
}

/** The song list as a table or a grid, with letter headings on alphabetical sorts. */
const SongCollection: React.FC<SongCollectionProps> = (props) => {
  const { songs, letterStarts, sortKey } = props;
  if (props.viewMode === "table") {
    return (
      <MediaTable headers={TABLE_HEADERS}>
        {withLetterHeadings(songs, letterStarts, sortKey, (s, i) => songRow(props, s, i), (letter, anchor, i) => tableHeading(TABLE_COLUMNS, letter, anchor, i))}
      </MediaTable>
    );
  }
  return (
    <div className="album-grid">
      {withLetterHeadings(songs, letterStarts, sortKey, (s, i) => songCard(props, s, i), gridHeading)}
    </div>
  );
};

export default SongCollection;
