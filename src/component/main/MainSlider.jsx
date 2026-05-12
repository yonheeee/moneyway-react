// src/component/main/MainSlider.jsx
import React, { useEffect, useState } from "react";
import "../../css/main/MainSlider.css";
import forthPanelSvg from "../../images/main/ForthPanel.png";
import noImage from "../../images/planning/noImage.svg";
// ✅ 프로젝트 axios 인스턴스 경로에 맞춰 수정
import api from "../../api/axios.js";

export default function MainSlider() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await api.get("/posts", { params: { page: 0, size: 60 } });

        const list = Array.isArray(res.data?.content)
          ? res.data.content
          : Array.isArray(res.data)
          ? res.data
          : [];

        // ✅ 점수 = 좋아요*2 + 스크랩
        const rankedTop3 = list
          .map((p) => ({
            ...p,
            _score: (p.likeCount ?? 0) * 2 + (p.scrapCount ?? 0),
          }))
          .sort((a, b) => b._score - a._score)
          .slice(0, 3)
          .map((p, idx) => ({
            id: p.postId ?? p.id ?? idx,
            title: p.title ?? "제목 없음",

            // ✅ 본문 대표 이미지(썸네일) 후보들
            image:
              p.thumbnailUrl ||
              p.images?.[0]?.url ||
              p.imageUrls?.[0] ||
              p.postImages?.[0]?.url ||
              null,

            // ✅ 작성자명
            author:
              p.writerInfo?.nickname ||
              p.authorName ||
              p.nickname ||
              "커뮤니티",

            // ✅ 작성자 프로필(아바타) 후보들
            avatar:
              p.writerInfo?.profileImageUrl ||
              p.writerInfo?.avatarUrl ||
              p.authorProfileImageUrl ||
              null,
          }));

        if (alive) setItems(rankedTop3);
      } catch (e) {
        console.error("추천 게시글 로드 실패:", e);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="main-slider">
      {/* 좌측 고정 블럭 */}
      <div className="ms-left">
        <p className="ms-eyebrow">커뮤니티 Pick</p>
        <h3 className="ms-heading">
          지금 가장 <span className="ms-hot">‘HOT’</span>한 제주는?
        </h3>
        <div className="ms-illustration">
          <img src={forthPanelSvg} alt="말풍선 일러스트" loading="lazy" />
        </div>
      </div>

      {/* 우측 3칸 그리드 */}
      <div className="ms-right">
        <div
          className="ms-grid"
          role="list"
          aria-busy={loading ? "true" : "false"}
        >
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {!loading && items.length === 0 && (
            <>
              <EmptyCard />
              <EmptyCard />
              <EmptyCard />
            </>
          )}

          {!loading &&
            items.length > 0 &&
            items.map((it) => <ArticleCard key={it.id} item={it} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------- Presentational ---------- */
function ArticleCard({ item }) {
  const handleClick = () => {
    window.location.href = `/posts/${item.id}`;
  };

  return (
    <article className="ms-card" role="listitem" onClick={handleClick}>
      <div className="ms-card-media">
        <img
          src={item.image || noImage}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            // 깨지면 noImageSvg로 교체 (무한루프 방지용 가드)
            if (e.currentTarget.src !== window.location.origin + noImage) {
              e.currentTarget.src = noImage;
            }
          }}
        />

        <div className="ms-card-gradient" />
      </div>

      <div className="ms-card-top">
        {item.avatar ? (
          <img
            className="ms-avatar"
            src={item.avatar}
            alt={`${item.author} 프로필`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.replaceWith(
                Object.assign(document.createElement("div"), {
                  className: "ms-avatar",
                })
              );
            }}
          />
        ) : (
          <div className="ms-avatar" aria-hidden />
        )}
        <span className="ms-author">{item.author}</span>
      </div>

      <h4 className="ms-card-title">{item.title}</h4>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="ms-card is-skeleton">
      <div className="ms-card-media">
        <div className="ms-skel media" />
      </div>
      <div className="ms-card-top">
        <div className="ms-skel avatar" />
        <div className="ms-skel name" />
      </div>
      <div className="ms-skel title" />
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="ms-card is-empty">
      <div className="ms-empty">추천 게시글이 아직 없어요 🙏</div>
    </div>
  );
}
