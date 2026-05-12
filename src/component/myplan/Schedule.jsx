import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import '../../css/myplan/Schedule.css';

import BudgetDisplay from './BudgetDisplay';

import hotelIcon from "../../images/shopping/hotel.svg";
import cafeIcon from "../../images/shopping/cafe.svg";
import activityIcon from "../../images/shopping/activity.svg";
import foodIcon from "../../images/shopping/food.svg";
import shoppingIcon from "../../images/shopping/shopping.svg";
import tourIcon from "../../images/shopping/tour.svg";

const API_CATEGORY_TO_KOREAN = {
    'ACCOMMODATION': '숙소',
    'RESTAURANT': '식당',
    'TOURIST_ATTRACTION': '관광지',
    'ACTIVITY': '액티비티/체험',
    'CAFE': '카페',
    'SHOPPING': '쇼핑',
};

const translateCategory = (apiCategory) => {
    if (Object.values(API_CATEGORY_TO_KOREAN).includes(apiCategory)) {
        return apiCategory;
    }
    return API_CATEGORY_TO_KOREAN[apiCategory] || apiCategory;
};

const CATEGORY_ORDER = [
    { name: "숙소", icon: hotelIcon },
    { name: "식당", icon: foodIcon },
    { name: "관광지", icon: tourIcon },
    { name: "액티비티/체험", icon: activityIcon },
    { name: "카페", icon: cafeIcon },
    { name: "쇼핑", icon: shoppingIcon },
];

