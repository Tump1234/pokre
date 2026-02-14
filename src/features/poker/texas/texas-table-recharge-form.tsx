import type { GameState } from "../../../types/gameTypes";
import { useState, useEffect } from "react";
import { useMeQuery } from "../../../api/user";

function TexasTableRechargeForm({
  recharge,
  takeSeat,
  gameState,
  modalType,
  selectedSeat,
  rechargeAmount = gameState.minBuyIn,
  setRechargeAmount,
  isActuallySeated,
}: {
  recharge: (amount: number) => void;
  takeSeat: (seatIndex: number, amount: number, isBot?: boolean, botName?: string) => void;
  gameState: GameState;
  modalType: string;
  selectedSeat: number;
  rechargeAmount: number;
  setRechargeAmount: (value: number) => void;
  isActuallySeated: boolean;
  open?: boolean;
}) {
  const [role, setRole] = useState<"PLAYER" | "BOT">("PLAYER");
  const [botName, setBotName] = useState("");

  const finalModalType = modalType === "RECHARGE" || isActuallySeated ? "RECHARGE" : "SIT";
  const [amountStr, setAmountStr] = useState(rechargeAmount.toString());
  const parsedAmount = parseInt(amountStr || "0", 10);
  const isRechargeTooLow = parsedAmount < gameState.minBuyIn;

  const isDisabled = (finalModalType === "RECHARGE" && !isActuallySeated && gameState.seats.length === 0) || isRechargeTooLow;

  const token = localStorage.getItem("accessToken");
  const { data: me } = useMeQuery(undefined, { skip: !token });
  const isAdmin = me?.role === "ADMIN" || me?.role === "SUPER_ADMIN";

  useEffect(() => {
    setAmountStr(rechargeAmount.toString());
  }, [rechargeAmount]);

  return (
    <form
      className="recharge-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (finalModalType === "RECHARGE") {
          recharge(rechargeAmount);
        } else {
          const chosenSeat = selectedSeat > 0 ? selectedSeat : 0;
          const isBot = role === "BOT";
          takeSeat(chosenSeat, rechargeAmount, isBot, isBot ? botName : undefined);
        }
      }}
    >
      {modalType === "TAKE_SEAT" && isAdmin && (
        <div className="role-toggle">
          <label className="switch">
            <input type="checkbox" checked={role === "BOT"} onChange={() => setRole(role === "BOT" ? "PLAYER" : "BOT")} />
            <span className="slider round"></span>
          </label>
          <span className="role-label">{role}</span>

          {role === "BOT" && (
            <input
              type="text"
              placeholder="Enter Name"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="bot-name-input"
              required
            />
          )}
        </div>
      )}

      {/* Balance Display */}
      <div className="recharge-balance-display">
        <div className="balance-item">
          <span className="balance-label">Үлдэгдэл</span>
          <span className="balance-value">{gameState.usableBalance.toLocaleString("en-US")}</span>
        </div>
        <div className="balance-item">
          <span className="balance-label">Ул</span>
          <span className="balance-value">
            {gameState.smallBlind}/{gameState.bigBlind}
          </span>
        </div>
      </div>

      {/* Amount Slider */}
      <div className="recharge-slider-container">
        <div className="slider-labels-horizontal">
          <span>{gameState.minBuyIn.toLocaleString("en-US")}</span>
          <span>{gameState.maxBuyIn.toLocaleString("en-US")}</span>
        </div>
        <input
          type="range"
          className="recharge-amount-slider"
          min={gameState.minBuyIn}
          max={Math.min(gameState.maxBuyIn, gameState.usableBalance)}
          step={gameState.bigBlind}
          value={rechargeAmount}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            setRechargeAmount(value);
            setAmountStr(value.toString());
          }}
        />
      </div>

      {/* Amount Input */}
      <div className="recharge-amount-input-wrapper">
        <label className="input-label">Мөнгөн дүн</label>
        <input
          type="number"
          className="recharge-amount-input no-spin"
          min={gameState.minBuyIn}
          max={Math.min(gameState.maxBuyIn, gameState.usableBalance)}
          value={amountStr}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setAmountStr("");
              return;
            }
            let parsed = parseInt(val, 10);
            if (parsed < 0) parsed = 0;
            if (parsed > Math.min(gameState.maxBuyIn, gameState.usableBalance)) parsed = Math.min(gameState.maxBuyIn, gameState.usableBalance);
            setAmountStr(parsed.toString());
          }}
          onBlur={() => {
            const parsed = parseInt(amountStr, 10);
            const safeValue = isNaN(parsed)
              ? gameState.minBuyIn
              : Math.max(gameState.minBuyIn, Math.min(parsed, gameState.maxBuyIn, gameState.usableBalance));
            setRechargeAmount(safeValue);
            setAmountStr(safeValue.toString());
          }}
        />
      </div>

      {/* Preset Buttons */}
      <div className="recharge-preset-buttons">
        <button
          type="button"
          onClick={() => {
            setRechargeAmount(gameState.minBuyIn);
            setAmountStr(gameState.minBuyIn.toString());
          }}
        >
          Min
        </button>
        <button
          type="button"
          onClick={() => {
            const amount = Math.min(gameState.bigBlind * 40, gameState.maxBuyIn, gameState.usableBalance);
            setRechargeAmount(amount);
            setAmountStr(amount.toString());
          }}
        >
          40BB
        </button>
        <button
          type="button"
          onClick={() => {
            const amount = Math.min(gameState.bigBlind * 70, gameState.maxBuyIn, gameState.usableBalance);
            setRechargeAmount(amount);
            setAmountStr(amount.toString());
          }}
        >
          70BB
        </button>
        <button
          type="button"
          onClick={() => {
            const amount = Math.min(gameState.maxBuyIn, gameState.usableBalance);
            setRechargeAmount(amount);
            setAmountStr(amount.toString());
          }}
        >
          Max
        </button>
      </div>

      {/* Submit Section */}
      <div className="submit-section">
        <button className="submit-btn" type="submit" disabled={isDisabled}>
          {finalModalType === "RECHARGE" ? "Цэнэглэх" : "Суух"}
        </button>
        {isRechargeTooLow && <p className="warning-text">Ширээний доод лимит {gameState.minBuyIn.toLocaleString()}.</p>}
      </div>
    </form>
  );
}

export default TexasTableRechargeForm;
