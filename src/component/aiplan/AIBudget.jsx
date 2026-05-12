import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import BudgetSlider from "../main/BudgetSlider";
import ProgressStep from '../aiplan/ProgressStep';
import '../../css/aiplan/AIBudget.css'; 

const AIBudget = () => {
    const [budget, setBudget] = useState(500000);
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/ai-period', { 
            state: { 
                budget: budget
            } 
        });
    };

    return (
        <>
            <div className="page-container">
                <ProgressStep currentStep={1} />
                <div className="content-container">
                    <div className="ai-title-section">
                        <h1>나의 예산은?</h1>
                        <p>여행에 쓰실 예산을 입력해주세요.</p>
                    </div>
                    
                    <BudgetSlider budget={budget} setBudget={setBudget} />
                    
                    <button className="next-button" onClick={handleNext}>
                        다음
                    </button>
                </div>
            </div>
        </>
    );
};

export default AIBudget;