function DroppablePlannerCell({ day, time, disabled }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${day}-${time}`,
        disabled: disabled,
    });
    return (
        <div
            ref={setNodeRef}
            style={{ backgroundColor: isOver ? '#e0f7ff' : undefined }}
            className='grid-cell planner-cell'
        />
    );
}

const getCategoryIcon = (categoryName) => {
    const category = CATEGORY_ORDER.find(c => c.name === categoryName);
    return category ? <img src={category.icon} alt={categoryName} className="item-icon" /> : null;
};

const toCssCategory = (apiCategory) => {
    if (!apiCategory) return '기본';
    
    const koreanCategory = API_CATEGORY_TO_KOREAN[apiCategory] || apiCategory;
    
    return koreanCategory.replace('/', '-');
};

const ScheduleItem = ({
    item, day, slotHeight, isEditMode, onItemDeleted, onItemUpdated, onContextMenu, timeSlotsLength,
}) => {
    const dndId = `${item.cartId || item.placeId || item.id}-${day}-${item.time}-${item.duration}`;
    const displayCategory = translateCategory(item.category);
    
    const cssCategoryClass = toCssCategory(item.category);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: dndId,
        data: { ...item, origin: 'schedule', originalDay: day },
        disabled: !isEditMode,
    });

    function getTimeTop(time) {
        const [h, m] = time.split(':').map(Number);
        return ((h - 8) + (m >= 30 ? 0.5 : 0)) * 10;
    }

    const H_MARGIN_REM = 1;
    const V_GAP_REM = 2;
    const GRID_TOTAL_REM = timeSlotsLength * 10;
    const startTop = getTimeTop(item.time) + V_GAP_REM / 2;
    let height = (item.duration || 1) * 10 - V_GAP_REM;

    if (startTop + height > GRID_TOTAL_REM) {
        height = GRID_TOTAL_REM - startTop;
        if (height < 0) height = 0;
    }

    const style = {
        top: `${startTop}rem`,
        height: `${height}rem`,
        left: `${H_MARGIN_REM}rem`,
        right: `${H_MARGIN_REM}rem`,
        position: 'absolute',
        zIndex: transform ? 999 : 'auto',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition: isDragging ? 'none' : 'box-shadow 0.1s'
    };
    const dragAreaStyle = {
        width: '100%', height: '100%', position: 'absolute', top: 0, left: 0,
        zIndex: 2, cursor: isEditMode ? 'grab' : 'default', background: 'none'
    };

    const handleContextMenu = (e) => {
        if (!isEditMode) return;
        if (onContextMenu) onContextMenu(e, item, day);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`schedule-item schedule-item-card ${cssCategoryClass}`}
            onContextMenu={handleContextMenu}
        >
            <div
                className="item-content"
                {...(isEditMode ? listeners : {})}
                style={dragAreaStyle}
            >
                <div className="item-category-info">
                    {getCategoryIcon(displayCategory)}
                    <span className="item-category-name">{displayCategory}</span>
                </div>
                <div className="item-name">{item.placeName || item.name}</div>
                <div className="item-cost">₩ {(item.cost || item.price || 0).toLocaleString()}</div>
            </div>
        </div>
    );
};

// 새로운 컴포넌트: 애니메이션과 함께 Day 추가
const DayUnlockOverlay = ({ onAddDay, dayIndex }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        
        // 애니메이션 시작
        setIsAnimating(true);
        
        // 애니메이션 완료 후 Day 추가
        setTimeout(() => {
            onAddDay();
            setIsAnimating(false);
        }, 750); // 애니메이션 duration과 맞춤
    };

    return (
        <div className="day-locked-mask">
            <div 
                className={`day-locked-overlay ${isAnimating ? 'ripple-active' : ''}`}
                onClick={handleClick}
                style={{ 
                    cursor: 'pointer',
                    transition: isAnimating ? 'opacity 0.75s ease-out' : 'none',
                    opacity: isAnimating ? 0 : 1
                }}
            >
                <span className="plus">+</span>
            </div>
        </div>
    );
};

const Schedule = ({
    dailySchedules, 
    planDetails,
    timeSlots,
    onContextMenu,
    slotHeight,
    isEditingBudget,
    onBudgetClick,
    onBudgetChange,
    onBudgetBlur,
    onBudgetKeyDown,
    budgetInput,
    isEditMode,
    isEditingTitle,
    titleInput,
    onTitleClick,
    onTitleChange,
    onTitleBlur,
    onTitleKeyDown,
    enabledDays,
    onAddDay,
    planDurationStr,
}) => {

    const getProfileImage = () => {
        if (planDetails.profileImageUrl) return planDetails.profileImageUrl;
        if (planDetails.thumbnailUrl) return planDetails.thumbnailUrl;
        
        const username = planDetails.username || planDetails.author || '사용자';
        const firstChar = username.charAt(0).toUpperCase();
        
        return `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%0A%20%20%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23FFD3E0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2250%22%20font-family%3D%22%27Arial%27%2C%20sans-serif%22%20font-size%3D%2250%22%20fill%3D%22%23FFFFFF%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E${firstChar}%3C%2Ftext%3E%0A%3C%2Fsvg%3E%0A`;
    };

    const handleImageError = (e) => {
        console.warn('Profile image failed to load, using fallback');
        const username = planDetails.username || planDetails.author || '사용자';
        const firstChar = username.charAt(0).toUpperCase();
        
        e.target.src = `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%0A%20%20%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23FFD3E0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2250%22%20font-family%3D%22%27Arial%27%2C%20sans-serif%22%20font-size%3D%2250%22%20fill%3D%22%23FFFFFF%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E${firstChar}%3C%2Ftext%3E%0A%3C%2Fsvg%3E%0A`;
    };
    
    return (
        <>
            <div className='plan-info-card'>
                <div className='plan-details-left'>
                <img
                    src={getProfileImage()} 
                    alt="user avatar"
                    className='user-avatar'
                    onError={handleImageError} 
                />
                    <div className='plan-text-info'>
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={titleInput}
                                onChange={onTitleChange}
                                onBlur={onTitleBlur}
                                onKeyDown={onTitleKeyDown}
                                className="title-edit-input"
                                placeholder="제목을 입력하세요"
                                autoFocus
                            />
                        ) : (
                            <h2
                                className={`plan-title ${isEditMode ? 'editable' : ''}`}
                                onClick={isEditMode ? onTitleClick : undefined}
                            >
                                {planDetails.title || <span className="placeholder-text">제목을 입력하세요</span>}
                                {isEditMode && ' ✎'}
                            </h2>
                        )}
                        <p className='plan-duration'>{planDurationStr}</p>
                    </div>
                </div>
                <BudgetDisplay
                    usedBudget={planDetails.usedBudget || 0}
                    totalBudget={planDetails.totalBudget || 0}
                    isEditMode={isEditMode}
                    isEditingBudget={isEditingBudget}
                    budgetInput={budgetInput}
                    onBudgetClick={onBudgetClick}
                    onBudgetChange={onBudgetChange}
                    onBudgetBlur={onBudgetBlur}
                    onBudgetKeyDown={onBudgetKeyDown}
                />
            </div>

            <div className='schedule-grid'>
                <div className='time-column'>
                    <div className='header-cell' style={{ borderBottomColor: '#dee2e6' }}></div>
                    {timeSlots.map(time => (
                        <div key={time} className='time-cell'>{time}</div>
                    ))}
                </div>

                <div className='days-column-container'>
                    {Array.from({ length: 4 }, (_, i) => `Day ${i + 1}`).map((day, idx) => {
                        // DAY1은 항상 열려있고, 나머지는 enabledDays에 따라 결정
                        const isOpen = idx === 0 || idx < enabledDays;
                        const isNextDay = idx === enabledDays;

                        return (
                            <div key={day} className={`day-column ${!isOpen ? "disabled" : ""}`}>
                                <div className='header-cell'>{day}</div>
                                <div
                                    className="planner-content-wrapper"
                                    style={{ minHeight: `${timeSlots.length * 10}rem` }}
                                >
                                    {timeSlots.map(time => (
                                        <DroppablePlannerCell
                                            key={time}
                                            day={day}
                                            time={time}
                                            disabled={!isOpen}
                                        />
                                    ))}
                                    {isOpen && (dailySchedules[day] || []).map(item => (
                                        <ScheduleItem
                                            key={item.id || item.cartId || item.placeId}
                                            item={item}
                                            day={day}
                                            slotHeight={slotHeight}
                                            isEditMode={isEditMode}
                                            onContextMenu={onContextMenu}
                                            timeSlotsLength={timeSlots.length}
                                        />
                                    ))}
                                    
                                    {!isOpen && isEditMode && (
                                        isNextDay ? (
                                            <DayUnlockOverlay 
                                                onAddDay={onAddDay}
                                                dayIndex={idx}
                                            />
                                        ) : (
                                            <div className="day-locked-mask">
                                                <div className="day-locked-overlay disabled-day">
                                                    {/* 비활성화된 Day는 + 버튼 없음 */}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Schedule;