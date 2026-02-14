import type { GamePlayer, GameCard } from "../api/game";

export function mapSeats(tableSeats: Record<string, any>, maxPlayers: number, sessionHoleCards: Record<string, GameCard[]> = {}): GamePlayer[] {
  return Array.from({ length: maxPlayers }, (_, i) => {
    const seatData = tableSeats[i.toString()] || null;
    const rawHoleCards = sessionHoleCards[i.toString()] || [];
    const holeCards = rawHoleCards.map((card) => ({
      ...card,
    }));

    return seatData
      ? {
          user: seatData.user || null,
          seatId: seatData.seatId ?? i,
          stack: seatData.stack || 0,
          holeCards,
          isAllIn: seatData.isAllIn || false,
          isFolded: seatData.isFolded || false,
          winnings: seatData.winnings || 0,
          netResult: seatData.netResult || 0,
          username: seatData.user?.username ?? "Empty",
          isDisconnected: seatData.disconnected || false,
          isTimeoutActed: seatData.timeoutActed || false,
          isSittingOut: seatData.isSittingOut || false,
        }
      : {
          user: null,
          seatId: i,
          stack: 0,
          holeCards,
          isAllIn: false,
          isFolded: false,
          winnings: 0,
          netResult: 0,
          username: "Empty",
          isDisconnected: false,
          isTimeoutActed: false,
          isSittingOut: false,
        };
  });
}
