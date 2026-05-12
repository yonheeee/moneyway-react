import React, { useState } from "react";
import "../../css/community/CommunityMain.css";
import PostListForm from "./PostListForm";
import HomeButton from "./HomeButton";

const CommunityMain = () => {
  const [sortOption, setSortOption] = useState("LATEST");

  return (
    <>
      <HomeButton />
      <div className="community-container">
        <div className="community-header">
          <div className="list-dropdown-group">
            {/* 왼쪽: 타임라인 */}
            <div className="list-dropdown-title">
              <p>타임라인</p>
            </div>

            {/* 오른쪽: 최신순 + 좋아요순 */}
            <div className="list-dropdown">
              <button
                type="button"
                className="list-dropdown-btn"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                <span className="label">{getSortLabel(sortOption)}</span>
                <span className="icon">▼</span>
              </button>

              <div className="list-dropdown-menu" role="menu">
                <div role="menuitem" tabIndex={0} onClick={() => setSortOption("LATEST")}>
                  최신순
                </div>
                <div role="menuitem" tabIndex={0} onClick={() => setSortOption("LIKES")}>
                  좋아요순
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="post-list-container">
          <PostListForm sort={sortOption} />
        </div>
      </div>
    </>
  );
};

const getSortLabel = (value) => {
  switch (value) {
    case "LATEST":
      return "최신순";
    case "LIKES":
      return "좋아요순";
    default:
      return "정렬";
  }
};

export default CommunityMain;
