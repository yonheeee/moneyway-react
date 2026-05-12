import React from "react";
import api from "../../api/axios.js";
import "../../css/shopping/CartList.css";
import CartItemGroup from "./CartItemGroup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import hotelIcon from "../../images/shopping/hotel.svg";
import cafeIcon from "../../images/shopping/cafe.svg";
import activityIcon from "../../images/shopping/activity.svg";
import foodIcon from "../../images/shopping/food.svg";
import shoppingIcon from "../../images/shopping/shopping.svg";
import tourIcon from "../../images/shopping/tour.svg";

const CATEGORY_ORDER = [
  { name: "숙소", icon: hotelIcon, color: "#378cff" },
  { name: "식당", icon: foodIcon, color: "#ff4d4d" },
  { name: "관광지", icon: tourIcon, color: "#a259ff" },
  { name: "액티비티", icon: activityIcon, color: "#45cc54" },
  { name: "카페", icon: cafeIcon, color: "#f9851f" },
  { name: "쇼핑", icon: shoppingIcon, color: "#ff3e8d" },
];

const CartList = ({ cartItems, setCartItems }) => {
  
  const navigate = useNavigate();

  const handleDelete = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== cartId));
      toast.success("항목이 삭제되었습니다");
    } catch (error) {
      console.error("장바구니 항목 삭제 실패:", error);
      toast.error("항목 삭제 중 오류가 발생했습니다");
    }
  };

  const handlePriceSave = async (cartId, newPrice) => {
    try {
      await api.patch(`/cart/${cartId}`, { price: newPrice });
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartId ? { ...item, price: newPrice } : item
        )
      );
      toast.success("가격이 수정되었습니다");
    } catch (error) {
      console.error("가격 수정 실패:", error);
      toast.error("가격 수정 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="cartlist-container">
      <div className="cartlist-header">
        <div className="cartlist-header-left">
          <p>
            <span className="cartlist-highlight">일정 카트</span>
            에 일정을 담고
            <br />
            시간표에 추가해보세요
          </p>
        </div>
        <div className="cartlist-header-right">
          <button
            className="add-place-button"
            onClick={() => {
              navigate("/search");
            }}
          >
            장소 추가하기 +
          </button>
        </div>
      </div>

      <div className="cartlist-table-header">
        <div className="cartlist-table-title">수량 및 가격</div>
      </div>

      {CATEGORY_ORDER.map(({ name, icon, color }) => {
        const items = cartItems.filter((item) => item.category === name);
        return (
          <CartItemGroup
            key={name}
            category={name}
            icon={icon}
            color={color}
            items={items}
            onDelete={handleDelete}
            onPriceSave={handlePriceSave}
          />
        );
      })}
    </div>
  );
};

export default CartList;
