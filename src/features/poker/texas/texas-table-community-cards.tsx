import type { GameState } from "../../../types/gameTypes";
import type { GameCard } from "../../../api/game";
import PokerCard from "../poker-card";
import { useMemo } from "react";

interface TexasTableCommunityCardsProps {
  gameState: GameState;
}

function TexasTableCommunityCards({ gameState }: TexasTableCommunityCardsProps) {
  const hasWinner = useMemo(() => {
    return gameState.combinedSplitPot?.sidePots?.some((sidePot) => sidePot.winners && sidePot.winners.length > 0) ?? false;
  }, [gameState.combinedSplitPot]);

  const winningCommunityCardsSet = useMemo(() => {
    if (!hasWinner || !gameState.combinedSplitPot?.sidePots) return new Set<string>();

    const communityCardsSet = new Set<string>();
    gameState.combinedSplitPot.sidePots.forEach((sidePot) => {
      sidePot.winningCommunityCards?.forEach((card: GameCard) => {
        communityCardsSet.add(`${card.suit}-${card.rank}`);
      });
      sidePot.winners?.forEach((winner: any) => {
        winner.bestHandCards?.forEach((card: GameCard) => {
          communityCardsSet.add(`${card.suit}-${card.rank}`);
        });
      });
    });
    return communityCardsSet;
  }, [gameState.combinedSplitPot, hasWinner]);

  const renderCommunityCard = (communityCard: GameCard | undefined, index: number) => {
    const cardKey = communityCard ? `${communityCard.suit}-${communityCard.rank}` : `empty-${index}`;
    const isWinningCard = communityCard && hasWinner && winningCommunityCardsSet.has(cardKey);
    const revealClass = communityCard ? "reveal" : "";

    return (
      <div key={index} className="community-card-slot">
        {communityCard && (
          <div className={`community-card-wrapper ${isWinningCard ? "winner" : ""} ${hasWinner && !isWinningCard ? "grayscale" : ""} ${revealClass}`}>
            <PokerCard info={communityCard} index={index} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div className="community-card-area">
        {Array.from({ length: 5 }).map((_, index) => renderCommunityCard(gameState.communityCards?.[index], index))}
      </div>
    </div>
  );
}

export default TexasTableCommunityCards;
