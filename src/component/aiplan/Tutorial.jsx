import React, { useState, useEffect } from 'react';
import '../../css/aiplan/Tutorial.css';

import tutorial1 from '../../images/tutorial/tutorial1.svg';
import tutorial2 from '../../images/tutorial/tutorial2.svg';
import tutorial3 from '../../images/tutorial/tutorial3.svg';
import tutorial4 from '../../images/tutorial/tutorial4.svg';
import tutorial5 from '../../images/tutorial/tutorial5.svg';
import tutorial6 from '../../images/tutorial/tutorial6.svg';
import tutorial7 from '../../images/tutorial/tutorial7.svg';
import tutorial8 from '../../images/tutorial/tutorial8.svg';

import { ReactComponent as RightArrowIcon } from '../../images/myplan/right-arrow.svg';

const tutorialImages = [tutorial1, tutorial2, tutorial3, tutorial4, tutorial5, tutorial6, tutorial7, tutorial8];

const Tutorial = ({ showArrows = false, onClose }) => {
    const [currentTutorialIndex, setCurrentTutorialIndex] = useState(0);
    const [dotCount, setDotCount] = useState(1);

    const handleNext = () => {
        setCurrentTutorialIndex(prevIndex => (prevIndex + 1) % tutorialImages.length);
    };

    const handlePrev = () => {
        setCurrentTutorialIndex(prevIndex => 
            prevIndex === 0 ? tutorialImages.length - 1 : prevIndex - 1
        );
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose?.();
        }
    };

    useEffect(() => {
        if (showArrows) { 
            const handleEscKey = (e) => {
                if (e.key === 'Escape') {
                    onClose?.();
                }
            };
            document.addEventListener('keydown', handleEscKey);
            return () => document.removeEventListener('keydown', handleEscKey);
        }
    }, [showArrows, onClose]);

    useEffect(() => {
        if (!showArrows) {
            const interval = setInterval(() => {
                setCurrentTutorialIndex(prevIndex => (prevIndex + 1) % tutorialImages.length);
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [showArrows]);

    useEffect(() => {
        if (!showArrows) {
            const dotInterval = setInterval(() => {
                setDotCount(prevCount => (prevCount % 3) + 1); // 1, 2, 3 순환
            }, 500); // 0.5초마다 점 개수 변경

            return () => clearInterval(dotInterval);
        }
    }, [showArrows]);


    if (showArrows) {

        return (
            <div className="tutorial-modal-overlay" onClick={handleBackdropClick}>
                <div className="tutorial-modal-content">
                    <button className="tutorial-modal-close" onClick={onClose}>
                        ×
                    </button>
                    
                    <div className="tutorial-container modal-version">
                        <h2 className="tutorial-title">튜토리얼 확인하고<br/>
                            나만의 계획을 만들어보세요!
                        </h2>
                        
                        <div className="tutorial-image-wrapper">
                            <img
                                src={tutorialImages[currentTutorialIndex]}
                                alt={`튜토리얼 ${currentTutorialIndex + 1}`}
                                className="tutorial-image"
                            />
                            
                            <button className="nav-arrow prev-arrow" onClick={handlePrev}>
                                <RightArrowIcon style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            
                            <button className="nav-arrow next-arrow" onClick={handleNext}>
                                <RightArrowIcon />
                            </button>
                        </div>

                        <div className="pagination-dots">
                            {tutorialImages.map((_, index) => (
                                <div
                                    key={index}
                                    className={`dot ${index === currentTutorialIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentTutorialIndex(index)}
                                />
                            ))}
                        </div>
                        
                        
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tutorial-container">
            <p>계획 생성중{'.'.repeat(dotCount)}<br/>Tip: 머니웨이 튜토리얼을 확인하세요</p>
            
            <div className="tutorial-image-wrapper">
                <img
                    src={tutorialImages[currentTutorialIndex]}
                    alt={`튜토리얼 ${currentTutorialIndex + 1}`}
                    className="tutorial-image"
                />
            </div>

            <div className="pagination-dots">
                {tutorialImages.map((_, index) => (
                    <div
                        key={index}
                        className={`dot ${index === currentTutorialIndex ? 'active' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Tutorial;