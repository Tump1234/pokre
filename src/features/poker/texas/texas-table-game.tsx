import { useEffect, useReducer, useCallback, useMemo, Suspense, lazy, memo, useRef } from "react";
import { useNavigate } from "react-router";
import { useMeQuery } from "../../../api/user";
import { useGame } from "../../../providers/GameProvider";
import { useIsMobile } from "../../../hooks/useIsMobile.tsx";
import DesktopTableActionButtons from "../DesktopTableActionButtons.tsx";
import formatAmount from "../../../utils/formatNumber.ts";
import TexasTablePlayerSeats from "./texas-table-player-seats";
import PotChips from "../PotChips.tsx";
import TexasTableRechargeForm from "./texas-table-recharge-form";
import type { HandHistory } from "../../../api/game.ts";
import { useLocation } from "react-router";

const PokerTableSVG = lazy(() => import("../../../components/PokerTableSVG"));
const PokerTableMobile = lazy(() => import("../../../components/PokerTableSVGMobile"));
const PokerChat = lazy(() => import("../poker-chat"));
const PokerActions = lazy(() => import("../poker-actions"));
const TexasTableCommunityCards = lazy(() => import("./texas-table-community-cards"));

const MemoDesktopTableActions = memo(DesktopTableActionButtons);
const MemoSeats = memo(TexasTablePlayerSeats);
const MemoPotChips = memo(PotChips);
const MemoCommunityCards = memo(TexasTableCommunityCards);
const MemoPokerActions = memo(PokerActions);

type State = {
  toastMsg: string | null;
  showHistory: boolean;
  historyLimit: number;
  handHistory: HandHistory[];
  modalType: string | null;
  selectedSeat: number | null;
  allInPlayers: Record<number, boolean>;
  rechargeAmount: number;
};

const initialState: State = {
  toastMsg: null,
  showHistory: false,
  historyLimit: 10,
  handHistory: [],
  modalType: null,
  selectedSeat: null,
  allInPlayers: {},
  rechargeAmount: 0,
};

