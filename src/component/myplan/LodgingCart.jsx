import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import hotelIcon from "../../images/shopping/hotel.svg";
import '../../css/myplan/ScheduleCart.css';

const DraggableLodgingItem = ({ item, isEditMode, onContextMenu }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.cartId,
    data: { ...item, origin: 'lodging' },
    disabled: !isEditMode,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditMode ? 'grab' : 'default',
  };

  const handleContextMenu = (e) => {
    if (onContextMenu) onContextMenu(e, item);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isEditMode ? listeners : {})}
      onContextMenu={handleContextMenu}
    >
      <div className="schedule-cart-card" style={{ background: "#e8f5fa" }}>
        <div className="cart-category-row">
          <img src={hotelIcon} alt="숙소" className="cart-icon" />
          <span className="cart-category-text" style={{ color: "#339af0" }}>
            숙소
          </span>
        </div>
        <div className="cart-place-name">
          {item.placeName || item.name || item.title}
        </div>
        <div className="cart-price">₩ {(item.price || 0).toLocaleString()}</div>
      </div>
    </div>
  );
};

const LodgingCart = ({ cartItems = [], isEditMode, onContextMenu }) => {
  const lodgingItems = cartItems.filter(
    (item) => item.category === '숙소' || item.category?.includes('숙소')
  );

  return (
    <div className="side-card-container">
      <h3>숙소 카드</h3>
      <div className="cart-list">
        {lodgingItems.length === 0 && (
          <p className="empty-text">숙소 정보가 없습니다</p>
        )}
        {lodgingItems.map((item) => (
          <DraggableLodgingItem
            key={item.cartId || item.id}
            item={item}
            isEditMode={isEditMode}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    </div>
  );
};

export default LodgingCart;
