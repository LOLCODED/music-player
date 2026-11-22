import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MoreHorizontal, RefreshCw, Server, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useIsDesktop } from "../hooks/useIsDesktop";
import ActionSheet, { ActionSheetItem, ActionSheetSection } from "./ActionSheet";

export interface SortControl {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface PageActionsProps {
  onRefresh: () => void;
  title?: string;
  sort?: SortControl;
}

function sortSection(sort: SortControl): ActionSheetSection {
  return {
    label: "Sort by",
    items: sort.options.map((option) => ({
      label: option.label,
      selected: option.value === sort.value,
      onSelect: () => sort.onChange(option.value),
    })),
  };
}

const PageActions: React.FC<PageActionsProps> = ({ onRefresh, title = "Library", sort }) => {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (isDesktop) {
    return (
      <button className="btn-icon" onClick={onRefresh} title="Refresh" aria-label="Refresh">
        <RefreshCw size={16} />
      </button>
    );
  }

  const libraryItems: ActionSheetItem[] = [
    { label: "Refresh library", Icon: RefreshCw, onSelect: onRefresh },
    { label: "Connections", Icon: Server, onSelect: () => navigate("/connections") },
    { label: "Settings", Icon: Settings, onSelect: () => navigate("/settings") },
    { label: "Log out", Icon: LogOut, onSelect: logout, danger: true },
  ];
  const sections = [...(sort ? [sortSection(sort)] : []), { label: "Library", items: libraryItems }];

  return (
    <>
      <button className="btn-icon page-actions-more" onClick={() => setOpen(true)} aria-label="Library actions" aria-haspopup="dialog">
        <MoreHorizontal size={22} />
      </button>
      {open && <ActionSheet title={title} sections={sections} onClose={() => setOpen(false)} />}
    </>
  );
};

export default PageActions;
