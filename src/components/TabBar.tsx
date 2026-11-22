import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, isNavItemActive } from "./navItems";
import { trackNumber } from "../utils/trackNumber";

const TAB_ICON_SIZE = 20;
const TAB_STATE = { tab: true };

const TabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="tab-btn-bar" aria-label="Library">
      {NAV_ITEMS.map((item, i) => {
        const active = isNavItemActive(location.pathname, item);
        return (
          <Link
            key={item.to}
            to={item.to}
            state={TAB_STATE}
            className={`tab-btn${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <item.Icon size={TAB_ICON_SIZE} aria-hidden="true" />
            <span className="tab-btn-num" aria-hidden="true">{trackNumber(i)}</span>
            <span className="tab-btn-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default TabBar;
