import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { useFetchTablesQuery } from "../../api/user";
import type { GameTable } from "../../api/admin";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useNavigate } from "react-router";

interface TableListProps {
  isAuthenticated: boolean;
  showLoginModal?: () => void;
  onTableClick?: (table: GameTable) => void;
  onTablesLoaded?: (tables: GameTable[]) => void;
  mobileView?: boolean;
  refetch?: () => void;
}

interface TableCardProps {
  record: GameTable;
  activePlayers: number;
  variantLabel: string;
  mobileView: boolean;
  onClick: () => void;
}

const MobileTableCard = memo<TableCardProps>(({ record, activePlayers, variantLabel, onClick }) => {
  const buyinRange = `${record.smallBlind.toLocaleString("en-US")}/${record.bigBlind.toLocaleString("en-US")}`;
  const variantClass = record.gameVariant?.toLowerCase();
  return (
    <div className={`table-card ${variantClass}`} onClick={onClick}>
      <div className="table-info">
        <div className="table-name">{record.tableName || `Table ${record.tableId}`}</div>
        <div className="variant">{variantLabel}</div>
        <div className="players-num">
          {activePlayers}/{record.maxPlayers}
        </div>
        <div className="buyin-range">{buyinRange}</div>
      </div>
    </div>
  );
});

const DesktopTableCard = memo<TableCardProps>(({ record, activePlayers, variantLabel, onClick }) => {
  const buyinRange = `${record.minBuyIn.toLocaleString("en-US")} / ${record.maxBuyIn.toLocaleString("en-US")}`;
  const stake = `${record.smallBlind.toLocaleString("en-US")} / ${record.bigBlind.toLocaleString("en-US")}`;
  const variantClass = record.gameVariant?.toLowerCase();
  const seatStacks = Object.values(record.seats || {}).map((seat) => seat?.stack || 0);
  const avgPot = seatStacks.length ? Math.floor(seatStacks.reduce((a, b) => a + b, 0) / seatStacks.length) : 0;

  return (
    <div className={`table-card ${variantClass}`} onClick={onClick}>
      <div className="table-info">
        <span className="table-name">{record.tableName || `Table ${record.tableId}`}</span>
        <span className="variant">{variantLabel}</span>
        <span className="stake">{stake}</span>
        <span className="jackpot">
          <div className="seat-count">{record.maxPlayers}</div>
          <div className="jackpot-icon"></div>
          <div className="jackpot-icon-outlined"></div>
        </span>
        <span className="avg-pot"> {avgPot.toLocaleString("en-US")}</span>

        <span className="players-num">
          {activePlayers}/{record.maxPlayers}
        </span>

        <div className="buyin-range">
          <div className="btn-buyin">{buyinRange}</div>
        </div>
      </div>
    </div>
  );
});

