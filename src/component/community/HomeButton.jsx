import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaArrowLeft, FaPlus } from "react-icons/fa";
import "../../css/community/HomeButton.css";

const HomeButton = ({
  showBack = false,
  // showWrite를 넘기지 않으면(=undefined) 자동 감지 사용
  showWrite,
  writeTo = "/posts/create",
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 커뮤니티 홈 자동 감지
  const isCommunityHome = pathname === "/community";
  // nullish 병합: 명시(true/false)면 그 값, 아니면 자동 감지 사용
  const shouldShowWrite = showWrite ?? isCommunityHome;

  return (
    <div className="side-nav-wrapper">
      {showBack && (
        <div className="nav-top">
          <button
            className="side-btn post-back-btn"
            onClick={() => navigate(-1)}
            aria-label="이전으로"
            title="이전으로"
          >
            <FaArrowLeft size={24} />
          </button>
          <div className="top-bar" />
        </div>
      )}

      <div className={`nav-bottom ${showBack ? "with-bg" : ""}`}>
        <button
          className="side-btn home-btn"
          onClick={() => navigate("/community")}
          aria-label="커뮤니티 홈"
          title="커뮤니티 홈"
        >
          <FaHome size={24} />
        </button>

        {shouldShowWrite && (
          <button
            className="side-btn write-btn"
            onClick={() => navigate(writeTo)}
            aria-label="글쓰기"
            title="글쓰기"
          >
            <FaPlus size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeButton;
