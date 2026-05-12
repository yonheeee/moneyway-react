import React from 'react';
import '../../css/aiplan/ProgressStep.css'; 

const ProgressStep = ({ currentStep, totalSteps = 3 }) => {
    const goBack = () => {
        window.history.back();
    };
    const spaceBetweenSteps = 13; // (
    const progressHeight = (currentStep - 1) * spaceBetweenSteps;

    return (
        <div className="progress-container">
            <button onClick={goBack} className="back-arrow">←</button>
            <div 
                className="progress-bar"
                style={{ '--progress-height': `${progressHeight}rem` }}
            >
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    let stepClass = 'step';
                    if (stepNumber < currentStep) {
                        stepClass += ' completed';
                    } else if (stepNumber === currentStep) {
                        stepClass += ' active';
                    }

                    return (
                        <div key={stepNumber} className={stepClass}>
                            {stepNumber < currentStep ? '✓' : stepNumber}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressStep;