import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import useUserStore from "../../api/userStore";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentAlt,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import "../../css/community/PostDetail.css";
import LoadingSpinner from "../common/LoadingSpinner";

const formatDateTime = (dateInput) => {
  if (Array.isArray(dateInput) && dateInput.length >= 6) {
    const [year, month, day, hour, minute] = dateInput;
    return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  if (typeof dateInput === "string") {
    const date = new Date(dateInput);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  return "";
};

const Scrap = () => {
  const { user } = useUserStore();
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScraps = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await api.get(`/mypage/scraps`);
        const data = res.data;

        const posts = Array.isArray(data.content) ? data.content : data.scraps ?? [];
        const parsed = posts.map((p) => ({
          ...p,
          isLiked: p.liked,
          isScrapped: p.scrapped,
          isMine: p.mine,
        }));
        setScraps(parsed);
      } catch (err) {
        console.error("스크랩 목록 조회 실패:", err);
        toast.error("스크랩한 글을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchScraps();
  }, [user?.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="post-detail-container-all">
      {scraps.length === 0 ? (
        <p style={{ padding: "2rem", fontSize: "1.6rem", textAlign: "center" }}>
          스크랩한 글이 없습니다.
        </p>
      ) : (
        scraps.map((post) => (
          <Link
            to={`/posts/${post.postId}`}
            key={post.postId}
            className="post-detail-container post-list-card"
          >
            <div className="post-header">
              <div className="writer-info">
                <img
                  src={post.writerInfo?.profileImageUrl ?? "/default.png"}
                  alt="profile"
                />
                <div className="writer-meta">
                  <div className="writer-line">
                    <span className="nickname">
                      {post.writerInfo?.nickname}
                    </span>
                    <span className="created-at">
                      {formatDateTime(post.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {post.totalCost != null && post.totalCost > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                  }}
                >
                  <span className="budget-label">여행 예산</span>
                  <div className="budget">
                    ₩ {post.totalCost.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <h1 className="post-title">{post.title}</h1>
            <div className="post-content">{post.content}</div>

            <div className="post-images">
              {post.thumbnailUrl && (
                <img src={post.thumbnailUrl} alt="썸네일" />
              )}
            </div>

            <div className="post-actions">
              <button type="button" className="icon-group">
                {post.isLiked ? (
                  <FaHeart className="icon liked" />
                ) : (
                  <FaRegHeart className="icon" />
                )}
                {post.likeCount}
              </button>
              <button
                type="button"
                className="icon-group"
                style={{ cursor: "default" }}
              >
                <FaRegCommentAlt className="icon" />
                {post.commentCount}
              </button>
              <button type="button" className="icon-group">
                {post.isScrapped ? (
                  <FaBookmark className="icon scrapped" />
                ) : (
                  <FaRegBookmark className="icon" />
                )}
                {post.scrapCount}
              </button>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default Scrap;