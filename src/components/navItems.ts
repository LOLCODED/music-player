import { Disc3, Heart, ListMusic, Music, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
  // Detail routes (e.g. /album/:id) that should keep this item highlighted.
  activePrefix?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/songs", label: "Songs", Icon: Music },
  { to: "/albums", label: "Albums", Icon: Disc3, activePrefix: "/album/" },
  { to: "/playlists", label: "Playlists", Icon: ListMusic, activePrefix: "/playlist/" },
  { to: "/favorites", label: "Favorites", Icon: Heart },
];

export const SETTINGS_ITEM: NavItem = { to: "/settings", label: "Settings", Icon: Settings };

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  return (
    pathname === item.to ||
    (item.activePrefix !== undefined && pathname.startsWith(item.activePrefix))
  );
}
