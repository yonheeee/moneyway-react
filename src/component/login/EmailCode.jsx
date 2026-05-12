import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import logoWallet from "../../images/login/logoWallet.svg";

const EmailCode = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("이메일 정보가 없습니다. 이전 단계부터 다시 시작해주세요.");
      return;
    }

    if (!/^\d+$/.test(code)) {
      setError("숫자만 입력 가능합니다.");
      return;
    }

    if (code.length < 4) {
      setError("인증코드를 입력해주세요.");
      return;
    }

    try {
      const res = await api.post("/users/password/verify-code", {
        email,
        code,
      });

      console.log("📦 서버 응답:", res.data);

      if (res.data.message === "이메일 인증이 완료되었습니다.") {
        toast.success("인증 완료! 비밀번호를 재설정해주세요.");
        navigate("/resetpassword", { state: { email } });
      } else {
        setError("인증에 실패했습니다. 코드를 다시 확인해주세요.");
      }
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "INVALID_VERIFICATION_CODE") {
        setError("인증코드가 올바르지 않습니다.");
      } else if (code === "VERIFICATION_CODE_EXPIRED") {
        setError("인증코드가 만료되었습니다. 다시 요청해주세요.");
      } else {
        setError("서버 오류가 발생했습니다.");
      }
      console.error("❌ 서버 에러:", err.response?.data || err);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="forgot-pwd-header">
          <img src={logoWallet} alt="Wallet Logo" className="wallet-logo" />
          <h1 style={{ fontSize: "3.6rem", fontWeight: "bold" }}>
            비밀번호 재설정 코드를 입력하세요.
          </h1>
          <p style={{ fontSize: "1.6rem", marginTop: 0 }}>
            이메일이 오지 않았다면 스팸함을 확인해주세요.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ textAlign: "center", marginTop: "10rem" }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setCode(val); // 숫자만
              setError("");
            }}
            style={{
              width: "28rem",
              height: "4rem",
              fontSize: "2rem",
              textAlign: "center",
              borderRadius: "0.8rem",
              border: "1.5px solid #aaa",
              outline: "none",
              letterSpacing: "0.4rem",
              marginTop: "-4rem",
            }}
            placeholder="인증코드를 입력하세요"
          />
        </div>

        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
              marginTop: "2rem",
              fontSize: "1.4rem",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <button
            type="submit"
            className="btn-login"
            style={{
              textAlign: "center",
              width: "25rem",
              height: "5rem",
              padding: "0",
            }}
          >
            인증코드 확인
          </button>
        </div>
      </form>
    </>
  );
};

export default EmailCode;
