import React, { useState } from 'react';
import '../../css/myplan/TimeSelectionModal.css';

// ScheduleCart와 동일한 카테고리별 스타일 및 아이콘
import hotelIcon from "../../images/shopping/hotel.svg";
import cafeIcon from "../../images/shopping/cafe.svg";
import activityIcon from "../../images/shopping/activity.svg";
import foodIcon from "../../images/shopping/food.svg";
import shoppingIcon from "../../images/shopping/shopping.svg";
import tourIcon from "../../images/shopping/tour.svg";

const getCartStyle = (category = "") => {
  if (category.includes("액티비티")) return { icon: activityIcon, color: "#7ddc7e", bg: "#f6fff2" };
  if (category.includes("쇼핑")) return { icon: shoppingIcon, color: "#f06595", bg: "#fff0f6" };
  if (category.includes("식당")) return { icon: foodIcon, color: "#fa5252", bg: "#fff6f3" };
  if (category.includes("카페")) return { icon: cafeIcon, color: "#fab005", bg: "#fffbe4" };
  if (category.includes("숙소")) return { icon: hotelIcon, color: "#339af0", bg: "#e8f5fa" };
  if (category.includes("관광")) return { icon: tourIcon, color: "#845ef7", bg: "#f4f2fd" };
  return { icon: activityIcon, color: "#7ddc7e", bg: "#f6fff2" };
};

const TimeSelectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  category,
  step = 'start',
  onBack 
}) => {
  const [selectedTime, setSelectedTime] = useState('14:00'); // 기본값 오후 2:00

  if (!isOpen) return null;

  const timeOptions = [];
  for (let h = 8; h < 23; h++) {
    timeOptions.push(`${String(h).padStart(2, '0')}:00`);
  }

  const handleConfirm = () => {
    onConfirm(selectedTime);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const starttitle = step === 'start' ? '시작 시간을 선택해주세요' : '종료 시간을 선택해주세요';
  const subtitle = step === 'start' 
    ? '입력된 시간에 맞춰 일정이 시간표에 추가됩니다'
    : '입력된 시간에 맞춰 일정의 시간표에 추가됩니다';

  // 카테고리에 맞는 스타일 가져오기
  const { icon, color } = getCartStyle(category);

  return (
    <div className="time-modal-overlay" onClick={handleBackdropClick}>
      <div className="time-modal-container">
        <div className="time-modal-header">

          <div className="activity-badge">
            <img src={icon} alt={category} className="activity-icon-img" style={{ width: '2rem', height: '2rem' }} />
            <span className="activity-text" style={{ color }}>{category || '액티비티'}</span>
            <span className="activity-category">[{itemName}]</span>
          </div>

          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="time-modal-content">
          
        <div className="time-modal-backarrow">
          <button 
            className="time-back-button"
            onClick={() => {
              if (step === "start") {
                onClose(); 
              } else {
                onBack();    
              }
            }}
          >
            ←
          </button>
          <h2 className="time-modal-title">{starttitle}</h2>
        </div>

          <p className="time-modal-subtitle">{subtitle}</p>
          
          <div className="time-selection-area">
            <div className="time-options">
              {timeOptions.map(time => (
                <button
                  key={time}
                  className={`time-option ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {step === 'start' ? '시작' : '종료'} {time}
                </button>
              ))}
            </div>
          </div>
          
          <button className="confirm-button" onClick={handleConfirm}>
            {step === 'start' ? '다음' : '확인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionModal;