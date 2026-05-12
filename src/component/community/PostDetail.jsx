import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../css/community/PostDetail.css";
import HomeButton from "./HomeButton";
import useUserStore from "../../api/userStore";
import api from "../../api/axios";
import LoadingSpinner from "../common/LoadingSpinner";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentAlt,
  FaBookmark,
  FaRegBookmark,
  FaArrowUp,
  FaEllipsisH,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const myProfileImg = user?.profileImageUrl;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [commentMenuOpen, setCommentMenuOpen] = useState(null);

  // ⏱ [YYYY, MM, DD, hh, mm, ss] → "2025.07.24 20:03"
  const formatDateTime = (arr) => {
    if (!Array.isArray(arr) || arr.length < 6) return "";
    const [year, month, day, hour, minute] = arr;
    const pad = (n) => String(n).padStart(2, "0");
    return `${year}.${pad(month)}.${pad(day)} ${pad(hour)}:${pad(minute)}`;
    // 초까지 쓰려면 :${pad(arr[5])} 추가
  };

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/comments/post/${postId}`);
      const raw = res.data || [];
      const parsedComments = raw.map((c) => ({
        ...c,
        isMine: c.mine,
      }));
      setComments(parsedComments);
    } catch (err) {
      console.error("댓글 조회 실패:", err);
      toast.error("댓글을 불러오는 데 실패했습니다.");
    }
  }, [postId]);

  const fetchPost = useCallback(async () => {
    try {
      const res = await api.get(`/posts/${postId}`);
      const raw = res.data;
      const parsedPost = {
        ...raw,
        isLiked: raw.liked,
        isScrapped: raw.scrapped,
        isMine: raw.mine,
        imageUrls: Array.isArray(raw.imageUrls) ? raw.imageUrls : [],
      };
      setPost(parsedPost);
    } catch (err) {
      console.error("게시글 조회 실패:", err);
      toast.error("게시글을 불러오는 데 실패했습니다.");
    }
  }, [postId]);

  useEffect(() => {
    if (user) {
      fetchPost();
      fetchComments();
    }
  }, [user, fetchPost, fetchComments]);

  const handleToggleLike = async () => {
    try {
      await api.post(`/posts/${postId}/like`);
      await fetchPost();
    } catch (err) {
      console.error("좋아요 실패:", err);
      toast.error("좋아요 처리에 실패했습니다.");
    }
  };

  const handleToggleScrap = async () => {
    try {
      await api.post(`/posts/${postId}/scrap`);
      await fetchPost();
    } catch (err) {
      console.error("스크랩 실패:", err);
      toast.error("스크랩 처리에 실패했습니다.");
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    try {
      await api.post("/comments", {
        postId: Number(postId),
        content: commentInput,
      });
      setCommentInput("");
      toast.success("댓글이 작성되었습니다.");
      await fetchComments();
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      toast.error("댓글 작성에 실패했습니다.");
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${postId}`);
      toast.success("게시글이 삭제되었습니다.");
      navigate("/community");
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success("댓글이 삭제되었습니다.");
      await fetchComments();
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      toast.error("댓글 삭제에 실패했습니다.");
    }
  };

  // =========================
  // 이미지 캐러셀 상태/로직
  // =========================
  const [imgPage, setImgPage] = useState(0);
  const IMAGES_PER_PAGE = 2;

  const imageUrls = post?.imageUrls ?? [];
  const totalImages = imageUrls.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

  const canPrev = imgPage > 0;
  const canNext = imgPage < totalPages - 1;

  const handlePrev = () => { if (canPrev) setImgPage((p) => p - 1); };
  const handleNext = () => { if (canNext) setImgPage((p) => p + 1); };

  const startIdx = imgPage * IMAGES_PER_PAGE;
  const visibleImages = imageUrls.slice(startIdx, startIdx + IMAGES_PER_PAGE);

  useEffect(() => { setImgPage(0); }, [totalImages]);

  if (!post) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <HomeButton showBack={true} />
      <div className="post-detail-container-all">
        <div className="post-detail-container">
          <div className="post-header">
            <div className="writer-info">
              <img src={post.writerInfo.profileImageUrl} alt="profile" />
              <div className="writer-meta">
                <div className="writer-line">
                  <span className="nickname">{post.writerInfo.nickname}</span>
                  <span className="created-at">
                    {post.createdAt && formatDateTime(post.createdAt)}
                  </span>
                  {/* ✅ 챌린지 배지 제거 */}
                </div>
              </div>
            </div>

            {/* 오른쪽: 예산 → 점3개 메뉴 */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                여행 예산
              </span>
              <div className="budget">₩ {post.totalCost?.toLocaleString?.()}</div>

              {post.isMine && (
                <div className="post-menu-wrapper">
                  <button
                    className="menu-button"
                    onClick={() => setPostMenuOpen(!postMenuOpen)}
                  >
                    <FaEllipsisH />
                  </button>
                  {postMenuOpen && (
                    <div className="dropdown-menu">
                      <div onClick={() => navigate(`/posts/${postId}/edit`)}>
                        수정하기
                      </div>
                      <div onClick={handleDeletePost}>삭제하기</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <h1 className="post-title">{post.title}</h1>
          <div className="post-content">{post.content}</div>

          {/* =========================
              이미지 캐러셀
             ========================= */}
          {totalImages > 0 && (
            <div className="post-images-carousel">
              <div className="carousel-track">
                {visibleImages.map((url, idx) => (
                  <div className="carousel-item" key={`${startIdx + idx}-${url}`}>
                    <img src={url} alt={`post-img-${startIdx + idx}`} loading="lazy" />
                  </div>
                ))}
              </div>

              {/* 3장 이상일 때만 화살표/도트 */}
              {totalImages > IMAGES_PER_PAGE && (
                <>
                  <button
                    className={`carousel-arrow left ${canPrev ? "" : "disabled"}`}
                    onClick={handlePrev}
                    aria-label="이전 이미지"
                    disabled={!canPrev}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className={`carousel-arrow right ${canNext ? "" : "disabled"}`}
                    onClick={handleNext}
                    aria-label="다음 이미지"
                    disabled={!canNext}
                  >
                    <FaChevronRight />
                  </button>

                  <div className="carousel-dots">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <span
                        key={i}
                        className={`dot ${i === imgPage ? "active" : ""}`}
                        onClick={() => setImgPage(i)}
                        role="button"
                        aria-label={`${i + 1} 페이지로 이동`}
                        tabIndex={0}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="post-actions">
            <button onClick={handleToggleLike}>
              {post.isLiked ? (
                <FaHeart className="icon liked" />
              ) : (
                <FaRegHeart className="icon" />
              )}{" "}
              {post.likeCount}
            </button>
            <button>
              <FaRegCommentAlt className="icon" /> {comments.length}
            </button>
            <button onClick={handleToggleScrap}>
              {post.isScrapped ? (
                <FaBookmark className="icon scrapped" />
              ) : (
                <FaRegBookmark className="icon" />
              )}{" "}
              {post.scrapCount}
            </button>
          </div>

          <div className="comments-section">
            {comments.map((c) => (
              <div key={c.commentId} className="comment">
                <img src={c.writerInfo.profileImageUrl} alt="commenter" />
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-nickname">{c.writerInfo.nickname}</span>
                    <span className="comment-date">{formatDateTime(c.createdAt)}</span>
                    {c.isMine && (
                      <div className="comment-menu-wrapper">
                        <button
                          className="menu-button"
                          onClick={() => {
                            setCommentMenuOpen(
                              commentMenuOpen === Number(c.commentId)
                                ? null
                                : Number(c.commentId)
                            );
                          }}
                        >
                          <FaEllipsisH />
                        </button>
                        {commentMenuOpen === c.commentId && (
                          <div className="dropdown-menu">
                            <div onClick={() => handleDeleteComment(c.commentId)}>
                              삭제하기
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p>{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="comment-input-row">
            {myProfileImg && (
              <img src={myProfileImg} alt="me" className="comment-profile-left" />
            )}
            <input
              type="text"
              placeholder="댓글을 입력해주세요."
              className="comment-input-box"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <button className="comment-submit-btn" onClick={handleAddComment}>
              <FaArrowUp />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetail;
