import React from "react";
import { Check, type LucideIcon } from "lucide-react";
import Modal from "./Modal";

export interface ActionSheetItem {
  label: string;
  Icon?: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
  selected?: boolean;
}

export interface ActionSheetSection {
  label?: string;
  items: ActionSheetItem[];
}

interface ActionSheetProps {
  title: string;
  sections: ActionSheetSection[];
  onClose: () => void;
}

const ActionSheetRow: React.FC<{ item: ActionSheetItem; onClose: () => void }> = ({ item, onClose }) => {
  const { label, Icon, onSelect, danger, selected } = item;
  return (
    <button
      className={`action-sheet-item${danger ? " danger" : ""}${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      onClick={() => {
        onClose();
        onSelect();
      }}
    >
      {Icon && <Icon size={18} aria-hidden="true" />}
      <span className="action-sheet-label">{label}</span>
      {selected && <Check size={18} aria-hidden="true" />}
    </button>
  );
};

const ActionSheet: React.FC<ActionSheetProps> = ({ title, sections, onClose }) => (
  <Modal title={title} onClose={onClose} className="action-sheet">
    {sections.map((section, i) => (
      <div key={section.label ?? i} className="action-sheet-list" role="group" aria-label={section.label}>
        {section.label && <div className="action-sheet-heading">{section.label}</div>}
        {section.items.map((item) => (
          <ActionSheetRow key={item.label} item={item} onClose={onClose} />
        ))}
      </div>
    ))}
    <button className="action-sheet-done" onClick={onClose}>
      Done
    </button>
  </Modal>
);

export default ActionSheet;
