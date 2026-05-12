import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiEdit } from "react-icons/fi";
import "../../css/shopping/CartItem.css";

const CartItem = ({ item, isBackground, onDelete, onPriceSave }) => {
  const [isEditing, setIsEditing] = useState(false);

  // 뷰용 숫자 가격
  const [price, setPrice] = useState(item.price ?? 0);
  // 입력창용 문자열(빈칸 허용)
  const [priceInput, setPriceInput] = useState("");

  const inputRef = useRef(null);

  // 상위 값 동기화
  useEffect(() => {
    setPrice(item.price ?? 0);
    if (!isEditing) setPriceInput("");
  }, [item.price, isEditing]);

  // 편집 시작: 0원이면 빈칸, 0 초과면 해당 숫자 문자열
  const startEdit = useCallback(() => {
    setIsEditing(true);
    setPriceInput((prev) => (price > 0 ? String(price) : ""));
  }, [price]);

  // 편집 시작 시 자동 포커스 + 전체 선택
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 저장
  const handleSave = useCallback(() => {
    const trimmed = priceInput.trim();
    const next = trimmed === "" ? 0 : Number(trimmed);

    if (Number.isNaN(next) || next < 0) return; // 음수/NaN 방지

    // 변경 없으면 요청 스킵
    if (next === price) {
      setIsEditing(false);
      return;
    }

    onPriceSave(item.id, next);
    setPrice(next);
    setIsEditing(false);
  }, [priceInput, price, item.id, onPriceSave]);

  // 취소(ESC)
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setPriceInput("");
  }, []);

  // 키보드 핸들링
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // 숫자만 허용(빈칸 허용)
  const handleChange = (e) => {
    const v = e.target.value;
    // type="number"여도 브라우저마다 다를 수 있어 한번 더 필터
    if (v === "") return setPriceInput("");
    const digitsOnly = v.replace(/[^\d]/g, "");
    setPriceInput(digitsOnly);
  };

  // 유효성/변경 감지
  const nextNumber = priceInput.trim() === "" ? 0 : Number(priceInput);
  const isValid = !Number.isNaN(nextNumber) && nextNumber >= 0;
  const isDirty = nextNumber !== price;

  return (
    <div
      className="cart-item-container"
      style={{ backgroundColor: isBackground ? "white" : "transparent" }}
    >
      <img src={item.image} alt={item.name} className="cart-item-image" />

      <div className="cart-item-info">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-category">{item.category}</div>
      </div>

      <div className="cart-item-price">
        {isEditing ? (
          <>
            <input
              ref={inputRef}
              type="number"
              min="0"
              inputMode="numeric"
              pattern="[0-9]*"
              value={priceInput}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="cart-item-price-input"
              placeholder="가격 입력"
              aria-label="가격 입력"
            />
            <button
              className="cart-item-save"
              onClick={handleSave}
              disabled={!isValid || !isDirty}
              aria-disabled={!isValid || !isDirty}
            >
              저장
            </button>
          </>
        ) : (
          <div
            className="cart-item-price-view"
            onClick={startEdit}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" ? startEdit() : null)}
            aria-label="가격 수정"
          >
            <FiEdit />
            <span>{Number(price || 0).toLocaleString()} ₩</span>
          </div>
        )}
      </div>

      <button
        className="cart-item-delete"
        onClick={() => onDelete(item.id)}
        aria-label="아이템 삭제"
        title="삭제"
      >
        ✕
      </button>
    </div>
  );
};

export default CartItem;
