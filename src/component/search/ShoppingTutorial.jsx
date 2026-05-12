import React, { useEffect, useState } from "react";
import "../../css/aiplan/Tutorial.css";
import { ReactComponent as RightArrowIcon } from "../../images/myplan/right-arrow.svg";

import step1 from "../../images/tutorial/shoppingtutorial1.svg";
import step2 from "../../images/tutorial/shoppingtutorial2.svg";
import step3 from "../../images/tutorial/shoppingtutorial3.svg";

const images = [step1, step2, step3];

const ShoppingTutorial = ({ onClose }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") setIdx((v) => Math.min(images.length - 1, v + 1));
      if (e.key === "ArrowLeft") setIdx((v) => Math.max(0, v - 1));
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="tutorial-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="tutorial-modal-content">
        <button className="tutorial-modal-close" onClick={onClose}>×</button>

        <div className="tutorial-container modal-version">
          <h2 className="tutorial-title">튜토리얼을 확인하고<br/>나만의 계획을 만들어보세요</h2>

          <div className="tutorial-image-wrapper">
            <img src={images[idx]} alt={`튜토리얼 ${idx + 1}`} className="tutorial-image" />

            <button className="nav-arrow prev-arrow" onClick={() => setIdx((v) => Math.max(0, v - 1))} disabled={idx === 0}>
              <RightArrowIcon style={{ transform: 'rotate(180deg)' }} />
            </button>

            <button className="nav-arrow next-arrow" onClick={() => idx === images.length - 1 ? onClose?.() : setIdx(idx + 1)}>
              <RightArrowIcon />
            </button>
          </div>

          <div className="pagination-dots">
            {images.map((_, i) => (
              <div key={i} className={`dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingTutorial;


