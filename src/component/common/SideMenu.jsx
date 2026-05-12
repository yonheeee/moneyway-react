// src/components/common/SideMenu.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import useUserStore from "../../api/userStore";
import api from "../../api/axios";
import "../../css/common/SideMenu.css";

const SLIDE_MS = 350; // CSS transition 시간과 반드시 동일

const SideMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const isLoggedIn = !!user;

  // 슬라이드 인/아웃 제어
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // mount 후 한 프레임 뒤 open → 트랜지션 동작
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    // 스크롤 잠금
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
    };
  }, []);

  const startClose = useCallback(() => {
    if (closing) return;
    setOpen(false);
    setClosing(true);
    setTimeout(() => {
      onClose?.(); // 애니메이션 끝나고 부모에게 언마운트 요청
    }, SLIDE_MS);
  }, [closing, onClose]);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && startClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startClose]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      logout();
      navigate("/");
      toast.success("로그아웃 되었습니다.");
      startClose();
    } catch (err) {
      console.error("로그아웃 에러:", err);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const confirmIfDirty = useCallback(() => {
    try {
      const isOnMyPlan = window.location.pathname.startsWith('/myplan');
      if (isOnMyPlan && typeof window !== 'undefined' && window.__MYPLAN_DIRTY__) {
        return window.confirm('저장되지 않은 변경사항이 있습니다. 이동하시겠습니까?');
      }
    } catch (_) {}
    return true;
  }, []);

  const handleAddPlanClick = useCallback(async () => {
    if (!confirmIfDirty()) return;
    
    try {
      const res = await api.post("/plans/empty");
      const newPlanId = res?.data?.id ?? res?.data?.planId;
      if (!newPlanId) {
        toast.error("새 여행 계획 ID를 확인할 수 없습니다.");
        return;
      }
      navigate(`/myplan/${newPlanId}`, { state: { isNewPlan: true } });
      startClose(); // 메뉴 닫기
    } catch (err) {
      console.error("POST /plans/empty 실패:", err);
      toast.error("새 여행 계획을 만들 수 없어요. 잠시 후 다시 시도해주세요.");
    }
  }, [confirmIfDirty, navigate, startClose]);

  const handleProtectedRoute = useCallback((path) => {
    if (!confirmIfDirty()) return;
    if (isLoggedIn) {
      navigate(path);
      startClose();
    } else {
      navigate("/login");
      startClose();
    }
  }, [confirmIfDirty, isLoggedIn, navigate, startClose]);
  

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`side-menu-overlay ${open && !closing ? "open" : ""}`}
        onClick={startClose}
        aria-hidden="true"
      />

      {/* 패널 */}
      <aside
        className={`side-menu ${open && !closing ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="사이드 메뉴"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={startClose} aria-label="닫기">
          ×
        </button>

        <div className="user-info-ham">
          {isLoggedIn ? (
            <>
              {user.profileImageUrl ? (
                <img
                  className="profile-image-sidemenu"
                  src={user.profileImageUrl}
                  alt="프로필"
                />
              ) : (
                <div className="profile-circle" />
              )}
              <div className="nickname">{user.nickname}</div>
              <button className="logout" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <div className="logged-out">
              <button
                className="login-btn-ham"
                onClick={() => {
                  navigate("/login");
                  startClose();
                }}
              >
                로그인하세요
              </button>
            </div>
          )}
        </div>

        <ul className="menu-list">
          <li>
            <button 
              className="menu-link" 
              onClick={() => handleProtectedRoute("/aiplan")}
            >
              AI 플랜 생성
            </button>
          </li>
          <li>
            <button className="menu-link" onClick={handleAddPlanClick}>
              나만의 플랜 생성
            </button>
          </li>
          <li>
            <button 
              className="menu-link" 
              onClick={() => handleProtectedRoute("/community")}
            >
              커뮤니티
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default SideMenu;
