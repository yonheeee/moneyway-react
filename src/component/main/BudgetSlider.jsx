import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import '../../css/main/BudgetSlider.css';

const BudgetSlider = ({ budget, setBudget }) => {
  const formatNumber = (num) => {
    if (isNaN(num) || num === null) return '0';
    return num.toLocaleString('ko-KR');
  };

  const handleInputChange = (e) => {
    const cleanedValue = e.target.value.replace(/\D/g, '');
    let numValue = Number(cleanedValue);
    const MAX_BUDGET = 5000000;

    if (numValue > MAX_BUDGET) {
      numValue = MAX_BUDGET;
    }

    if (!isNaN(numValue)) {
      setBudget(numValue);
    }
  };

  return (
    <div className="budget-container">
      <div className="budget-values">₩ {formatNumber(budget)}</div>

      <Slider
        min={0}
        max={5000000}
        step={10000}
        value={budget}
        onChange={(value) => setBudget(value)}
        trackStyle={{ backgroundColor: '#2176ff' }}
        handleStyle={{
          borderColor: '#2176ff',
          backgroundColor: 'white',
          borderWidth: 2,
        }}
        railStyle={{ backgroundColor: '#e9e9e9' }}
      />

      <div className="budget-inputs">
        <div className="budget-input-wrapper">
          <label>예산</label>
          <input
            type="text"
            inputMode="decimal"
            className="budget-input-slider"
            value={formatNumber(budget)}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetSlider;
