import React from "react";
import CartItem from "./CartItem";

const CartItemGroup = ({ category, icon, color, items, onDelete, onPriceSave }) => {
  return (
    <div className="cart-category-block">
      <div
        className="cart-category-header"
        style={{ borderBottom: `1px solid ${color}` }}
      >
        <div className="cart-category-left">
          <img src={icon} alt={category} className="cart-category-icon" />
          <span className="cart-category-title" style={{ color }}>
            {category}
          </span>
        </div>
        <span className="cart-category-count" style={{ color }}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="cart-category-empty">{category} 일정이 없습니다.</div>
      ) : (
        items.map((item, idx) => (
          <CartItem
            key={item.id}
            item={item}
            isBackground={idx % 2 === 0}
            onDelete={onDelete}
            onPriceSave={onPriceSave}
          />
        ))
      )}
    </div>
  );
};

export default CartItemGroup;
