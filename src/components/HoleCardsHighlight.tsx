// ⚡ OPTIMIZED: Removed motion animation for better performance
import type { GamePlayer, CombinedSplitPot, GameCard } from "../api/game";
import PokerCard from "../features/poker/poker-card";

interface HoleCardsHighlightProps {
  player: GamePlayer | null;
  combinedSplitPot?: CombinedSplitPot;
  isMe?: boolean;
  variant?: string;
  isFolding?: boolean;
}

export default function HoleCardsHighlight({ player, combinedSplitPot, isFolding }: HoleCardsHighlightProps) {
  if (!player || !player.holeCards || player.holeCards.length === 0) {
    return null;
  }
  const winnersData = Object.values(combinedSplitPot?.hands ?? {}).filter((p: any) => p.isWinner);
  const winner = winnersData.find((p: any) => p.user?.username === player.user?.username);
  const isWinner = !!winner;
  const winningCards: GameCard[] = winner?.bestHandCards ?? [];

  const isCardConnected = (card: GameCard): boolean => winningCards.some((wc) => wc.rank === card.rank && wc.suit === card.suit);

  return (
    <div
      className="hole-cards-container"
      style={{
        opacity: winnersData.length > 0 && !isWinner ? 0.6 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      {player.holeCards.map((card, idx) => {
        const isWinningCard = isCardConnected(card);
        const isCardDimmed = winnersData.length > 0 && (!isWinner || (isWinner && !isWinningCard));
        const displayCard = { ...card };
        return (
          <div
            key={idx}
            className={`hole-card-wrapper ${isCardDimmed ? "dimmed-card" : ""} ${isFolding ? "folding" : ""} ${isWinningCard ? "winning-card" : ""}`}
            style={{
              zIndex: idx + 10,
              flex: `1 1 ${100 / player.holeCards.length}%`,
            }}
          >
            <PokerCard info={displayCard} index={idx} />
          </div>
        );
      })}
    </div>
  );
}
