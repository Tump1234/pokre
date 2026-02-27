import React, { useMemo, useCallback, useEffect, useRef, useState, Suspense } from "react";
import type { User } from "../../../api/user";
import type { GameState } from "../../../types/gameTypes";
import TablePlayer from "../table-player";
import PokerChip from "../PokerChipStack";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { getSeatLayouts, getChipOffsets } from "../../../utils/seatOffsets";
import HandDescription from "../../../components/HandDescription";

interface Props {
  gameState: GameState;
  userInfo: User | undefined;
  setSelectedSeat: (seatIndex: number | null) => void;
  seatCount: number;
  isHandOver: boolean;
  allInPlayers: Record<number, boolean>;
}

const TexasTablePlayerSeats: React.FC<Props> = ({ gameState, userInfo, seatCount, setSelectedSeat, isHandOver, allInPlayers }) => {
  const myUserId = userInfo?.userId;
  const mySeatIndex = useMemo(() => gameState.seats.findIndex((seat) => seat.user?.userId === myUserId), [gameState.seats, myUserId]);
  const hasTakenSeat = mySeatIndex !== -1;
  const isMobile = useIsMobile();

  const positions = getSeatLayouts(seatCount);
  const chipOffsets = getChipOffsets(seatCount);

  const [collectingChips, setCollectingChips] = useState<Record<number, boolean>>({});
  const previousStateRef = useRef(gameState.state);
  const previousBetsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const currentState = gameState.state;
    const previousState = previousStateRef.current;
    const currentBets = gameState.currentBets || {};
    const previousBets = previousBetsRef.current;

    const stateTransitions = [
      { from: "PRE_FLOP", to: "FLOP" },
      { from: "FLOP", to: "TURN" },
      { from: "TURN", to: "RIVER" },
      { from: "RIVER", to: "SHOWDOWN" },
      { from: "RIVER", to: "FINISHED" },
    ];

    const isRoundEnd = stateTransitions.some((t) => previousState === t.from && currentState === t.to);

    const hadBets = Object.values(previousBets).some((b) => b > 0);
    const currentBetsSum = Object.values(currentBets).reduce((sum, v) => sum + v, 0);
    const noBetsNow = currentBetsSum === 0;
    const betsCollected = hadBets && noBetsNow;

    if (isRoundEnd || betsCollected) {
      const collecting: Record<number, boolean> = {};
      Object.keys(previousBets).forEach((seatStr) => {
        const seat = parseInt(seatStr);
        if (previousBets[seat] > 0) {
          collecting[seat] = true;
        }
      });
      setCollectingChips(collecting);

      setTimeout(() => {
        setCollectingChips({});
      }, 600);
    }

    previousStateRef.current = currentState;
    previousBetsRef.current = { ...currentBets };
  }, [gameState.state, gameState.currentBets]);

  const handleSelectSeat = useCallback(
    (ind: number, disable: boolean) => {
      if (!disable) {
        setSelectedSeat(ind);
      }
    },
    [setSelectedSeat],
  );

  return (
    <div className={`player-seats-container ${isMobile ? "mobile" : ""}`}>
      {gameState.seats.map((seat, ind) => {
        const pos = positions[ind % positions.length];
        const isTaken = !!seat.user;
        const isMySeat = mySeatIndex === ind;
        const disableSeat = !isTaken && hasTakenSeat && !isMySeat;
        const playerBet = gameState.currentBets[ind] || 0;
        const isFolded = seat.isFolded === true;
        const isDisconnected = seat.isDisconnected === true;
        const isTimeoutActed = seat.isTimeoutActed === true;
        const hideHandDesc = isFolded || isDisconnected || isTimeoutActed;

        return (
          <div key={ind}>
            {isTaken ? (
              <>
                <div
                  className={`seat-taken ${isFolded ? "folded" : ""}`}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    opacity: isFolded || isDisconnected || isTimeoutActed ? 0.5 : 1,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <TablePlayer
                    key={seat.user?.userId}
                    userInfo={userInfo}
                    seatIndex={ind}
                    player={seat}
                    isMe={isMySeat}
                    isTurn={ind === gameState.currentPlayerSeat && !isFolded}
                    holeCards={seat?.holeCards || []}
                    gameState={gameState}
                    lastActionText={seat?.lastActionText}
                    isHandOver={isHandOver}
                    communityCards={gameState.communityCards || []}
                    allInPlayers={allInPlayers}
                    players={gameState.seats}
                    seatPosition={{
                      x: pos.x,
                      y: pos.y,
                    }}
                    isFolded={isFolded}
                  />

                  {isTaken && seat.user && !hideHandDesc && gameState.state !== "WAITING_FOR_PLAYERS" && (
                    <Suspense fallback={null}>
                      <HandDescription
                        player={seat}
                        seatIndex={ind}
                        communityCards={gameState.communityCards || []}
                        gameState={gameState}
                        isMe={mySeatIndex === ind}
                      />
                    </Suspense>
                  )}
                </div>

                {playerBet > 0 && (
                  <div
                    className={collectingChips[ind] ? "player-bet-collecting" : ""}
                    style={{
                      position: "absolute",
                      left: `${pos.x + (chipOffsets[ind]?.x || 0)}%`,
                      top: `${pos.y + (chipOffsets[ind]?.y || 0)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <PokerChip amount={playerBet} />
                  </div>
                )}
              </>
            ) : (
              <div
                className={`seat seat-available ${disableSeat ? "seat-disabled" : ""}`}
                onClick={() => handleSelectSeat(ind, disableSeat)}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  cursor: disableSeat ? "not-allowed" : "pointer",
                  opacity: disableSeat ? 0.5 : 1,
                }}
                title="Take a seat"
              >
                <div className={`seat-icon ${disableSeat ? "disabled" : ""}`}>СУУХ</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(TexasTablePlayerSeats);
