// src/components/cart/CartMain.js

import React, { useEffect, useState } from "react";
import CartList from "./CartList";
import TotalCart from "./TotalCart";
import api from "../../api/axios";
import noImage from "../../images/planning/noImage.svg";
import MyPlan from "../mypage/Myplan"; 
import "../../css/shopping/TotalCart.css"; 

const CartMain = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false); 

  const openPlanModal = () => setShowPlanModal(true);
  const closePlanModal = () => setShowPlanModal(false);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      const { cartItems } = response.data;

      const mappedItems = cartItems.map((item) => ({
        id: item.cartId,
        placeId: item.placeId,
        name: item.placeName,
        category: item.category,
        image: item.imageUrl || noImage,
        price: item.price,
        address: item.address,
      }));

      setCartItems(mappedItems);
    } catch (error) {
      console.error("장바구니 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    margin: "0 auto",
  };
  const cartLeft = {
    flex: "1",
    display: "flex",
    justifyContent: "center",
    marginLeft: "2rem",
  };
  const cartRight = {
    flex: "1",
    display: "flex",
    justifyContent: "center",
  };

  return (
    <>
      <div style={containerStyle}>
        <div style={cartLeft}>
          <CartList cartItems={cartItems} setCartItems={setCartItems} />
        </div>
        <div style={cartRight}>
          {/* 💡 5. TotalCart에 모달을 여는 함수를 props로 전달 */}
          <TotalCart cartItems={cartItems} onOpenModal={openPlanModal} />
        </div>
      </div>

      {/* 💡 6. 모달 JSX를 CartMain에 직접 추가 */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={closePlanModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closePlanModal}>
              &times;
            </button>
            <h3>플랜 선택</h3>
            <MyPlan onClose={closePlanModal} />
          </div>
        </div>
      )}
    </>
  );
};

export default CartMain;