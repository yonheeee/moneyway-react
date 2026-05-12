import { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";

import "../../css/main/Main.css";
import mainIcons from "../../images/main/mainIcons.svg";
import TogetherSection from "./TogetherSection";
import MainSlider from "./MainSlider";
import mainIcons2 from "../../images/main/mainIcons2.png";
import cartIcon from "../../images/main/cartIcon.svg";
import RotatingTextWave from "./RotatingTextWave";
import Footer from "../common/Footer";

import bg1 from "../../images/main/background1.png";
import bg2 from "../../images/main/background2.png";
import bg3 from "../../images/main/background3.png";

const images = [bg1, bg2, bg3];
const DURATION = 5000; // 한 장 유지 시간(ms)

export default function StickyTest() {
  useEffect(() => {
    // ✅ Lenis 초기화
    const lenis = new Lenis({
      duration: 1.5, // 묵직한 느낌
      easing: (t) => 1 - Math.pow(2, -10 * t), // easeOutExpo 느낌
      smoothWheel: true,
      smoothTouch: true,
    });

    // ✅ RAF 루프 실행
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main>
      <HeroSection />
      <PanelSection />
      <TogetherSection />
      <ThirdPanel />
      <MainSlider />
      <Footer />
    </main>
  );
}

/* ---------------- HeroSection ---------------- */
function HeroSection() {
  const pinRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ 배경 전환 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, DURATION);
    return () => clearInterval(timer);
  }, []);

  // ✅ 이미지 미리 로딩
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // ✅ 기존 pin hide 로직
  useEffect(() => {
    const pin = pinRef.current;
    const panel = document.querySelector(".test-panel"); // 첫 패널
    if (!pin || !panel) return;

    const update = () => {
      const panelTop = panel.getBoundingClientRect().top;
      const pinRect = pin.getBoundingClientRect();
      const pinBottomY = window.innerHeight * 0.5 + pinRect.height * 0.5;
      const fullyCovered = panelTop <= pinBottomY - 400;
      pin.classList.toggle("is-hidden", fullyCovered);
    };

    const onScroll = () => requestAnimationFrame(update);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="test-hero">
      {/* ✅ 페이드 전환 배경 */}
      <div className="hero-bg">
        {images.map((src, i) => (
          <div
            key={i}
            className={`bg-slide ${i === activeIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* 고정 문구 */}
      <div ref={pinRef} className="test-hero__pin">
        <p>여행을 쇼핑하다,<br />제주를 담다</p>
        <h1>제주도 여행 아직도 어렵게 하세요? <br />머니웨이에서 가장 완벽한 제주 여행이 시작됩니다.</h1>
        <ScrollDown />
      </div>
      <div className="test-hero__spacer" />
    </section>
  );
}

/* ScrollDown 컴포넌트 */
function ScrollDown() {
  return (
    <div className="scroll-down">
      <span className="scroll-text">Scroll</span>
      <span className="scroll-icon">↓</span>
    </div>
  );
}

/* ---------------- PanelSection ---------------- */
function PanelSection() {
  return (
    <section className="test-panel">
      <div className="title-strip">
        <p className="title-eyebrow">
          <RotatingTextWave
            phrases={[
              "내 계획이 시작되는 곳,",
              "내 여행이 실현되는 곳,",
              "내 추억이 기록되는 곳,",
            ]}
            interval={2000}
            height={64}
            align="center"
            amplitude={10}
            charDelay={0.035}
          />
        </p>

        <h2 className="title-main">MONEYWAY</h2>
        <ul className="emoji-row">
          <li>🌴</li>
          <li>💰</li>
          <li>🚌</li>
          <li>💰</li>
          <li>🌴</li>
        </ul>
      </div>

      <div className="panel-grid">
        <div className="panel-left">
          <p className="panel-eyebrow">내 손안의 여행 편집샵</p>
          <h2 className="panel-title">
            머니웨이에서 찾으세요, <br />
            당신에게 딱 맞는 맞춤 여행 플랜
          </h2>
          <p className="panel-sub">
            가고 싶은 맛집, 명소, 숙소를 둘러보세요. <br />
            마음에 들면 나의 여행카트에 <b>쏙!</b>
          </p>
          <div className="panel-cta">
            <img
              className="panel-cart-icon"
              src={cartIcon}
              alt=""
              aria-hidden="true"
            />
            <a href="/search" className="panel-btn">
              <span className="panel-btn__text">카트 채우러 가기</span>
              <span className="panel-btn__arrow" aria-hidden="true"></span>
            </a>
          </div>
        </div>

        <div className="panel-right">
          <div className="icon-stage">
            <img src={mainIcons} alt="여행 아이콘 모음" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- ThirdPanel ---------------- */
function ThirdPanel() {
  return (
    <section className="third-panel-container">
      <img src={mainIcons2} alt="여행 아이콘 모음" />
    </section>
  );
}