const TableList = memo(function TableList({
  isAuthenticated,
  showLoginModal,
  onTableClick,
  onTablesLoaded,
  mobileView = false,
  refetch,
}: TableListProps) {
  const { data: tableData } = useFetchTablesQuery(undefined, { skip: false });
  const [search, setSearch] = useState("");
  const [showEmpty, setShowEmpty] = useState(true);
  const [showFull, setShowFull] = useState(true);
  const [seatFilter, setSeatFilter] = useState<"all" | 6 | 8>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState<"all" | "texas" | "omaha">("all");
  const [subCategory, setSubCategory] = useState<string>("all");

  const subCategoryMap: Record<string, string[]> = {
    all: ["Аль ч", "Тогтсон", "Пот лимит", "Хязгааргүй"],
    texas: ["Аль ч", "Тогтсон", "Пот лимит", "Хязгааргүй"],
    omaha: ["Аль ч", "Омаха", "6 хөзөрт Омаха"],
  };

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const filteredAndSortedTables = useMemo(() => {
    if (!tableData) return [];

    const countActive = (table: GameTable) => Object.values(table.seats || {}).filter((p) => p && !p.isFolded && !p.isDisconnected).length;

    return tableData
      .filter((table) => {
        const variant = table.gameVariant?.toLowerCase() || "";
        const tableType = (table.gameVariant || "all").toLowerCase();

        if (search && !table.tableName?.toLowerCase().includes(search.toLowerCase())) return false;

        const activePlayers = Object.keys(table.seats || {}).length;

        if (!showEmpty && activePlayers === 0) return false;
        if (!showFull && activePlayers >= table.maxPlayers) return false;

        if (seatFilter !== "all" && table.maxPlayers !== seatFilter) return false;

        if (mainCategory !== "all" && mainCategory !== variant) return false;

        const subCategoryValueMap: Record<string, string | null> = {
          "Аль ч": null,
          Тогтсон: "fixed",
          "Пот лимит": "omaha",
          Хязгааргүй: "texas",
          Омаха: "omaha",
          "6 хөзөрт Омаха": "6",
        };

        if (subCategory !== "all") {
          const filterValue = subCategoryValueMap[subCategory];
          if (filterValue && !tableType.includes(filterValue)) return false;
        }

        return true;
      })
      .slice()
      .sort((a, b) => {
        const activeA = countActive(a);
        const activeB = countActive(b);
        if (activeA !== activeB) return activeB - activeA;
        return a.bigBlind - b.bigBlind;
      });
  }, [tableData, search, showEmpty, showFull, seatFilter, mainCategory, subCategory]);

  const handleTableClick = useCallback(
    (record: GameTable) => {
      if (!isAuthenticated) {
        showLoginModal?.();
        return;
      }
      if (isMobile) {
        navigate(`/table/${record.secureId}`, { state: { table: record } });
        return;
      }
      onTableClick?.(record);
    },
    [isAuthenticated, showLoginModal, onTableClick, isMobile],
  );

  useEffect(() => {
    if (tableData?.length) {
      onTablesLoaded?.(tableData);
    }
  }, [tableData, onTablesLoaded]);
  const mainCategoryLabels: Record<string, string> = {
    all: "БҮГД",
    texas: "ХОЛДЭМ",
    omaha: "ОМАХА",
  };

  return (
    <div className="table-list-container">
      <div className="main-categories">
        {(["all", "texas", "omaha"] as const).map((cat) => (
          <button
            key={cat}
            className={`table-category-btn ${mainCategory === cat ? "active" : ""}`}
            onClick={() => {
              setMainCategory(cat as any);
              setSubCategory("all");
            }}
          >
            {mainCategoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="sub-categories">
        {subCategoryMap[mainCategory].map((sub) => (
          <button key={sub} className={`table-category-btn ${subCategory === sub ? "active" : ""}`} onClick={() => setSubCategory(sub)}>
            {sub.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={`table-list-header ${mobileView ? "mobile" : "desktop"}`}>
        {mobileView ? (
          <>
            <span className="table-count">Нийт ширээ: {filteredAndSortedTables.length}</span>
            <div className="reload-table-mobile" onClick={refetch} />
          </>
        ) : (
          <>
            <span className="th-variant">Ширээний нэр</span>
            <span className="th-table">Тоглоом</span>
            <span className="th-players">Стек</span>
            <span className="th-buyin">Төрөл</span>
            <span className="th-buyin">Дундаж Пот</span>
            <span className="th-buyin">Тоглогчид</span>
            <span className="th-buyin">Мин/Макс</span>
          </>
        )}
      </div>

      <div className="table-card-container">
        {filteredAndSortedTables.map((record) => {
          const activePlayers = Object.keys(record.seats || {}).length;
          const variantMap: Record<string, string> = {
            texas: "Хязгааргүй Холдем",
            omaha: "Пот лимит Омаха",
          };
          const variantLabel = variantMap[record.gameVariant?.toLowerCase() ?? ""] ?? "Unknown";

          return mobileView ? (
            <MobileTableCard
              key={record.tableId}
              record={record}
              activePlayers={activePlayers}
              variantLabel={variantLabel}
              mobileView={mobileView}
              onClick={() => handleTableClick(record)}
            />
          ) : (
            <DesktopTableCard
              key={record.tableId}
              record={record}
              activePlayers={activePlayers}
              variantLabel={variantLabel}
              mobileView={mobileView}
              onClick={() => handleTableClick(record)}
            />
          );
        })}
      </div>

      <div className="table-filters">
        <input type="text" className="table-search" placeholder="Ширээ хайх..." value={search} onChange={(e) => setSearch(e.target.value)} />

        <div className="seat-filter">
          <div className={`custom-dropdown ${dropdownOpen ? "open active" : ""}`} onClick={() => setDropdownOpen((v) => !v)}>
            <span>{seatFilter === "all" ? "Бүгд" : seatFilter}</span>
            <div className={`dropdown-options ${dropdownOpen ? "open" : ""}`}>
              <div
                className="option"
                onClick={() => {
                  setSeatFilter("all");
                  setDropdownOpen(false);
                }}
              >
                Бүгд
              </div>
              <div
                className="option"
                onClick={() => {
                  setSeatFilter(6);
                  setDropdownOpen(false);
                }}
              >
                6 суудал
              </div>
              <div
                className="option"
                onClick={() => {
                  setSeatFilter(8);
                  setDropdownOpen(false);
                }}
              >
                8 суудал
              </div>
            </div>
          </div>
        </div>
        <div className="table-toggles">
          <div className="toggle-item">
            <span>Хоосон</span>
            <label className="switch">
              <input type="checkbox" checked={showEmpty} onChange={() => setShowEmpty((v) => !v)} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <span>Дүүрэн</span>
            <label className="switch">
              <input type="checkbox" checked={showFull} onChange={() => setShowFull((v) => !v)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="reload-table" onClick={refetch} />
      </div>
    </div>
  );
});

export default TableList;
