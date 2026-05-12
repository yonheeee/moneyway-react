import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/community/PostDetail.css";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentAlt,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";

// ✅ 로컬 대체 이미지(경로에 맞게 조정)
import noImage from "../../images/planning/noImage.svg";

// 날짜 → "YYYY.MM.DD HH:mm" (배열/문자열 모두 지원)
const formatDateTime = (v) => {
  const pad = (n) => String(n).padStart(2, "0");

  if (Array.isArray(v) && v.length >= 6) {
    const [y, m, d, h, min] = v;
    return `${y}.${pad(m)}.${pad(d)} ${pad(h)}:${pad(min)}`;
  }
  if (typeof v === "string") {
    const t = new Date(v);
    if (!Number.isNaN(t.getTime())) {
      return `${t.getFullYear()}.${pad(t.getMonth() + 1)}.${pad(t.getDate())} ${pad(
        t.getHours()
      )}:${pad(t.getMinutes())}`;
    }
  }
  return "";
};

// 공통 onError 핸들러(무한 루프 방지)
const useImgFallback = (fallbackSrc) => (e) => {
  if (e?.target && !e.target.dataset.fallbackApplied) {
    e.target.dataset.fallbackApplied = "1";
    e.target.src = fallbackSrc;
  }
};

const PostListForm = ({ sort = "LATEST", filter = "ALL" }) => {
  const [posts, setPosts] = useState([]);
  const onImgError = useImgFallback(noImage);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/posts", { params: { sort } });
        const parsed = (res.data?.content || []).map((p) => ({
          ...p,
          isLiked: p.liked,
          isScrapped: p.scrapped,
          isMine: p.mine,
        }));
        setPosts(parsed);
      } catch (err) {
        console.error("게시글 목록 조회 실패:", err);
        toast.error("게시글 목록을 불러오지 못했습니다.");
      }
    })();
  }, [sort, filter]);

  const handleToggleLike = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? (p.likeCount ?? 0) - 1 : (p.likeCount ?? 0) + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error("좋아요 실패:", err);
      toast.error("좋아요 처리에 실패했습니다.");
    }
  };

  const handleToggleScrap = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/posts/${postId}/scrap`);
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId
            ? {
                ...p,
                isScrapped: !p.isScrapped,
                scrapCount: p.isScrapped ? (p.scrapCount ?? 0) - 1 : (p.scrapCount ?? 0) + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error("스크랩 실패:", err);
      toast.error("스크랩 처리에 실패했습니다.");
    }
  };

  return (
    <div className="post-detail-container-all">
      {posts.map((post) => (
        <Link
          to={`/posts/${post.postId}`}
          key={post.postId}
          className="post-detail-container post-list-card"
        >
          <div className="post-header">
            <div className="writer-info">
              <img
                src={post.writerInfo?.profileImageUrl || noImage}
                alt="profile"
                onError={onImgError}
              />
              <div className="writer-meta">
                <div className="writer-line">
                  <span className="nickname">{post.writerInfo?.nickname || "사용자"}</span>
                  <span className="created-at">{formatDateTime(post.createdAt)}</span>
                </div>
              </div>
            </div>

            {post.totalCost != null && post.totalCost > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <span className="budget-label">여행 예산</span>
                <div className="budget">₩ {(post.totalCost ?? 0).toLocaleString()}</div>
              </div>
            )}
          </div>

          <h1 className="post-title">{post.title}</h1>

          {/* 🔹 리스트용 본문 미리보기 (줄수는 여기서 조절) */}
          <div className="post-excerpt" style={{ "--lines": 7 }}>
            {post.content}
          </div>

          {post.thumbnailUrl && (
            <div className="post-image">
              <img src={post.thumbnailUrl} alt="썸네일" onError={onImgError} />
            </div>
          )}

          <div className="post-actions">
            <button
              type="button"
              className="icon-group"
              aria-label={post.isLiked ? "좋아요 취소" : "좋아요"}
              onClick={(e) => handleToggleLike(e, post.postId)}
            >
              {post.isLiked ? <FaHeart className="icon liked" /> : <FaRegHeart className="icon" />}
              {post.likeCount ?? 0}
            </button>

            <button type="button" className="icon-group" style={{ cursor: "default" }} aria-label="댓글 수">
              <FaRegCommentAlt className="icon" />
              {post.commentCount ?? 0}
            </button>

            <button
              type="button"
              className="icon-group"
              aria-label={post.isScrapped ? "스크랩 취소" : "스크랩"}
              onClick={(e) => handleToggleScrap(e, post.postId)}
            >
              {post.isScrapped ? <FaBookmark className="icon scrapped" /> : <FaRegBookmark className="icon" />}
              {post.scrapCount ?? 0}
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PostListForm;
