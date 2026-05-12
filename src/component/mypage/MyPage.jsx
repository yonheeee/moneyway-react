import React, { useState } from "react";
import Profile from "./Profile";
import ProfileChange from "./ProfileChange";
import MyArticles from "./MyArticles";
import Scrap from "./Scarp"; // 프로젝트 경로/이름 그대로 유지
import "../../css/mypage/MyPage.css";

const MyPage = () => {
  const [view, setView] = useState("scrap"); // 초기값 scrap

  const isEdit = view === "edit";

  return (
    <>

      {isEdit ? (
        <ProfileChange onBack={() => setView("scrap")} />
      ) : (
        <>
          <div className="profile-container">
            <Profile onEditClick={() => setView("edit")} />
          </div>

          <div className={`main-container`}>
            <div className="nav-bar" role="tablist" aria-label="MyPage 내비게이션">
              <button
                role="tab"
                aria-selected={view === "scrap"}
                aria-current={view === "scrap" ? "page" : undefined}
                className={view === "scrap" ? "active" : ""}
                onClick={() => setView("scrap")}
                title="스크랩 목록"
              >
                스크랩 목록
              </button>
              <button
                role="tab"
                aria-selected={view === "posts"}
                aria-current={view === "posts" ? "page" : undefined}
                className={view === "posts" ? "active" : ""}
                onClick={() => setView("posts")}
                title="내가 쓴 글"
              >
                내가 쓴 글
              </button>
            </div>

            {/* 탭 전환 시 부드럽게 등장하도록 key로 재마운트 */}
            <div className="sub-container" key={view} role="tabpanel">
              {view === "scrap" && <Scrap />}
              {view === "posts" && <MyArticles />}
            </div>
          </div>
        </>
      )}

  {/* Footer removed */}
    </>
  );
};

export default MyPage;
