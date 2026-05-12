import React, { useRef, useEffect, useState, useCallback } from "react";
import "../../css/main/Slider.css";
import LeftArrowIcon from "../../images/main/left-arrow.svg";
import RightArrowIcon from "../../images/main/right-arrow.svg";

const ANIMATION_DURATION = 300;
// const PX_PER_REM = 10;

const HorizontalSlider = ({ children }) => {
  const scrollRef = useRef(null);
  const listRef = useRef(null);
  // const containerRef = useRef(null);
  const animatingRef = useRef(false);

  const cardsArray = React.Children.toArray(children.props.children);
  const totalCards = cardsArray.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  // const [containerWidth, setContainerWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  const CONTAINER_WIDTH = 1200;

  // // 컨테이너 너비 측정
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (containerRef.current) {
  //       setContainerWidth(containerRef.current.offsetWidth);
  //     }
  //   };
  //   window.addEventListener("resize", handleResize);
  //   handleResize();
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // maxIndex 계산
  useEffect(() => {
    if (!listRef.current || !listRef.current.children[0]) return;

    const cardWidth = listRef.current.children[0].offsetWidth;
    const visibleCount = Math.floor(CONTAINER_WIDTH / cardWidth) || 1;
    const newMaxIndex = Math.max(totalCards - visibleCount, 0);
    setMaxIndex(newMaxIndex);
  }, [totalCards]);

  useEffect(() => {
    if (!listRef.current || !listRef.current.children[0]) return;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [totalCards]);

  const animateTo = useCallback((targetPosition) => {
    if (!scrollRef.current || animatingRef.current) return;
    animatingRef.current = true;

    const el = scrollRef.current;
    let start = el.scrollLeft;
    let startTime = null;

    function animStep(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(
        (timestamp - startTime) / ANIMATION_DURATION,
        1
      );
      const easeOutQuad = (p) => p * (2 - p);

      el.scrollLeft = start + (targetPosition - start) * easeOutQuad(progress);

      if (progress < 1) {
        requestAnimationFrame(animStep);
      } else {
        animatingRef.current = false;
      }
    }
    requestAnimationFrame(animStep);
  }, []);

  useEffect(() => {
    if (!listRef.current || !listRef.current.children[0] || !scrollRef.current)
      return;
    const cardW = listRef.current.children[0].offsetWidth;
    const targetPosition = cardW * currentIndex;
    animateTo(targetPosition);
  }, [currentIndex, animateTo]);

  const handleArrowClick = (direction) => {
    if (animatingRef.current) return;

    if (direction === "left") {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    }
  };

  // 진행바 너비 및 위치 계산 (maxIndex + 1 칸으로 분할)
  // const barTrackWidth = containerWidth;
  // const barWidth = maxIndex === 0 ? barTrackWidth : barTrackWidth / (maxIndex + 1);
  // const barWidthRem = barWidth / PX_PER_REM;
  // const leftRem = (currentIndex * barWidth) / PX_PER_REM;

  return (
    <div className="horizontal-slider-root">
      <div
        className="scroll-wrapper"
        ref={scrollRef}
        style={{ overflowX: "hidden", scrollBehavior: "auto" }}
      >
        <div className={children.props.className} ref={listRef}>
          {cardsArray}
        </div>
      </div>
      <div className="controls-container">
        <button
          className="arrow-button left"
          onClick={() => handleArrowClick("left")}
          disabled={currentIndex === 0}
        >
          <img src={LeftArrowIcon} alt="왼쪽" />
        </button>
        {/* <div
          className="progress-bar-container"
          ref={containerRef}
          style={{ width: "30vw" }}
        >
          <div
            className="progress-bar-fill"
            style={{
              width: `${barWidthRem}rem`,
              left: `${leftRem}rem`,
              transition: `left ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
        </div> */}
        <button
          className="arrow-button right"
          onClick={() => handleArrowClick("right")}
          disabled={currentIndex >= maxIndex}
        >
          <img src={RightArrowIcon} alt="오른쪽" />
        </button>
      </div>
    </div>
  );
};

export default HorizontalSlider;
