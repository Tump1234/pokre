import React, { useMemo, memo } from "react";
import TableGamePreview from "../../components/TableGamePreview";
import { useNavigate } from "react-router";
import type { GameTable } from "../../api/admin";

interface TablePreviewProps {
  table: GameTable;
  onClose: () => void;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
}

const TablePreview: React.FC<TablePreviewProps> = memo(({ table, isAuthenticated, onRequireLogin }) => {
  const navigate = useNavigate();

  const seatsArray = useMemo(() => {
    if (!table) return [];
    return Array.from({ length: table.maxPlayers }).map((_, i) => table.seats?.[i] || null);
  }, [table?.seats, table?.maxPlayers]);

  const tableName = table?.tableName || "";

  const handleJoin = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    navigate(`/table/${table.secureId}`, { state: { table } });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="table-preview-wrapper">
      <div className="table-preview-content">
        <div className="table-preview-details">
          <header>
            {tableName} #{table.tableId}
          </header>

          <div className="details-in-table">
            <div className="player-row header">
              <span className="player-name">Тоглогч</span>
              <span className="player-cash">Мөнгөн дүн</span>
            </div>

            {seatsArray.map((seat, index) => {
              if (!seat?.user) return null;

              const balance = seat.stack ?? 0;
              const isInactive = seat.isFolded || seat.isDisconnected;

              return (
                <div key={index} className={`player-row ${isInactive ? "inactive" : ""}`}>
                  <span className="player-name">{seat.user.username}</span>
                  <span className="player-cash">{balance.toLocaleString("mn-MN")}</span>
                </div>
              );
            })}
          </div>
          <div className="table-image-container">
            <TableGamePreview table={table} className="poker-table-preview" />
          </div>
        </div>

        <div className="preview-buttons">
          <div
            className="join-btn"
            onClick={() => {
              toggleFullscreen();
              handleJoin();
            }}
          >
            <div className="gradient-bg">
              <span>Ширээ</span>
            </div>
          </div>
          <div className="close-btn">
            <div className="gradient-bg">
              <span>Хүлээлгийн жагсаалт</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TablePreview;
