import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function RotatingTextWave({
  phrases = [],
  interval = 2000,
  height = 64,
  align = "center",     // 'left' | 'center' | 'right'
  amplitude = 10,       // 파도 높이(px)
  charDelay = 0.035,    // 글자당 지연
  inDur = 0.6,
  outDur = 0.5,
  className = "",
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!phrases.length) return;
    const id = setInterval(() => {
      setIdx((p) => (p + 1) % phrases.length);
    }, interval);
    return () => clearInterval(id);
  }, [phrases.length, interval]);

  const current = phrases[idx] ?? "";
  const alignMap = { left: "flex-start", center: "center", right: "flex-end" };

  // ✅ 공백 보존 + 이모지 안전 분해
  const chars = useMemo(() => {
    // Array.from으로 유니코드 코드포인트 단위 분해 (이모지/한글 안전)
    return Array.from(current).map((ch) => (ch === " " ? "\u00A0" : ch));
  }, [current]);

  // ✅ 입장/퇴장 각각 지연을 주기 위해 variants 사용
  const makeVariants = (i) => ({
    initial: { y: amplitude, opacity: 0, transition: { duration: inDur, delay: i * charDelay, ease: [0.2, 0.7, 0.2, 1] } },
    animate: { y: 0,         opacity: 1, transition: { duration: inDur, delay: i * charDelay, ease: [0.2, 0.7, 0.2, 1] } },
    exit:    { y: -amplitude,opacity: 0, transition: { duration: outDur, delay: i * charDelay, ease: [0.4, 0.0, 1, 1] } },
  });

  return (
    <div
      className={`rtw-wrap ${className}`}
      style={{ position: "relative", height, overflow: "hidden", whiteSpace: "pre" }} // ✅ CSS 보강(white-space)
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="rtw-line"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: alignMap[align],
          }}
        >
          {chars.map((ch, i) => (
            <motion.span
              key={i}                    // ✅ key는 인덱스로 단순화(동일 문자 중복 충돌 방지)
              className="rtw-char"
              variants={makeVariants(i)} // ✅ 각 인덱스별 variants
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: "inline-block", willChange: "transform" }} // ✅ 파도 애니메이션
              aria-hidden="true"
            >
              {ch}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
