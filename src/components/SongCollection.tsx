import React from "react";
import { SubsonicSong } from "../types/subsonic";
import { formatTrackDuration } from "../utils/duration";
import { letterAnchorId, letterOf } from "../utils/letterGroups";
import MediaCard from "./MediaCard";
import MediaTable, { MediaTableHeader } from "./MediaTable";
import MediaTableRow from "./MediaTableRow";
import StarActionButton from "./StarActionButton";

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
  isStarred: (id: string, starred?: string) => boolean;
  toggleStar: (id: string, type: "song", starred: boolean, e: React.MouseEvent) => void;
  isCurrentSong: (id: string) => boolean;
  isPlaying: boolean;
  onPlay: (song: SubsonicSong) => void;
  getCoverArtUrl: (coverArt?: string) => string;
}

function dividerLetter(props: SongCollectionProps, song: SubsonicSong, index: number): string | null {
  const letter = letterOf(song.title);
  return props.letterStarts?.get(letter) === index ? letter : null;
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
        <StarActionButton starred={starred} onClick={(e) => props.toggleStar(song.id, "song", starred, e)} />
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

/** The song list as a table or a grid, with letter headings when sorted by title. */
const SongCollection: React.FC<SongCollectionProps> = (props) => {
  if (props.viewMode === "table") {
    return (
      <MediaTable headers={TABLE_HEADERS}>
        {props.songs.flatMap((song, i) => {
          const letter = dividerLetter(props, song, i);
          const row = songRow(props, song, i);
          if (!letter) return [row];
          return [
            <tr key={`letter-${letter}`} id={letterAnchorId(letter)} className="letter-divider">
              <td colSpan={TABLE_COLUMNS}>{letter}</td>
            </tr>,
            row,
          ];
        })}
      </MediaTable>
    );
  }
  return (
    <div className="album-grid">
      {props.songs.flatMap((song, i) => {
        const letter = dividerLetter(props, song, i);
        const card = songCard(props, song, i);
        if (!letter) return [card];
        return [
          <div key={`letter-${letter}`} id={letterAnchorId(letter)} className="letter-divider letter-divider-grid">
            {letter}
          </div>,
          card,
        ];
      })}
    </div>
  );
};

export default SongCollection;
