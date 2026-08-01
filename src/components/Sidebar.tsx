import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { NAV_ITEMS, SETTINGS_ITEM, isNavItemActive, type NavItem } from "./navItems";

const SIDEBAR_ICON_SIZE = 16;

const SETTINGS_LINK_STYLE: React.CSSProperties = { marginTop: "auto" };
const LOGOUT_BUTTON_STYLE: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
};

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
      {renderLink(SETTINGS_ITEM, SETTINGS_LINK_STYLE)}
      <button onClick={logout} className="sidebar-nav-link" style={LOGOUT_BUTTON_STYLE}>
        <LogOut size={SIDEBAR_ICON_SIZE} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
