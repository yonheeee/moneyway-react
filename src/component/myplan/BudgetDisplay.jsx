import React from 'react';
import { FiEdit } from "react-icons/fi"; 
import { FiAlertTriangle } from "react-icons/fi";
import '../../css/myplan/BudgetDisplay.css';

const BudgetDisplay = ({
  usedBudget,
  totalBudget,
  isEditMode,
  isEditingBudget,
  onBudgetClick,
  onBudgetChange,
  onBudgetBlur,
  onBudgetKeyDown,
  budgetInput,
  zeroBudgetDisplay = 'text',
}) => {
  const isOverBudget = usedBudget > totalBudget;
  const overAmount = usedBudget - totalBudget;

  const progressPercent =
    totalBudget > 0 ? Math.min(100, (usedBudget / totalBudget) * 100) : (usedBudget > 0 ? 100 : 0);

  const bubblePosition = Math.min(96, Math.max(4, progressPercent));

  return (
    <div className='plan-budget-right'>
    {isOverBudget && (
      <div className="budget-over-inline">
        <FiAlertTriangle className="alert-icon" />
        <span>₩{overAmount.toLocaleString()} 초과되었습니다.</span>
      </div>
    )}

    {/* 사용 예산 말풍선 */}
    <div className="budget-bubble-container">
      <div
        className={`budget-bubble ${isOverBudget ? 'over-budget' : ''}`}
        style={{ left: `${bubblePosition}%` }}
      >
        ₩{usedBudget.toLocaleString()}
        <div className="bubble-arrow"></div>
      </div>
    </div>

    {/* 프로그레스 바 */}
    <div className={`budget-progress-bar ${isOverBudget ? 'over' : ''}`}>
      
      <div
        className={`budget-progress-fill ${isOverBudget ? 'over' : ''}`}
        style={{ width: `${progressPercent}%` }}
      ></div>
    </div>

    {/* 예산 정보 */}
    <div className='total-budget'>
      <span>예산</span>
      {isEditMode && isEditingBudget ? (
        <input
          type="text"
          inputMode="numeric"
          value={budgetInput}
          onChange={(e) => {
            const newValue = e.target.value.replace(/^0+/, "");
            e.target.value = newValue;
            onBudgetChange(e);
          }}
          onBlur={onBudgetBlur}
          onKeyDown={onBudgetKeyDown}
          className="myplan-budget-input"
          autoFocus
        />
      ) : (
        <span
          onClick={isEditMode ? onBudgetClick : undefined}
          className={isEditMode ? 'budget-amount-clickable' : ''}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: isEditMode ? "pointer" : "default" }}
        >
          <FiEdit />
          {isEditMode && totalBudget === 0 ? (
            <span className="budget-placeholder">예산을 설정해주세요</span>
          ) : (
            `₩${(totalBudget || 0).toLocaleString()}`
          )}
             </span>
      )}
    </div>
  </div>
  );
};

export default BudgetDisplay;
