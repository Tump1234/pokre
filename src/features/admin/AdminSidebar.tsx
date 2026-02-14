import React from "react";
import { useNavigate, useLocation } from "react-router";
import { FiUsers, FiCreditCard, FiX } from "react-icons/fi";
import { HiDownload } from "react-icons/hi";
import { FaArrowUp } from "react-icons/fa6";


interface MenuItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { key: "user", label: "Хэрэглэгч", href: "/admin/user", icon: <FiUsers /> },
    { key: "withdraw", label: "Таталт", href: "/admin/withdraw", icon: <HiDownload /> },
    { key: "deposit", label: "Цэнэглэлт", href: "/admin/deposit", icon: <FaArrowUp /> },
    { key: "table", label: "Ширээ", href: "/admin/table", icon: <FiCreditCard /> },
  ];

  return (
    <aside className={`admin-sider ${collapsed ? "collapsed" : ""}`}>
      {!collapsed && (
        <button className="sider-close-btn" onClick={toggleCollapse}>
          <FiX size={20} />
        </button>
      )}

      <nav>
        <ul className="menu">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <li key={item.key} className={`menu-item ${isActive ? "active" : ""}`}>
                <div
                  className={`menu-label ${isActive ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(item.href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(item.href);
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {!collapsed && item.label}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
