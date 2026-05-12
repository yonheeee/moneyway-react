import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import "../../css/login/ForgotPwd.css";
import logoWallet from "../../images/login/logoWallet.svg";

const ForgotPwd = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    try {
      await api.post("/users/password/send-code", { email });

      toast.success("비밀번호 재설정 코드가 이메일로 발송되었습니다.");
      navigate("/emailcode", { state: { email } });
    } catch (error) {
      const code = error.response?.data?.code;
      const message = error.response?.data?.message;

      console.log("Password reset error:", { code, message, fullError: error.response?.data });

      if (code === "USER_NOT_FOUND") {
        setGeneralError("가입된 계정이 없습니다.");
      } else if (code === "SOCIAL_LOGIN_USER" || code === "KAKAO_USER" || code === "SOCIAL_USER" || code === "KAKAO_ACCOUNT_LOGIN") {
        setGeneralError("해당 이메일은 카카오 로그인 전용 계정입니다. 카카오 로그인을 이용해주세요.");
      } else {
        setGeneralError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }

      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="forgot-pwd-header">
          <img src={logoWallet} alt="Wallet Logo" className="wallet-logo" />
          <h1 style={{ fontSize: "3.6rem", fontWeight: "bold" }}>
            비밀번호를 잊으셨나요?
          </h1>
          <p style={{ fontSize: "1.6rem", marginTop: "0" }}>
            이메일을 입력하고 비밀번호 재설정 코드를 받으세요.
          </p>
        </div>
        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="moneyway@gmail.com"
              className={`input-field ${
                emailError || generalError ? "error" : ""
              }`}
              value={email}
              onChange={handleEmailChange}
            />
            {emailError && <p className="error-message">{emailError}</p>}
            {generalError && !emailError && (
              <p className="error-message">{generalError}</p>
            )}
            <button
              type="submit"
              className="btn-emailcode"
              disabled={isSubmitting}
            >
              이메일로 코드 받기
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPwd;
