import { useLocation } from "react-router";
import { lazy, Suspense } from "react";
import { GlobalWebSocketProvider } from "../../providers/GlobalWebSocketProvider";

import { GameProvider, useGame } from "../../providers/GameProvider";
import LoadingSpinner from "../../components/LoadingSpinner";

const TexasTableGame = lazy(() => import("../../features/poker/texas/texas-table-game"));

function TablePage() {
  const location = useLocation();
  const table = location.state?.table;

  if (!table) return <p>Table data missing. Navigate from homepage.</p>;

  const tableId = table.tableId;

  return (
    <div className="table-page">
      <GlobalWebSocketProvider>
        <GameProvider tableId={tableId}>
          <TableContent />
        </GameProvider>
      </GlobalWebSocketProvider>
    </div>
  );
}

function TableContent() {
  const { isReady, socketReady } = useGame();

  return (
    <>
      {!isReady ? (
        <LoadingSpinner message="" />
      ) : (
        <Suspense fallback={<LoadingSpinner message="" />}>
          <TexasTableGame />
        </Suspense>
      )}

      {!socketReady && (
        <div className="modal-overlay">
          <p className="connection-message">Холболт салсан. Дахин холбогдож байна...</p>
        </div>
      )}
    </>
  );
}

export default TablePage;
