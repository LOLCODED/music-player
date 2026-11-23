import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";

export type CarPlaySection = "playlists" | "recent" | "newest";
export type CarPlayItemKind = "playlist" | "album";

export interface CarPlayItem {
  id: string;
  kind: CarPlayItemKind;
  title: string;
  subtitle?: string;
  artworkUrl?: string;
}

export interface CarPlayListRequest {
  requestId: string;
  section: CarPlaySection;
}

export interface CarPlaySelection {
  kind: CarPlayItemKind;
  id: string;
}

export interface CarPlayPlugin {
  // Signals that list requests can be answered, and that CarPlay should reload what it shows.
  ready(): Promise<void>;
  resolveList(options: {
    requestId: string;
    items: CarPlayItem[];
    emptyMessage?: string;
  }): Promise<void>;
  addListener(
    event: "listRequested",
    handler: (request: CarPlayListRequest) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    event: "itemSelected",
    handler: (selection: CarPlaySelection) => void
  ): Promise<PluginListenerHandle>;
}

export const CarPlay = registerPlugin<CarPlayPlugin>("CarPlay");
