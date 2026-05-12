import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "../../css/login/LoginPage.css";
import LoginHeader from "./LoginHeader";
import LoadingSpinner from "../common/LoadingSpinner";
import useUserStore from "../../api/userStore";
import api from "../../api/axios";
// useAuthStore import 제거 (accessToken은 userStore에서 관리)

import kakaoIcon from "../../images/login/kakaoAuth.svg";
// import googleIcon from "../../images/login/googleAuth.svg";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  // ✅ 콜백을 useCallback으로 감싸기
  const handleKakaoCallback = useCallback(
    async (accessToken) => {
      console.log("[카카오] 콜백 함수 진입, accessToken:", accessToken);

      console.log("[카카오] 콜백 함수 실행");
      setIsLoading(true);
      try {
        if (accessToken) {
          // 1. accessToken을 먼저 userStore에 저장
          setUser({ accessToken });

          // 2. /mypage/me 요청 (이제 인터셉터가 헤더에 토큰을 붙임)
          const userRes = await api.get("/mypage/me");
          const parsedUser = {
            ...userRes.data,
            accessToken,
          };
          setUser(parsedUser);
          toast.success("로그인 성공!");
          navigate("/");
        } else {
          console.error("[카카오] accessToken not found in URL");
          toast.error("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
          navigate("/login");
        }
      } catch (err) {
        console.error("[카카오] 로그인 실패:", err);
        toast.error("카카오 로그인에 실패했습니다.");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setUser]
  );

  useEffect(() => {
    console.log("[카카오] useEffect 실행, location.search:", location.search);
    const accessToken = new URLSearchParams(location.search).get("accessToken");
    console.log("[카카오] 추출된 accessToken:", accessToken);
    if (accessToken) {
      handleKakaoCallback(accessToken);
    } else {
      setIsLoading(false);
    }
  }, [handleKakaoCallback, location.search]);

  // ✅ 카카오 로그인 시작
  const handleKakaoLogin = () => {
    setIsLoading(true);
    window.location.href = "https://moneyway.cloud/oauth2/authorization/kakao";
  };

  const goSignup = () => navigate("/signup");
  const goSignin = () => navigate("/signin");

  if (isLoading) {
    return (
      <>
        <div className="login-loading-container">
          <LoadingSpinner />
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            로그인 처리 중...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="login-container">
        <div className="login-header">
          <LoginHeader text="가입" />
        </div>
        <div className="auth-container">
          <div className="auth-header">간편가입 하기 😎</div>

          <div className="social-buttons">
            <button className="social-btn kakao-btn" onClick={handleKakaoLogin}>
              <img
                src={kakaoIcon}
                alt="카카오 로그인"
                style={{
                  width: "5.6rem",
                  height: "5.6rem",
                  objectFit: "contain",
                }}
              />
            </button>
{/* 
            <button
              className="social-btn google-btn"
              onClick={() => toast.info("준비 중입니다!")}
            >
              <img
                src={googleIcon}
                alt="구글 로그인"
                style={{ width: "8rem", height: "8rem", objectFit: "contain" }}
              />
            </button> */}
          </div>

          <button className="email-btn" onClick={goSignup}>
            이메일로 회원가입
          </button>
          <button className="login-btn" onClick={goSignin}>
            로그인
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