type Action =
  | { type: "SET_TOAST"; payload: string | null }
  | { type: "SET_SHOW_HISTORY"; payload: boolean }
  | { type: "SET_HISTORY_LIMIT"; payload: number }
  | { type: "SET_HAND_HISTORY"; payload: HandHistory[] }
  | { type: "SET_MODAL_TYPE"; payload: string | null }
  | { type: "SET_SELECTED_SEAT"; payload: number | null }
  | { type: "SET_ALL_IN_PLAYERS"; payload: Record<number, boolean> }
  | { type: "SET_RECHARGE_AMOUNT"; payload: number }
  | { type: "BATCH_UPDATE"; payload: Partial<State> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TOAST":
      return { ...state, toastMsg: action.payload };
    case "SET_SHOW_HISTORY":
      return { ...state, showHistory: action.payload };
    case "SET_HISTORY_LIMIT":
      return { ...state, historyLimit: action.payload };
    case "SET_HAND_HISTORY":
      return { ...state, handHistory: action.payload };
    case "SET_MODAL_TYPE":
      return { ...state, modalType: action.payload };
    case "SET_SELECTED_SEAT":
      return { ...state, selectedSeat: action.payload };
    case "SET_ALL_IN_PLAYERS":
      return { ...state, allInPlayers: action.payload };
    case "SET_RECHARGE_AMOUNT":
      return { ...state, rechargeAmount: action.payload };
    case "BATCH_UPDATE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

function formatGameVariant(variant?: string) {
  if (!variant) return "";

  const mapping: Record<string, string> = {
    TEXAS: "Холдем хязгааргүй",
    OMAHA: "Пот лимит Омаха ",
  };

  return mapping[variant] || variant;
}

export default function TexasTableGame() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { gameState, chats, ws, socketReady, tableId, destinedCommunityCards, recharge, takeSeat, leaveSeat, sendGameAction, sendChat } = useGame();
  const token = localStorage.getItem("accessToken");
  const { data: userInfo } = useMeQuery(undefined, { skip: !token });
  const location = useLocation();

  const tableFromState = location.state?.table;

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Reset all-in players when game resets
    if (["WAITING_FOR_PLAYERS", "PRE_FLOP", "FINISHED"].includes(gameState.state)) {
      if (Object.keys(state.allInPlayers).length > 0) {
        dispatch({ type: "SET_ALL_IN_PLAYERS", payload: {} });
      }
    }
  }, [gameState.state]); // Removed state.allInPlayers to prevent infinite loop

  useEffect(() => {
    // Set initial recharge amount only once
    if (gameState.minBuyIn && state.rechargeAmount === 0) {
      dispatch({ type: "SET_RECHARGE_AMOUNT", payload: gameState.minBuyIn });
    }
  }, [gameState.minBuyIn]); // Removed state.rechargeAmount to prevent infinite loop

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const userId = userInfo?.userId;
  const seats = gameState.seats || [];
  const currentGameState = gameState.state;
  const maxPlayers = gameState.maxPlayers;
  const currentPotValue = gameState.currentPot;
  const currentBets = gameState.currentBets || {};
  const bigBlind = gameState.bigBlind;
  const currentPlayerSeat = gameState.currentPlayerSeat;
  const turnPlayer = gameState.turnPlayer;
  const isFolded = gameState.isFolded;
  const isAllIn = gameState.isAllIn;
  const isAuto = gameState.isAuto;
  const isAuthenticated = gameState.isAuthenticated;

  const userHasSeat = useMemo(() => !!userId && seats.some((s) => s.user?.userId === userId), [userId, seats]);

  const playerSeat = useMemo(() => (userId ? seats.find((s) => s.user?.userId === userId) : undefined), [userId, seats]);

  const holeCards = useMemo(() => playerSeat?.holeCards || [], [playerSeat?.holeCards]);

  const userSeatIndex = useMemo(() => seats.findIndex((s) => s.user?.userId === userId), [seats, userId]);

  const isHandOver = useMemo(() => ["FINISHED", "WAITING_FOR_PLAYERS"].includes(currentGameState), [currentGameState]);

  const totalBets = useMemo(() => Object.values(currentBets).reduce((a, b) => a + b, 0), [currentBets]);

  const lastPotRef = useRef(0);
  const currentPot = useMemo(() => {
    const calculatedPot = currentPotValue + totalBets;
    if (currentGameState === "WAITING_FOR_PLAYERS") {
      lastPotRef.current = 0;
      return 0;
    }
    if (calculatedPot > 0) {
      lastPotRef.current = calculatedPot;
      return calculatedPot;
    }
    if (calculatedPot === 0 && lastPotRef.current > 0) {
      return lastPotRef.current;
    }

    return calculatedPot;
  }, [currentPotValue, totalBets, currentGameState]);

  const minRaise = useMemo(
    () => Math.max(bigBlind, totalBets - (currentBets[currentPlayerSeat] || 0)),
    [bigBlind, totalBets, currentBets, currentPlayerSeat],
  );

  const displayedSeats = useMemo(
    () => (seats.length ? seats : Array(maxPlayers).fill({ seatIndex: 0, user: null, stack: 0, isActive: false })),
    [seats, maxPlayers],
  );

  const tableSeats = useMemo(() => seats?.filter((s) => s?.user) || [], [seats]);

  const showToast = useCallback((msg: string) => {
    dispatch({ type: "SET_TOAST", payload: msg });
    setTimeout(() => dispatch({ type: "SET_TOAST", payload: null }), 3000);
  }, []);

  const handleSeatClick = useCallback(
    (idx: number | null) => {
      if (!isAuthenticated) return showToast("Холбогдоно уу");
      dispatch({ type: "BATCH_UPDATE", payload: { selectedSeat: idx, modalType: idx !== null ? "TAKE_SEAT" : null } });
    },
    [isAuthenticated, showToast],
  );

  const handleTakeSeat = useCallback(
    (idx: number, amount: number, isBot = false, botName?: string) => {
      takeSeat(idx, amount, isBot, botName);
      dispatch({ type: "BATCH_UPDATE", payload: { modalType: null, selectedSeat: null } });
    },
    [takeSeat],
  );

  const handleRecharge = useCallback(
    (amt: number) => {
      if (!isAuthenticated) return showToast("Холбогдоно уу");
      recharge(amt);
      dispatch({ type: "SET_MODAL_TYPE", payload: null });
    },
    [isAuthenticated, recharge, showToast],
  );

  const handleCloseModal = useCallback(() => {
    dispatch({ type: "BATCH_UPDATE", payload: { modalType: null, selectedSeat: null } });
  }, []);

  const subscribeCallback = useCallback(
    () => ws.current?.send(JSON.stringify({ type: "TABLE", data: { tableId: Number(tableId), action: "RECONNECT" } })),
    [ws, tableId],
  );

  const actionButtonsGameState = useMemo(() => ({ ...gameState, seats: tableSeats }), [gameState, tableSeats]);
  const seatsGameState = useMemo(() => ({ ...gameState, seats: displayedSeats }), [gameState, displayedSeats]);
  const potAmountFormatted = formatAmount(currentPot);
  return (
    <div className="container-vertical">
      {state.toastMsg && <div className="toast">{state.toastMsg}</div>}

      <Suspense fallback={null}>
        <MemoDesktopTableActions
          userHasSeat={userHasSeat}
          setModalType={(v) => dispatch({ type: "SET_MODAL_TYPE", payload: v })}
          navigate={navigate}
          gameState={actionButtonsGameState}
          tableId={tableId}
          leaveSeat={leaveSeat}
          userSeatIndex={userSeatIndex}
          setShowHistory={(v) => dispatch({ type: "SET_SHOW_HISTORY", payload: v })}
        />
      </Suspense>

      <div className="table-container">
        <div className={`custom-login-modal ${state.modalType ? "modal-open" : "modal-hidden"}`} onClick={handleCloseModal}>
          <div className={`modal-content ${state.modalType ? "modal-content-open" : "modal-content-closed"}`} onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{state.modalType === "RECHARGE" ? "Цэнэглэх" : "Ширээнд суух"}</h2>
            </header>
            <TexasTableRechargeForm
              isActuallySeated={userHasSeat}
              modalType={state.modalType || ""}
              gameState={gameState}
              selectedSeat={state.selectedSeat ?? -1}
              takeSeat={handleTakeSeat}
              recharge={handleRecharge}
              setRechargeAmount={(amt) => dispatch({ type: "SET_RECHARGE_AMOUNT", payload: amt })}
              rechargeAmount={state.rechargeAmount}
            />
          </div>
        </div>

        <div className="table-background">
          <div className="image-container">
            <Suspense fallback={null}>{isMobile ? <PokerTableMobile /> : <PokerTableSVG />}</Suspense>

            {/* DISABLED: Causing 193ms lag - Cards now appear instantly */}
            {/* {showPreflopAnimation && dispatch({ type: "SET_HAS_DEALT_PREFLOP", payload: true })} */}
            {/* Original animation code (disabled for performance):
              <CardDealingAnimation
                seatPositions={seatPositions}
                seatStates={displayedSeats}
                cardsPerSeat={cardsPerSeat}
                size={60}
                onAnimationComplete={() => dispatch({ type: "SET_HAS_DEALT_PREFLOP", payload: true })}
              />
            */}

            <MemoSeats
              gameState={seatsGameState}
              userInfo={userInfo}
              seatCount={maxPlayers}
              isHandOver={isHandOver}
              allInPlayers={state.allInPlayers}
              setSelectedSeat={handleSeatClick}
            />
          </div>

          <div className="table-inner-flex">
            <div className="pot-chips-container">
              <span>Бооцоо:</span>
              <span>{potAmountFormatted}</span>
              <MemoPotChips gameState={gameState} />
            </div>
            {gameState.currentPot > 0 && (
              <div className="pot-chips-container-duplicate">
                <span>{potAmountFormatted}</span>
              </div>
            )}

            <Suspense fallback={null}>
              <MemoCommunityCards gameState={gameState} />
            </Suspense>
            <div className="tableDetails-onTable">
              <span className="table-name-details">{tableFromState.tableName} ⭐️</span>
              <span className="table-variant-details">{formatGameVariant(tableFromState.gameVariant)}</span>
              <span className="table-blinds-details">
                Стек: {tableFromState.smallBlind}/{tableFromState.bigBlind}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hand Description now rendered under each player in TablePlayer component */}

      <Suspense fallback={null}>
        <PokerChat
          messages={chats}
          sendChat={sendChat}
          destinedCommunityCards={destinedCommunityCards}
          subscribe={subscribeCallback}
          player={playerSeat}
        />
      </Suspense>

      <Suspense fallback={null}>
        <MemoPokerActions
          stack={playerSeat?.stack || 0}
          player={userInfo ?? null}
          turnPlayer={turnPlayer}
          isFolded={isFolded || currentGameState === "FINISHED"}
          isAllIn={isAllIn}
          currentBet={currentBets[currentPlayerSeat] || 0}
          isAuto={isAuto}
          currentRequiredBet={Math.max(...Object.values(currentBets || {}), 0)}
          currentPot={currentPot}
          minRaise={minRaise}
          sendAction={sendGameAction}
          isHandOver={isHandOver}
          gameState={gameState}
          GamePlayer={playerSeat}
          holeCards={holeCards}
          socketReady={socketReady}
          subscribe={subscribeCallback}
        />
      </Suspense>
    </div>
  );
}
