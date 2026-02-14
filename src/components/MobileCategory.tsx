import { memo } from "react";
import { type TableCategory } from "../types/gameTypes";

import home from "../assets/image/icons/bottom-nav-home-icon-active-blue.svg";
import tables from "../assets/image/icons/bottom-nav-tables-icon-blue.svg";
import MyGames from "../assets/image/icons/bottom-nav-chat-icon-blue.svg";
import Navbar from "../assets/image/icons/bottom-nav-menu-icon-blue.svg";
import Cashier from "../assets/image/icons/bottom-nav-cashier-icon-blue.svg";

type Props = {
  category: TableCategory;
  onChange: React.Dispatch<React.SetStateAction<TableCategory>>;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
};

const categories: { key: TableCategory; label: string; icon: string }[] = [
  { key: "Home", label: "Үндсэн дэлгэц", icon: home },
  { key: "Cashier", label: "Мөнгөний Касс", icon: Cashier },
  { key: "Ширээнүүд", label: "Ширээнүүд", icon: tables },
  { key: "Games", label: "Чат", icon: MyGames },
  { key: "Settings", label: "Цэс", icon: Navbar },
];

const MobileCategory = memo(function MobileCategory({ category, onChange, isMenuOpen = false, onToggleMenu }: Props) {
  return (
    <div className="mobile-category">
      {categories.map((c) => {
        const isActive = category === c.key;

        const handleClick = c.key === "Settings" && onToggleMenu ? onToggleMenu : () => onChange(c.key);

        return (
          <button
            key={c.key}
            className={`mobile-category-btn ${isActive ? "active" : ""} ${c.key === "Settings" && isMenuOpen ? "menu-open" : ""}`}
            onClick={handleClick}
          >
            <img src={c.icon} alt={c.label} />
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
});

export default MobileCategory;
