import React from "react";
import "../../css/search/PlaceCard.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const PlaceCard = ({ place, onClick }) => {
  const {
    title,
    categoryName,
    address,
    status,
    rating = 0,
    imageUrls = [],
  } = place;

  // ⭐ 별점 아이콘 배열 생성 (소수점 반영)
  const stars = [];
  const v = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.floor(v);
  const decimal = v - full;
  const hasHalf = decimal >= 0.25 && decimal < 0.75;
  const extraFull = decimal >= 0.75 ? 1 : 0;

  for (let i = 0; i < 5; i++) {
    if (i < full + extraFull) {
      stars.push(<FaStar key={i} className="star filled" />);
    } else if (i === full && hasHalf && extraFull === 0) {
      stars.push(<FaStarHalfAlt key={i} className="star half" />);
    } else {
      stars.push(<FaRegStar key={i} className="star" />);
    }
  }

  return (
    <div
      className="place-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="card-header">
        <div>
          <span className="place-title">{title}</span>
          <span className="place-rating">
            {rating ? (
              <>
                {stars}
                <span className="rating-num">{v.toFixed(1)}</span>
              </>
            ) : (
              <span className="no-rating">평가 없음</span>
            )}
          </span>

          <p className="place-status">{status}</p>
        </div>
      </div>

      <div className="card-subinfo">
        <span className="place-category">{categoryName}</span>
        <span className="place-section">/</span>
        <span className="place-address">{address}</span>
      </div>

      <div className="place-images">
        {imageUrls.slice(0, 2).map((url, idx) => (
          <div
            key={idx}
            className="place-image-box"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
    </div>
  );
};

export default PlaceCard;
