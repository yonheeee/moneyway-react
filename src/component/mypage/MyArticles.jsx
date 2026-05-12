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
import LoadingSpinner from "../common/LoadingSpinner"; // ✅ 스피너 컴포넌트 import

const formatDateTime = (value) => {
  const pad = (n) => String(n).padStart(2, "0");

  // 배열 형식 (예: [2025, 7, 25, 13, 46, 50])
  if (Array.isArray(value) && value.length >= 6) {
    const [year, month, day, hour, minute] = value;
    return `${year}.${pad(month)}.${pad(day)} ${pad(hour)}:${pad(minute)}`;
  }

  // ISO 문자열 형식 (예: "2025-07-25T13:46:50")
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
        date.getDate()
      )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
  }

  return ""; // 그 외는 빈 문자열
};

const MyArticles = () => {
  const { user } = useUserStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await api.get(`/posts/user/${user.id}`);
        const parsedPosts = (res.data || []).map((p) => ({
          ...p,
          isLiked: p.liked,
          isScrapped: p.scrapped,
          isMine: p.mine,
        }));
        setPosts(parsedPosts);
      } catch (err) {
        console.error("내 글 목록 조회 실패:", err);
        toast.error("내가 쓴 글을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="post-detail-container-all">
      {posts.length === 0 ? (
        <p style={{ padding: "2rem", fontSize: "1.6rem" }}>
          작성한 게시글이 없습니다.
        </p>
      ) : (
        posts.map((post) => (
          <Link
            to={`/posts/${post.postId}`}
            key={post.postId}
            className="post-detail-container post-list-card"
          >
            <div className="post-header">
              <div className="writer-info">
                <img src={post.writerInfo.profileImageUrl} alt="profile" />
                <div className="writer-meta">
                  <div className="writer-line">
                    <span className="nickname">{post.writerInfo.nickname}</span>
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

export default MyArticles;
