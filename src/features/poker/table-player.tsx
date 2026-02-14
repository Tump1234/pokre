import React, { useMemo, memo } from "react";
import type { GameCard, GamePlayer } from "../../api/game";
import type { GameState } from "../../types/gameTypes";
import type { User } from "../../api/user";
import HoleCardsHighlight from "../../components/HoleCardsHighlight";
import WinnerAnimation from "../../components/WinnerAnimation";
import { useIsMobile } from "../../hooks/useIsMobile";
import dealer from "../../assets/chips/D.svg";
import Avatar from "../../assets/image/avatar/6820.png";
import { playActionSound } from "../../utils/sounds";

import { useDesktopSettings } from "../../components/context/DesktopSettingsContext";

interface TablePlayerProps {
  userInfo?: User;
  seatIndex: number;
  player?: GamePlayer;
  isTurn: boolean;
  holeCards: GameCard[];
  gameState: GameState;
  isMe?: boolean;
  lastActionText?: string;
  isHandOver?: boolean;
  communityCards: GameCard[];
  allInPlayers: Record<number, boolean>;
  players: GamePlayer[];
  seatPosition?: { x: number; y: number };
  isFolded?: boolean;
}

const TablePlayer = (props: TablePlayerProps) => {
  const { seatIndex, player, isTurn, lastActionText, gameState, seatPosition, isMe, isFolded, holeCards } = props;
  const isMobile = useIsMobile();
  const [turnKey, setTurnKey] = React.useState(0);
  const formatStack = (num: number) => num.toLocaleString("en-US");

  const { settings } = useDesktopSettings();
  const showStackAsBB = settings["showCashInBB"] ?? false;
  const stackDisplay = showStackAsBB ? ((player?.stack ?? 0) / (gameState.tablestate?.bigBlind ?? 1)).toFixed(2) : formatStack(player?.stack ?? 0);

  const handData = useMemo(() => gameState.combinedSplitPot?.hands?.[seatIndex], [gameState.combinedSplitPot, seatIndex]);
  const isWinner = handData?.isWinner ?? false;
  const winningAmount = handData?.winnings ?? 0;

  const variant = gameState.tablestate?.gameVariant ?? "TEXAS";

  const winnerAnimationMemo = useMemo(
    () => (isWinner && winningAmount > 0 ? <WinnerAnimation winningAmount={winningAmount} formatStack={formatStack} /> : null),
    [isWinner, winningAmount],
  );

  const isShowingStack = !isFolded && !player?.isAllIn && !((player?.stack ?? 0) === 0 && gameState.state === "WAITING_FOR_PLAYERS");

  React.useEffect(() => {
    if (isTurn) {
      setTurnKey((k) => k + 1);
    }
  }, [isTurn, gameState.state]);

  const lastActionRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (!lastActionText) return;

    if (lastActionRef.current === lastActionText) return;

    playActionSound(lastActionText);
    lastActionRef.current = lastActionText;
  }, [lastActionText]);

  const holeCardsHighlightMemo = useMemo(() => {
    if (!player || !seatPosition) return null;
    if (gameState.state === "WAITING_FOR_PLAYERS") return null;
    if (variant === "OMAHA" && holeCards.length !== 4) return null;
    if (player.isFolded) return null;
    const shouldAnimatePreflop = gameState.state === "PRE_FLOP";
    const isReveal = lastActionText?.includes("Reveal");

    return (
      <div
        className={`holecards-highlight-wrapper 
          ${shouldAnimatePreflop ? "slide-up" : ""} 
          ${isReveal ? "reveal" : ""} 
          ${isFolded ? "folded" : ""}  
          ${isMobile ? "mobile" : ""}`}
      >
        <HoleCardsHighlight
          player={player}
          combinedSplitPot={gameState.combinedSplitPot}
          isMe={isMe}
          variant={variant}
          isFolding={lastActionText?.includes("Fold")}
        />
      </div>
    );
  }, [player, seatPosition, isFolded, gameState.state, holeCards, variant, isMobile, isMe, gameState.combinedSplitPot, lastActionText]);

  return (
    <div className={`player-container-wrapper ${isWinner ? "winner" : ""}`}>
      <div className="player-avatar-wrapper">
        <div className="avatar-content">
          <img src={Avatar} alt="avatar" loading="lazy" />
        </div>
        {winnerAnimationMemo}
      </div>

      {holeCardsHighlightMemo}

      <div
        key={turnKey}
        className={`stack-box ${
          isTurn && !["WAITING_FOR_PLAYERS", "SHOWDOWN", "FINISHED"].includes(gameState.state) && !gameState.isAuto ? "turn-active" : ""
        }`}
      >
        {gameState.dealerSeatIndex === seatIndex && (
          <div className="seat-number dealer-seat">
            <img src={dealer} alt="" />
          </div>
        )}

        <div className="player-info-wrapper">
          <span className="user-name">{player?.user?.username}</span>
          <div className="divider"></div>
          <span className={`player-status ${isShowingStack ? "" : player?.isFolded ? "Хаясан" : player?.isAllIn ? "Бүгдийг нь" : "Хасагдсан"}`}>
            {isShowingStack ? stackDisplay : player?.isFolded ? "Хаясан" : player?.isAllIn ? "Бүгдийг нь" : "Мөнгөгүй"}
            {isShowingStack && <span className="currency">{showStackAsBB ? "BB" : ""}</span>}
          </span>
        </div>

        {lastActionText && (
          <div
            key={`action-${seatIndex}-${lastActionText}`}
            className={`action-label ${getActionClass(lastActionText)} ${isMobile ? "mobile" : ""}`}
            style={{ opacity: 1, willChange: "transform, opacity" }}
          >
            <span>{formatActionTextMn(lastActionText)}</span>
          </div>
        )}

        {!lastActionText && (
          <div className="action-label blind-label">
            <span>{getSeatLabel(seatIndex, gameState)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

function areEqualTablePlayer(prev: TablePlayerProps, next: TablePlayerProps) {
  const holeCardsEqual = prev.holeCards.length === next.holeCards.length && prev.holeCards.every((card, i) => card === next.holeCards[i]);

  return (
    prev.player === next.player &&
    prev.isTurn === next.isTurn &&
    holeCardsEqual &&
    prev.isFolded === next.isFolded &&
    prev.lastActionText === next.lastActionText &&
    prev.seatPosition?.x === next.seatPosition?.x &&
    prev.seatPosition?.y === next.seatPosition?.y
  );
}

function getActionClass(text?: string) {
  if (!text) return "";
  if (text.includes("Fold")) return "action-fold";
  if (text.includes("Raise")) return "action-raise";
  if (text.includes("Call")) return "action-call";
  if (text.includes("Check")) return "action-check";
  if (text.includes("All-in")) return "action-all-in";
  if (text.includes("Reveal")) return "action-reveal";
  return "";
}

export default memo(TablePlayer, areEqualTablePlayer);

function formatActionTextMn(text?: string): string {
  if (!text) return "";

  if (text.includes("Fold")) return "Хаях";
  if (text.includes("Check")) return "Эндээ";
  if (text.includes("Call")) return "Дагах";
  if (text.includes("Raise")) return "Өсгөх";
  if (text.includes("All-in")) return "Бүгдийг нь";
  if (text.includes("Reveal")) return "Хөзөр дэлгэх";
  return text;
}

function getSeatLabel(seatIndex: number, gameState: GameState, lastActionText?: string): string {
  if (lastActionText) return "";

  if (seatIndex === gameState.smallBlindSeatIndex) return "SB";
  if (seatIndex === gameState.bigBlindSeatIndex) return "BB";
  return "";
}
