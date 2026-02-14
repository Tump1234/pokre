import { useState, useEffect, lazy, Suspense } from "react";
import { useSelector } from "react-redux";

import { useKickPlayerMutation } from "../../api/admin";
import { useMeQuery } from "../../api/user";
import type { GameState } from "../../types/gameTypes";

const ConfirmFoldModal = lazy(() => import("../../components/modals/ConfirmFoldModal"));
const PlayersModal = lazy(() => import("../../components/modals/PlayersModal"));
const SettingsModal = lazy(() => import("../../components/modals/SettingsModal"));
const InfoModal = lazy(() => import("../../components/modals/InfoModal"));
const HandHistoryList = lazy(() => import("../../components/modals/HandHistoryList"));

import { useFetchHandHistoryQuery } from "../../api/tablesApi";
import { type HandHistory } from "../../api/game";
import JackpotText from "../../components/JackpotText";
import { toggleMute, isMuted } from "../../utils/sounds";
import { useIsMobile } from "../../hooks/useIsMobile";

type ModalType = "PLAYERS" | "CONFIRM_LEAVE" | "SETTINGS" | "INFO" | "HISTORY" | null;

interface ModalState {
  type: ModalType;
  props?: Record<string, any>;
}

interface DesktopTableActionButtonsProps {
  navigate: (path: string) => void;
  gameState: GameState;
  tableId: string;
  userHasSeat: boolean;
  setModalType: (type: string) => void;
  leaveSeat: (seat: number) => void;
  userSeatIndex: number;
  setShowHistory: (open: boolean) => void;
}

