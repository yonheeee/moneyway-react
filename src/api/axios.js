// src/api/axios.js
import axios from "axios";
import useUserStore from "./userStore.js";

let isRefreshing = false;
let failedQueue = [];

// 대기열 관리
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 토큰 파싱 유틸
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

// exp 기반 만료 임박 체크 (기본 90초 이내면 true)
export const willExpireSoon = (token, thresholdSec = 90) => {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now <= thresholdSec;
};

let refreshPromise = null; // refresh 요청 싱글톤화

// refresh 요청 함수
const doRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh", null, { headers: { Authorization: undefined } })
      .then((res) => {
        const newAccess = res.data?.accessToken;
        if (!newAccess) throw new Error("No accessToken returned");

        // zustand + localStorage 업데이트
        const userStore = useUserStore.getState();
        const prevUser = userStore.user || {};
        const newUser = { ...prevUser, accessToken: newAccess };
        userStore.setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));

        return newAccess;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const api = axios.create({
  baseURL: "https://moneyway.cloud/api",
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    const isRefresh = config.url?.includes("/auth/refresh");
    if (isRefresh) {
      // refresh 요청은 Authorization 제거
      if (config.headers?.Authorization) delete config.headers.Authorization;
      return config;
    }

    // 현재 토큰 가져오기
    let token =
      useUserStore.getState().user?.accessToken ||
      JSON.parse(localStorage.getItem("user") || "{}")?.accessToken;

    // 만료 임박이면 사전 refresh
    if (token && willExpireSoon(token, 90)) {
      try {
        token = await doRefresh();
      } catch (e) {
        // refresh 실패 → 세션 정리
        useUserStore.getState().clearUser();
        localStorage.removeItem("user");
        return Promise.reject(e);
      }
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (lazy refresh)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isTokenRefresh = originalRequest?.url?.includes("/auth/refresh");
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    if (status === 401 && isTokenRefresh) {
      // refresh 자체 실패 → 세션 종료
      useUserStore.getState().clearUser();
      localStorage.removeItem("user");
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry && !isLoginRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await doRefresh();
        if (!newAccessToken) throw new Error("Refresh failed");

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useUserStore.getState().clearUser();
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
