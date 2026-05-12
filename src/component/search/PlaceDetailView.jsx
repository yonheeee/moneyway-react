import React from "react";
import "../../css/search/PlaceDetailView.css";
import api from "../../api/axios.js";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaPhone,
  FaMapMarkerAlt,
  FaShareAlt,
  FaCopy,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";


import PlaceReview from "./PlaceReview";

/* =========================
   ⭐ 별점 표시 컴포넌트
   - value: 0~5 (소수 1자리까지 표시)
   - 0.25~0.74 => 하프, 0.75 이상 => 풀로 반올림
========================= */
function StarRating({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const decimal = v - full;

  const hasHalf = decimal >= 0.25 && decimal < 0.75;
  const extraFull = decimal >= 0.75 ? 1 : 0;

  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full + extraFull) {
      stars.push(<FaStar key={i} className="star-icon" />);
    } else if (i === full && hasHalf && extraFull === 0) {
      stars.push(<FaStarHalfAlt key={i} className="star-icon" />);
    } else {
      stars.push(<FaRegStar key={i} className="star-icon" />);
    }
  }

  return (
    <div className="rating-wrap">
      <div className="stars">{stars}</div>
      <span className="rating-num">{v.toFixed(1)}</span>
    </div>
  );
}

const PlaceDetailView = ({ place, onBack }) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(place.address || "");
    toast.success("주소가 복사되었습니다!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: place.title,
          text: "제주 여행지 추천!",
          url: window.location.href,
        })
        .catch((err) => console.log("공유 취소 또는 실패:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("공유 링크가 복사되었습니다!");
    }
  };

  const handleAddToCart = async () => {
    try {
      await api.post("/cart", { placeId: place.placeId });
      toast.success("일정에 추가되었습니다!");
    } catch (err) {
      toast.error("로그인이 필요한 기능입니다.");
      console.error(err);
    }
  };

  return (
    <>
      <button className="back-btn" onClick={onBack}>
        <FaArrowLeft />
      </button>

      <div className="place-detail">
        <div className="detail-header">
          <div className="title-section">
            <h2>{place.title}</h2>
            <div className="meta">
              <span className="category">{place.categoryName}</span>
            </div>
          </div>

          {/* 💛 별점 표시 */}
          <div className="rating-section">
            {place.rating ? (
              <StarRating value={place.rating} />
            ) : (
              <span className="no-rating">평가 없음</span>
            )}
          </div>
        </div>

        <div className="image-section">
          {[0].map((i) => (
            <div className="image-card" key={i}>
              {place.imageUrls?.[i] ? (
                <img src={place.imageUrls[i]} alt={`img-${i}`} />
              ) : (
                <div className="image-placeholder" />
              )}
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button onClick={handleCopyAddress}>
            <FaCopy style={{ marginRight: "6px" }} />
            주소 복사
          </button>
          <button onClick={handleShare}>
            <FaShareAlt style={{ marginRight: "6px" }} />
            공유
          </button>
          {place.phone && (
            <a href={`tel:${place.phone}`} style={{ textDecoration: "none" }}>
              <button>
                <FaPhone style={{ marginRight: "6px" }} />
                전화걸기
              </button>
            </a>
          )}
        </div>

        <button className="schedule-btn" onClick={handleAddToCart}>
          장바구니에 추가하기
        </button>

        <div className="info-section">
          <div className="info-row">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <div className="info-title">주소</div>
              <div className="info-desc">
                {place.address || "주소 정보 없음"}
              </div>
            </div>
          </div>

          {place.phone && (
            <div className="info-row">
              <FaPhone className="info-icon" />
              <div>
                <div className="info-title">전화번호</div>
                <div className="info-desc">
                  <a
                    href={`tel:${place.phone}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {place.phone}
                  </a>
                </div>
              </div>
            </div>
          )}

          {place.priceInfo && (
            <div className="info-row">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <div className="info-title">요금 정보</div>
                <div className="info-desc">{place.priceInfo}</div>
              </div>
            </div>
          )}

          {place.menu && (
            <div className="info-row">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <div className="info-title">메뉴</div>
                <div className="info-desc">{place.menu}</div>
              </div>
            </div>
          )}

          {place.description && (
            <div className="info-row">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <div className="info-title">장소 소개</div>
                <div className="info-desc">{place.description}</div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ 리뷰: 이름 제거 버전, prop은 reviews로 통일 */}
        <PlaceReview placeId={place.placeId} reviews={place.review} />
      </div>
    </>
  );
};

export default PlaceDetailView;