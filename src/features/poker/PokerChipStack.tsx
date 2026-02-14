import React, { useMemo } from "react";
import { getChipsForAmount } from "../../utils/chips";
import formatAmount from "../../utils/formatNumber";
interface PokerChipStackProps {
  amount: number;
}

const PokerChipStack: React.FC<PokerChipStackProps> = ({ amount }) => {
  const MAX_CHIPS_PER_STACK = 5;

  const chips = useMemo(() => getChipsForAmount(amount), [amount]);

  return (
    <div className="chip-stacks">
      {chips.map((chip, i) => (
        <div key={i} className="chip-stack">
          {[...Array(Math.min(chip.count, MAX_CHIPS_PER_STACK))].map((_, j) => (
            <img
              key={j}
              src={chip.svg}
              alt="Chip"
              className="chip-svg"
              style={{
                top: `-${j * 3}px`,
                zIndex: j,
              }}
            />
          ))}
        </div>
      ))}
      <span className="poker-chip-amount">{formatAmount(amount)}</span>
    </div>
  );
};

export default React.memo(PokerChipStack);
