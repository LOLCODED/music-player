import React from "react";
import type { LucideIcon } from "lucide-react";
import Modal from "./Modal";

export interface ActionSheetItem {
  label: string;
  Icon: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
}

interface ActionSheetProps {
  title: string;
  items: ActionSheetItem[];
  onClose: () => void;
}

/** A list of actions in a bottom sheet on phones (a small dialog elsewhere). */
const ActionSheet: React.FC<ActionSheetProps> = ({ title, items, onClose }) => (
  <Modal title={title} onClose={onClose} className="action-sheet">
    <div className="action-sheet-list">
      {items.map(({ label, Icon, onSelect, danger }) => (
        <button
          key={label}
          className={`action-sheet-item${danger ? " danger" : ""}`}
          onClick={() => {
            onClose();
            onSelect();
          }}
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
    <button className="action-sheet-done" onClick={onClose}>
      Done
    </button>
  </Modal>
);

export default ActionSheet;