export default function DesktopTableActionButtons({
  navigate,
  gameState,
  tableId,
  userHasSeat,
  setModalType,
  leaveSeat,
  userSeatIndex,
}: DesktopTableActionButtonsProps) {
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const isMobile = useIsMobile();
  const [kickPlayer] = useKickPlayerMutation();
  const token = localStorage.getItem("accessToken");
  const { data: me } = useMeQuery(undefined, { skip: !token });
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  // const mySeat = gameState.seats?.find((s) => s?.user?.userId === me?.userId);
  // const myStack = mySeat?.stack ?? 0;
  // const isBusted = myStack <= 0;
  const isAdmin = me?.role === "ADMIN";
  const seats = gameState.seats?.filter((s) => s?.user) || [];
  const [allHands, setAllHands] = useState<HandHistory[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const [, forceSoundUpdate] = useState(0);
  const onToggleSound = () => {
    toggleMute();
    forceSoundUpdate((n) => n + 1);
  };

  const {
    data: fetchedHands = [],
    isLoading,
    isFetching,
  } = useFetchHandHistoryQuery({ tableId: Number(tableId), limit, offset }, { skip: modalState.type !== "HISTORY" });

  useEffect(() => {
    if (fetchedHands.length > 0) setAllHands((prev) => [...prev, ...fetchedHands]);
  }, [fetchedHands]);

  const openHistoryModal = () => {
    setAllHands([]);
    setOffset(0);
    openModal("HISTORY");
  };
  const loadMoreHands = () => setOffset((prev) => prev + limit);
  const openModal = (type: ModalType, props?: Record<string, any>) => setModalState({ type, props });
  const closeModal = () => setModalState({ type: null });

  const leaveSeatModal = () => {
    if (userHasSeat) openModal("CONFIRM_LEAVE", { leaveType: "LEAVE_SEAT" });
    else leaveSeat(userSeatIndex);
  };

  const leaveAndGoHome = () => {
    if (userHasSeat) openModal("CONFIRM_LEAVE", { leaveType: "GO_HOME" });
    else navigate("/");
  };

  const confirmLeave = () => {
    if (modalState.props?.leaveType === "LEAVE_SEAT") leaveSeat(userSeatIndex);
    else if (modalState.props?.leaveType === "GO_HOME") {
      if (userHasSeat) leaveSeat(userSeatIndex);
      navigate("/");
    }
    closeModal();
  };

  const doKick = (uid: number) => kickPlayer({ tableId: Number(tableId), userId: uid });

  const openMenu = () => {
    setShouldRender(true);
    requestAnimationFrame(() => setIsVisible(true));
  };
  const closeMenu = () => {
    setIsVisible(false);
    setTimeout(() => setShouldRender(false), 320);
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch((err) => console.error(err));
    else document.exitFullscreen();
  };

  const renderButtons = () => {
    if (isMobile) {
      return (
        <>
          <button className="desktop-action-btn" onClick={() => navigate("/")}>
            <div className="icon home" />
          </button>
          <button className="desktop-action-btn" onClick={() => navigate("/")}>
            <div className="icon add-table" />
          </button>
          <button className="desktop-action-btn settings" onClick={() => openModal("SETTINGS")}>
            <div className="icon settings" />
          </button>
          <button className="desktop-action-btn" onClick={() => openModal("INFO")}>
            <div className="icon info" />
          </button>
          <button className="desktop-action-btn menu" onClick={openMenu}>
            <div className="icon menu" />
          </button>
          <button className="desktop-action-btn" onClick={toggleFullscreen}>
            <div className="icon fullscreen" />
          </button>
        </>
      );
    } else {
      // Desktop: full buttons
      return (
        <>
          <button className="desktop-action-btn" onClick={() => navigate("/")}>
            <div className="icon home" />
          </button>
          <button className="desktop-action-btn" onClick={() => navigate("/")}>
            <div className="icon add-table" />
          </button>
          <button
            className={`desktop-action-btn recharge-btn ${!userHasSeat ? "disabled" : ""}`}
            disabled={!userHasSeat}
            onClick={() => userHasSeat && setModalType("RECHARGE")}
          >
            <div className="icon recharge" />
          </button>
          <button className="desktop-action-btn">
            <div className="icon history" onClick={openHistoryModal} />
          </button>
          {isAdmin && (
            <button className="desktop-action-btn" onClick={() => openModal("PLAYERS")}>
              <div className="icon players" />
            </button>
          )}
          <button className="desktop-action-btn" onClick={onToggleSound}>
            <div className={`icon mute ${isMuted() ? "muted" : ""}`} />
          </button>
          <div className="jackpot-box-action-btn">
            <div className="jackpot-text">
              <span>Badbeat</span>
            </div>
            <JackpotText />
          </div>
          <button className="desktop-action-btn" onClick={() => openModal("INFO")}>
            <div className="icon info" />
          </button>
          <button className="desktop-action-btn settings" onClick={() => openModal("SETTINGS")}>
            <div className="icon settings" />
          </button>
          <button className="desktop-action-btn" onClick={leaveSeatModal}>
            <div className="icon stand" />
          </button>
          <button className="desktop-action-btn" onClick={leaveAndGoHome}>
            <div className="icon leave" />
          </button>
          <button className="desktop-action-btn menu" onClick={openMenu}>
            <div className="icon menu" />
          </button>
          <button className="desktop-action-btn" onClick={toggleFullscreen}>
            <div className="icon fullscreen" />
          </button>
        </>
      );
    }
  };

  return (
    <div className="desktop-table-action-wrapper">
      {shouldRender && isMobile && (
        <div className="mobile-menu-modal-overlay" onClick={closeMenu}>
          <div className={`mobile-menu-modal-content ${isVisible ? "slide-in" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-close-btn" onClick={closeMenu} />
            <div className="mobile-menu-buttons-grid">
              <button className="mobile-menu-modal-btn settings-btn" onClick={() => openModal("SETTINGS")}>
                <span>Тохиргоо</span>
              </button>
              <button className="mobile-menu-modal-btn home-btn" onClick={() => navigate("/")}>
                <span>Ширээнд мөнгө нэмэх</span>
              </button>
              <button className="mobile-menu-modal-btn home-btn" onClick={() => navigate("/")}>
                <span>Гарах</span>
              </button>
              <button className="mobile-menu-modal-btn home-btn" onClick={() => navigate("/")}>
                <span>Суудлаас босох</span>
              </button>
              <button className="mobile-menu-modal-btn home-btn" onClick={() => navigate("/")}>
                <span>Тоглолт үзэх</span>
              </button>
              <button className="mobile-menu-modal-btn home-btn" onClick={() => navigate("/")}>
                <span>Мэдээлэл</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`desktop-menu-buttons-wrapper ${isVisible ? "visible" : "hidden"}`}>{renderButtons()}</div>

      <Suspense fallback={null}>
        {modalState.type === "PLAYERS" && <PlayersModal seats={seats} isAdmin={isAdmin} onKick={doKick} onClose={closeModal} />}
        {modalState.type === "CONFIRM_LEAVE" && (
          <ConfirmFoldModal
            open={true}
            onConfirm={confirmLeave}
            onCancel={closeModal}
            title={
              modalState.props?.leaveType === "LEAVE_SEAT" ? "Та ширээнээс босохдоо итгэлтэй байна уу?" : "Та өрөөнөөс гарахдаа итгэлтэй байна уу?"
            }
            confirmText="Тийм"
            cancelText="Цуцлах"
          />
        )}
        {modalState.type === "SETTINGS" && (
          <div className="modal-overlay">
            <div className="finance-modal-container" onClick={(e) => e.stopPropagation()}>
              <SettingsModal isAuthenticated={isAuthenticated} isModalVisible closeModal={closeModal} />
            </div>
          </div>
        )}
        {modalState.type === "INFO" && <InfoModal isModalVisible closeModal={closeModal} />}
        {modalState.type === "HISTORY" && (
          <HandHistoryList
            handHistory={allHands}
            isLoading={isLoading || isFetching}
            open={modalState.type === "HISTORY"}
            onClose={() => {
              closeModal();
              setAllHands([]);
              setOffset(0);
            }}
            loadMore={loadMoreHands}
            hasMore={fetchedHands.length === limit}
          />
        )}
      </Suspense>
    </div>
  );
}
