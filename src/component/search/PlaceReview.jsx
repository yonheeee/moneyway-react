import React, { useEffect, useState, useMemo } from "react";
import "../../css/search/PlaceReview.css";

export default function PlaceReview({
  placeId,
  reviews: reviewsProp,
  initialCount = 3,
  pageSize = 3,
  useStrictMatch = false,
}) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showCount, setShowCount] = useState(initialCount);

  const normalizedFromProp = useMemo(
    () => normalizeReviews(reviewsProp, placeId),
    [reviewsProp, placeId]
  );

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      let base = [];

      if (normalizedFromProp.length > 0) {
        base = normalizedFromProp;
      } else {
        const matched = DUMMY.filter((r) => r.placeId === placeId);
        base = matched.length > 0 ? matched : (useStrictMatch ? [] : DUMMY.slice(0, 3));
      }

      setReviews(base);
      setLoading(false);
    }, 120);

    return () => clearTimeout(t);
  }, [placeId, normalizedFromProp, useStrictMatch]);

  const visible = reviews.slice(0, showCount);

  return (
    <section className="reviews">
      <div className="reviews__head">
        <h3 className="reviews__title">리뷰</h3>
        <div className="reviews__meta">
          <span className="reviews__count">({reviews.length})</span>
        </div>
      </div>

      {loading ? (
        <ul className="rv-list">
          {Array.from({ length: 2 }).map((_, i) => (
            <li className="rv-item rv-skeleton" key={i}>
              <div className="sk sk-line" />
              <div className="sk sk-block" />
            </li>
          ))}
        </ul>
      ) : reviews.length ? (
        <>
          <ul className="rv-list">
            {visible.map((r) => (
              <li className="rv-item" key={r.id}>
                <p className="rv-name">{r.authorName}</p>
                <p className="rv-content">{r.content}</p>
              </li>
            ))}
          </ul>
          {showCount < reviews.length && (
            <button className="rv-more-list" onClick={() => setShowCount((c) => c + pageSize)}>
              더 보기
            </button>
          )}
        </>
      ) : (
        <div className="rv-empty">아직 등록된 리뷰가 없습니다.</div>
      )}
    </section>
  );
}

/* 리뷰 정규화 유틸 */
function normalizeReviews(input, placeId) {
  if (!input) return [];

  if (typeof input === "string") {
    const content = input.trim();
    if (!content) return [];
    return [{ id: `${placeId || "p"}-r0`, placeId, content, authorName: "익명1" }];
  }

  if (Array.isArray(input) && input.every((v) => typeof v === "string")) {
    return input
      .map((content, i) => ({
        id: `${placeId || "p"}-rs${i}`,
        placeId,
        content: content.trim(),
        authorName: "익명1" 
      }))
      .filter((r) => r.content);
  }

  if (Array.isArray(input) && input.every((v) => typeof v === "object" && v)) {
    return input
      .map((r, i) => {
        const content = (r.content ?? "").toString().trim();
        if (!content) return null;
        return { id: r.id || `${placeId || "p"}-ro${i}`, placeId, content };
      })
      .filter(Boolean);
  }

  return [];
}

/* 더미 데이터 */
const DUMMY = [
  {
    id: "r1",
    placeId: "demo-1",
    authorName: "최지인",
    content: "사진보다 실제가 더 예뻐요. 주차 편하고 근처에 카페도 많아서 동선 짜기 좋아요.",
  },
  {
    id: "r2",
    placeId: "demo-1",
    authorName: "정재민",
    content: "뷰가 좋아요. 다만 주말엔 대기줄이 길었어요. 우천 시 실내 대체 동선 있으면 더 좋을 듯.",
  },
  {
    id: "r3",
    placeId: "demo-2",
    authorName: "이강현",
    content: "무난합니다. 아침 일찍 가면 조용해요. 기대치가 높았던 탓에 약간의 아쉬움은 있었어요.",
  },
];
