// src/App.jsx
import React, { useEffect } from "react";
import AppRouter from "./Router";
import api, { willExpireSoon } from "./api/axios";
import useUserStore from "./api/userStore.js";
import LoadingSpinner from "./component/common/LoadingSpinner.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { isInitialized, setInitialized, clearUser } = useUserStore();

  // ✅ 앱 부팅 1회 점검
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const raw = localStorage.getItem("user");
        const access =
          useUserStore.getState().user?.accessToken ||
          (raw ? JSON.parse(raw).accessToken : null);

        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }
      } catch (e) {
        console.error("초기 refresh 실패:", e);
        clearUser();
        localStorage.removeItem("user");
      } finally {
        setInitialized(true);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ (선택) 탭 복귀/포커스 시 만료 임박이면만 조용히 갱신
  useEffect(() => {
    const onWake = async () => {
      try {
        const raw = localStorage.getItem("user");
        const access =
          useUserStore.getState().user?.accessToken ||
          (raw ? JSON.parse(raw).accessToken : null);
        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }
      } catch {
        useUserStore.getState().clearUser();
        localStorage.removeItem("user");
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") onWake();
    };

    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!isInitialized) return <LoadingSpinner />;

  return (
    <div className="App">
      <ToastContainer position="bottom-center" autoClose={3000} theme="colored" />
      <AppRouter />
    </div>
    
  );
}

export default App;
