import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { CONNECTIONS_ITEM, NAV_ITEMS, SETTINGS_ITEM, isNavItemActive, type NavItem } from "./navItems";

const SIDEBAR_ICON_SIZE = 16;

const FOOTER_LINK_STYLE: React.CSSProperties = { marginTop: "auto" };

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const renderLink = (item: NavItem, style?: React.CSSProperties) => (
    <Link
      key={item.to}
      to={item.to}
      className={`sidebar-nav-link ${isNavItemActive(location.pathname, item) ? "active" : ""}`}
      style={style}
    >
      <item.Icon size={SIDEBAR_ICON_SIZE} />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div className="sidebar">
      {NAV_ITEMS.map((item) => renderLink(item))}
      {renderLink(CONNECTIONS_ITEM, FOOTER_LINK_STYLE)}
      {renderLink(SETTINGS_ITEM)}
      <button onClick={logout} className="sidebar-nav-link sidebar-logout">
        <LogOut size={SIDEBAR_ICON_SIZE} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
