// ⚡ OPTIMIZED: Removed framer-motion for better performance
import React, { useEffect, useState, useRef } from "react";
import type { GameCard } from "../api/game";
import PokerCard from "../features/poker/poker-card";
import { useIsMobile } from "../hooks/useIsMobile";
import dealCardSound from "../assets/sounds/deal-card4.mp3";
import { Howl } from "howler";

interface SeatState {
  user: any | null;
  isDisconnected?: boolean;
  stack?: number;
}

interface Props {
  seatPositions: { x: number; y: number }[];
  seatStates: SeatState[];
  cardsPerSeat: number;
  size: number;
  onAnimationComplete?: () => void;
}

interface DealingCard {
  seatIndex: number;
  cardIndex: number;
  id: string;
}

const CardDealingAnimation: React.FC<Props> = ({ seatPositions, seatStates, cardsPerSeat, size, onAnimationComplete }) => {
  const [dealingCards, setDealingCards] = useState<DealingCard[]>([]);
  const isMobile = useIsMobile();
  const cardWidth = isMobile ? size * 0.6 : size;
  const cardHeight = cardWidth * 1.4;

  const playedSound = useRef<Set<number>>(new Set());
  const dealSoundRef = useRef<Howl | null>(null);
  const landingOffsetY = isMobile ? -3 : -6;

  useEffect(() => {
    dealSoundRef.current = new Howl({
      src: [dealCardSound],
      volume: 0.3,
      preload: true,
    });

    return () => {
      dealSoundRef.current?.unload();
    };
  }, []);

  const playDealSound = () => {
    dealSoundRef.current?.play();
  };

  useEffect(() => {
    const cards: DealingCard[] = [];

    const activeSeats = seatPositions
      .map((_, seatIndex) => ({ seat: seatStates[seatIndex], seatIndex }))
      .filter(({ seat }) => seat?.user && !seat.isDisconnected && (seat.stack ?? 0) > 0);

    for (let c = 0; c < cardsPerSeat; c++) {
      activeSeats.forEach(({ seatIndex }) => {
        const id = `${seatIndex}-${c}`;
        cards.push({ seatIndex, cardIndex: c, id });
      });
    }

    setDealingCards(cards);
  }, [seatPositions, seatStates, cardsPerSeat]);

  const removeCard = (id: string, index: number) => {
    setDealingCards((prev) => prev.filter((c) => c.id !== id));
    if (index === dealingCards.length - 1 && onAnimationComplete) onAnimationComplete();
  };

  // ⚡ OPTIMIZED: Use CSS animations instead of framer-motion
  useEffect(() => {
    dealingCards.forEach((dc, i) => {
      const timer = setTimeout(() => {
        if (!playedSound.current.has(dc.seatIndex)) {
          playDealSound();
          playedSound.current.add(dc.seatIndex);
        }
        // Auto-remove after animation
        setTimeout(() => removeCard(dc.id, i), 200);
      }, 50);
      return () => clearTimeout(timer);
    });
  }, [dealingCards]);

  return (
    <>
      {dealingCards.map((dc) => {
        const target = seatPositions[dc.seatIndex];

        return (
          <div
            key={dc.id}
            className="dealing-card-animate"
            style={{
              position: "absolute",
              left: `${target.x}%`,
              top: `${target.y + landingOffsetY}%`,
              transform: "translate(-50%, -50%)",
              width: cardWidth,
              height: cardHeight,
              zIndex: 4,
              transition: "all 0.2s linear",
            }}
          >
            <PokerCard info={{ rank: "ACE", suit: "SPADES", secret: true } as GameCard} isFolded={false} />
          </div>
        );
      })}
    </>
  );
};

export default CardDealingAnimation;
