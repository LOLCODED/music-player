import React from "react";
import { LayoutGrid, List } from "lucide-react";
import PageActions from "./PageActions";

export interface SortOption {
  value: string;
  label: string;
}

interface ListPageHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  sortOptions: SortOption[];
  sortType: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "table";
  onToggleView: () => void;
  onRefresh: () => void;
  extra?: React.ReactNode;
  title?: string;
  meta?: string;
}

const ListPageHeader: React.FC<ListPageHeaderProps> = ({
  searchText,
  onSearchChange,
  placeholder,
  sortOptions,
  sortType,
  onSortChange,
  viewMode,
  onToggleView,
  onRefresh,
  extra,
  title,
  meta,
}) => (
  <div className="page-header">
    {title && (
      <div className="page-title-row">
        <h1 className="page-title">{title}</h1>
        {meta && <span className="page-title-meta">{meta}</span>}
      </div>
    )}
    <div className="page-header-controls">
      <input
        type="search"
        className="page-header-search"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <select
        className="page-header-sort"
        value={sortType}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        className="btn-icon"
        onClick={onToggleView}
        title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
        aria-label="Toggle view"
      >
        {viewMode === "grid" ? <List size={16} /> : <LayoutGrid size={16} />}
      </button>
    </div>
    {extra}
    <PageActions onRefresh={onRefresh} />
  </div>
);

export default ListPageHeader;
