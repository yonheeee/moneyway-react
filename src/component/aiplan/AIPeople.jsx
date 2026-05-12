import React, { useState } from 'react';
import ProgressSteps from '../aiplan/ProgressStep';
import '../../css/aiplan/AIPeople.css'; 
import { useNavigate } from 'react-router-dom';

const AIPeople = () => {
    const [selectedPeople, setSelectedPeople] = useState(null);
    const navigate = useNavigate();

    const peopleOptions = [
        "1인",
        "2인",
        "3인",
        "4인 이상"
    ];

    const handleNext = () => {
        navigate('/ai-name'); 
    };


    return (
        <>
            <div className="page-container">
                <ProgressSteps currentStep={3} />

                <div className="content-container">
                    <div className="ai-title-section">
                        <h1>여행 인원은?</h1>
                        <p>여행 오실 수를 선택해주세요.</p>
                    </div>

                    <div className="people-options-container">
                        {peopleOptions.map((option, index) => (
                            <button
                                key={index}
                                className={`people-option-button ${selectedPeople === option ? 'selected' : ''}`}
                                onClick={() => setSelectedPeople(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    
                    <button
                        className="next-button"
                        disabled={!selectedPeople}
                        onClick={handleNext}
                    >
                        다음
                    </button>
                </div>
            </div>
        </>
    );
};

export default AIPeople;