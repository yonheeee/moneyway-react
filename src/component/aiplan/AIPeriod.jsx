import React, { useState } from 'react';
import ProgressSteps from '../aiplan/ProgressStep';
import '../../css/aiplan/AIPeriod.css'
import { useNavigate, useLocation } from 'react-router-dom';

const AIPeriod = () => {
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const budget = location.state?.budget;

    const travelPeriods = [
        "당일치기",
        "1박 2일",
        "2박 3일",
        "3박 4일"
    ];
    
    const convertDurationToNumber = (duration) => {
        const durationMap = { "당일치기": 1, "1박 2일": 2, "2박 3일": 3, "3박 4일": 4 };
        return durationMap[duration] || 1;
    };

    const handleNext = () => {
        if (!selectedPeriod) return;
        navigate('/ai-name', {
            state: {
                budget: budget,
                duration: convertDurationToNumber(selectedPeriod)
            }
        });
    };

    return (
        <>
            <div className="page-container">
                <ProgressSteps currentStep={2} />
                <div className="content-container">
                    <div className="ai-title-section">
                        <h1>여행 기간은?</h1>
                        <p>여행 기간을 선택해주세요.</p>
                    </div>

                    <div className="period-options-container">
                        {travelPeriods.map((period, index) => (
                            <button
                                key={index}
                                className={`period-option ${selectedPeriod === period ? 'selected' : ''}`}
                                onClick={() => setSelectedPeriod(period)}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    
                    <button
                        className="next-button"
                        disabled={!selectedPeriod} 
                        onClick={handleNext}
                    >
                        다음
                    </button>

                </div>
            </div>
        </>
    );
};

export default AIPeriod;