// src/components/login/Signin.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import LoginHeader from "./LoginHeader";
import api from "../../api/axios";
import useUserStore from "../../api/userStore";
import "../../css/login/Signin.css";
import "../../css/login/Signup.css";
import "../../css/login/LoginPage.css";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const { setUser } = useUserStore.getState();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/.test(password);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setLoginError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
    setLoginError("");
  };

  const canSubmit = validateEmail(email) && validatePassword(password);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!validateEmail(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError("8~16자, 특수문자(@$!%*?&)를 포함해야 합니다.");
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, password });

      const { tokenInfo, userInfo } = response.data;
      const accessToken = tokenInfo?.accessToken;
      if (accessToken && userInfo) {
        const user = { ...userInfo, accessToken };
        setUser(user);
        toast.success("로그인 성공!");
        navigate(from, { replace: true });
      } else {
        console.error("❌ accessToken 또는 userInfo가 응답에 없음!", response.data);
        setLoginError("로그인 응답이 올바르지 않습니다.");
      }
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "INVALID_PASSWORD") {
        setPasswordError("비밀번호가 틀렸습니다.");
      } else if (code === "USER_NOT_FOUND") {
        setLoginError("존재하지 않는 계정입니다.");
      } else {
        setLoginError("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-header">
          <LoginHeader text="로그인" />
        </div>
        <div className="login-form">
          <form onSubmit={handleLogin}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="moneyway@gmail.com"
              className={`input-field ${
                emailError || loginError ? "error" : ""
              }`}
              value={email}
              onChange={handleEmailChange}
            />
            {emailError && <p className="error-message">{emailError}</p>}

            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="8~16자 + 특수문자 포함"
              className={`input-field ${
                passwordError || loginError ? "error" : ""
              }`}
              value={password}
              onChange={handlePasswordChange}
            />
            {passwordError && <p className="error-message">{passwordError}</p>}

            {loginError && !emailError && !passwordError && (
              <p className="error-message">{loginError}</p>
            )}

            <button type="submit" className="btn-login" disabled={!canSubmit}>
              로그인
            </button>
          </form>

          <a href="/forgot-pwd" className="find-password-link">
            비밀번호 찾기
          </a>
        </div>
      </div>
    </>
  );
};

export default Signin;
