import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, isNavItemActive } from "./navItems";

const TAB_ICON_SIZE = 18;

const TAB_LINK_STYLE: React.CSSProperties = { textDecoration: "none" };

const TabBar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="tab-btn-bar">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`tab-btn ${isNavItemActive(location.pathname, item) ? "active" : ""}`}
          style={TAB_LINK_STYLE}
        >
          <item.Icon size={TAB_ICON_SIZE} />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default TabBar;
