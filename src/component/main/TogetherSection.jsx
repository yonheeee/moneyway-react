import React, { useEffect, useRef, useState, useCallback } from "react";
import "../../css/main/Main.css";
import "../../css/main/TogetherSection.css";
import PlanIcon from "../../images/main/planIcon.svg";

import Together1 from "../../images/main/together1.png";
import Together2 from "../../images/main/together2.png";
import Together3 from "../../images/main/together3.png";

const STEPS = [
  {
    n: 1,
    label: "STEP 1",
    title: "예산을 입력하세요",
    desc: "여행에 쓰일 예산을 입력해주세요. 당신을 위한 여행의 첫 걸음이 됩니다.",
    previewAria: "예산 입력 화면 미리보기",
    previewImg: Together1, // ✅ 이미지 경로 추가
  },
  {
    n: 2,
    label: "STEP 2",
    title: "여행 기간을 입력하세요",
    desc: "얼마 동안 여행하시나요? 추천 장소로 플랜을 구성해 드립니다.",
    previewAria: "여행 기간 선택 화면 미리보기",
    previewImg: Together2,
  },
  {
    n: 3,
    label: "STEP 3",
    title: "곧 플랜이 완성됩니다!",
    desc: "나의 여행에 이름을 붙여주세요. 플랜을 저장하고 쉽게 관리할 수 있어요.",
    previewAria: "여행 플랜 요약 화면 미리보기",
    previewImg: Together3,
  },
];

const CYCLE_MS = 1500;

function TogetherSection() {
  const [active, setActive] = useState(1);
  const [reached, setReached] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const nextStep = useCallback(() => {
    setActive((prev) => {
      if (prev === 3) {
        setReached(1);
        return 1;
      }
      const next = prev + 1;
      setReached((r) => Math.max(r, next));
      return next;
    });
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(nextStep, CYCLE_MS);
  }, [clearTimer, nextStep]);

  useEffect(() => {
    if (!paused) startTimer();
    return () => clearTimer();
  }, [paused, startTimer, clearTimer]);

  const handleSelect = (n) => {
    setActive(n);
    setReached((r) => (n === 1 ? 1 : Math.max(r, n)));
    clearTimer();
    timerRef.current = setTimeout(() => startTimer(), 600);
  };

  const onKeyActivate = (e, n) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(n);
    }
  };

  return (
    <section
      className="together"
      aria-label="우리가 함께 만드는 여행"
      onMouseLeave={() => setPaused(false)}
    >
      <div className="together__inner">
        {/* 왼쪽 */}
        <aside className="together__left">
          <p className="eyebrow">AI로 완성하는 나만의 제주 여행</p>

          <h2 className="title">몇 번의 클릭으로 시작되는 스마트한 여정</h2>

          <p className="lede">
            넘쳐나는 정보 속에서 고민은 이제 그만. 예산과 기간
            <br />
            만 입력하면, AI가 알아서 똑똑하게 계획해 주니까요.

          </p>

          <ol className="steps steps--cards" aria-label="단계">
            {STEPS.map((s) => {
              const isCurrent = active === s.n;
              const isOn = s.n <= reached;
              const stateClass = isCurrent ? "is-current" : isOn ? "is-on" : "";

              return (
                <StepCard
                  key={s.n}
                  n={s.n}
                  label={s.label}
                  title={s.title}
                  desc={s.desc}
                  isOn={isOn}
                  isCurrent={isCurrent}
                  stateClass={stateClass}
                  ariaCurrent={isCurrent ? "step" : undefined}
                  onClick={() => handleSelect(s.n)}
                  onKeyDown={(e) => onKeyActivate(e, s.n)}
                />
              );
            })}
          </ol>
        </aside>

        {/* 오른쪽 프리뷰 (현재 단계만 표시) */}
        <div className="together__right" aria-live="polite">
          {STEPS.map((s) => (
            <img
              key={s.n}
              src={s.previewImg}
              alt={s.previewAria}
              className={active === s.n ? "ph is-show" : "ph"}
              aria-hidden={active !== s.n}
            />
          ))}

          {/* CTA */}
          <div className="ph-cta">
            <img
              className="panel-cart-icon"
              src={PlanIcon}
              alt=""
              aria-hidden="true"
            />
            <a href="/aiplan" className="panel-btn">
              <span className="panel-btn__text">플랜 만들러 가기</span>
              <span className="panel-btn__arrow" aria-hidden="true">
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  n,
  label,
  title,
  desc,
  isOn,
  isCurrent,
  stateClass,
  ariaCurrent,
  onClick,
  onKeyDown,
}) {
  const descId = `together-desc-${n}`;
  const expanded = isOn;
  return (
    <li
      className={`together-step ${stateClass}`}
      data-step={n}
      aria-current={ariaCurrent}
    >
      <span className="together-bullet" aria-hidden>
        {n}
      </span>
      <span className="together-dot" aria-hidden />

      <div
        className="together-card together-card--action"
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${title} 선택`}
        aria-expanded={expanded}
        aria-controls={descId}
        data-active={expanded ? "true" : "false"}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <span className="together-label">{label}</span>
        <div className="together-card__title" aria-hidden={!expanded}>
          {title}
        </div>
        <div id={descId} className="together-card__desc" aria-hidden={!expanded}>
          {desc}
        </div>
      </div>
    </li>
  );
}

export default TogetherSection;
