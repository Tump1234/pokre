import { useMemo, useState, type ReactNode, type TouchEvent } from "react";
import { FaCoins, FaFilter, FaPlay, FaTrophy, FaUserCircle } from "react-icons/fa";

interface MobileMiddleSwiperProps {
  onShowTables: () => void;
  onShowTournaments: () => void;
  onShowGames: () => void;
}

type Slide = {
  id: string;
  content: ReactNode;
};

const swipeThreshold = 45;

function MobileMiddleSwiper({ onShowTables, onShowTournaments, onShowGames }: MobileMiddleSwiperProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const baseSlides: Slide[] = useMemo(
    () => [
      {
        id: "cash-table",
        content: (
          <div className="mobile-swiper-card-content">
            <div className="mobile-swiper-header-row">
              <span className="mobile-swiper-header-icon money">
                <FaCoins />
              </span>
              <h3>БЭЛЭН МӨНГӨНИЙ ШИРЭЭ</h3>
            </div>

            <div className="mobile-swiper-cash-meta">
              <span className="mobile-swiper-side-icon">
                <FaFilter />
              </span>
              <div className="mobile-swiper-meta-text">
                <p>Game Group: All</p>
                <p>Бооцооны төрөл: Аль ч</p>
              </div>
              <span className="mobile-swiper-side-icon">
                <FaPlay />
              </span>
            </div>

            <button type="button" className="mobile-swiper-btn" onClick={onShowTables}>
              ШИРЭЭНҮҮДИЙГ ХАРУУЛАХ
            </button>
          </div>
        ),
      },
      {
        id: "tournament",
        content: (
          <div className="mobile-swiper-card-content">
            <div className="mobile-swiper-header-row">
              <span className="mobile-swiper-header-icon trophy">
                <FaTrophy />
              </span>
              <h3>ТЭМЦЭЭН</h3>
            </div>

            <ul>
              <li>
                <span className="mobile-swiper-list-icon">•</span>
                <span>Зарлагдсан: 0</span>
              </li>
              <li>
                <span className="mobile-swiper-list-icon">•</span>
                <span>Бүртгэл явагдаж байгаа: 0</span>
              </li>
              <li>
                <span className="mobile-swiper-list-icon">•</span>
                <span>Сүүлийн бүртгэл: 0</span>
              </li>
            </ul>

            <button type="button" className="mobile-swiper-btn" onClick={onShowTournaments}>
              {"ТЭМЦЭЭНҮҮДИЙГ\nХАРУУЛАХ"}
            </button>
          </div>
        ),
      },
      {
        id: "my-games",
        content: (
          <div className="mobile-swiper-card-content">
            <div className="mobile-swiper-profile-row">
              <FaUserCircle className="mobile-swiper-avatar-icon" />
              <div className="mobile-swiper-title">MY GAMES</div>
            </div>
            <button type="button" className="mobile-swiper-btn" onClick={onShowGames}>
              SHOW GAMES
            </button>
          </div>
        ),
      },
    ],
    [onShowGames, onShowTables, onShowTournaments],
  );

  const loopSlides = useMemo(() => [baseSlides[baseSlides.length - 1], ...baseSlides, baseSlides[0]], [baseSlides]);

  const moveSlide = (direction: "next" | "prev") => {
    if (direction === "next") {
      setActiveIndex((prev) => prev + 1);
      return;
    }

    setActiveIndex((prev) => prev - 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const diff = event.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(diff) < swipeThreshold) return;

    if (diff > 0) {
      moveSlide("prev");
      return;
    }

    moveSlide("next");
  };

  const handleTransitionEnd = () => {
    if (activeIndex === 0) {
      setIsAnimating(false);
      setActiveIndex(baseSlides.length);
      requestAnimationFrame(() => setIsAnimating(true));
      return;
    }

    if (activeIndex === baseSlides.length + 1) {
      setIsAnimating(false);
      setActiveIndex(1);
      requestAnimationFrame(() => setIsAnimating(true));
    }
  };

  return (
    <section className="mobile-middle-swiper" aria-label="Mobile card slider">
      <div
        className="mobile-swiper-track"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
          transition: isAnimating ? "transform 320ms ease" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTransitionEnd={handleTransitionEnd}
      >
        {loopSlides.map((slide, index) => (
          <article className="mobile-swiper-slide" key={`${slide.id}-${index}`}>
            {slide.content}
          </article>
        ))}
      </div>

      <div className="mobile-swiper-dots" aria-hidden>
        {baseSlides.map((slide, index) => {
          const isActive = (activeIndex - 1 + baseSlides.length) % baseSlides.length === index;
          return <span key={slide.id} className={`mobile-swiper-dot ${isActive ? "active" : ""}`} />;
        })}
      </div>
    </section>
  );
}

export default MobileMiddleSwiper;
