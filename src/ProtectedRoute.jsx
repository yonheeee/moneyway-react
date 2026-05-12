// src/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useUserStore from "./api/userStore.js";
import LoadingSpinner from "./component/common/LoadingSpinner.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, isInitialized } = useUserStore();
  const location = useLocation();

  // 1) 앱 초기화 전 → 로딩 표시
  if (!isInitialized) return <LoadingSpinner />;

  // 2) 토큰 확인 (store + localStorage 보완)
  let hasToken = !!user?.accessToken;
  if (!hasToken) {
    try {
      const raw = localStorage.getItem("user");
      const parsed = raw ? JSON.parse(raw) : null;
      hasToken = !!parsed?.accessToken;
    } catch {
      hasToken = false;
    }
  }

  // 3) 로그인 안 된 경우 → 로그인 페이지로
  if (!hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;