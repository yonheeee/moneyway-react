import React, { useState } from "react";
import signupImage from "../../images/login/signup.png";
import api from "../../api/axios";
import { toast } from "react-toastify";

import "../../css/login/Signup.css";

function Signup() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const [nicknameCheckedValue, setNicknameCheckedValue] = useState("");
  const [emailCheckedValue, setEmailCheckedValue] = useState("");

  const [nicknameError, setNicknameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [nicknameSuccess, setNicknameSuccess] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateNickname = (nickname) =>
    nickname.trim().length >= 2 && nickname.trim().length <= 10;
  // 영문+숫자+특수문자 모두 포함, 8~16자
  const validatePassword = (pwd) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/.test(pwd);

  const handleNicknameChange = (e) => {
    const val = e.target.value;
    if (val !== nicknameCheckedValue) {
      setNicknameChecked(false);
      setNicknameCheckedValue("");
      setNicknameSuccess("");
    }
    setNickname(val);
    setNicknameError("");
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    if (val !== emailCheckedValue) {
      setEmailChecked(false);
      setEmailCheckedValue("");
      setEmailSuccess("");
    }
    setEmail(val);
    setEmailError("");
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (validatePassword(val)) {
      setPasswordError("");
    } else {
      setPasswordError(
        "8~16자, 영문+숫자+특수문자(@$!%*?&)를 모두 포함해야 합니다."
      );
    }
  };

  const handleNicknameCheck = async () => {
    if (!validateNickname(nickname)) {
      setNicknameError("닉네임은 2자 이상 10자 이하로 입력해주세요.");
      setNicknameChecked(false);
      setNicknameSuccess("");
      return;
    }

    try {
      const res = await api.get("/users/check/nickname", {
        params: { nickname },
      });

      if (res.data.exists) {
        setNicknameError("중복된 닉네임입니다.");
        setNicknameChecked(false);
        setNicknameSuccess("");
      } else {
        setNicknameError("");
        setNicknameChecked(true);
        setNicknameSuccess("사용 가능한 닉네임입니다.");
        setNicknameCheckedValue(nickname);
      }
    } catch (err) {
      console.error(err);
      setNicknameError("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleEmailCheck = async () => {
    if (!validateEmail(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      setEmailChecked(false);
      setEmailSuccess("");
      return;
    }

    try {
      const res = await api.get("/users/check/email", {
        params: { email },
      });

      if (res.data.exists) {
        setEmailError("중복된 이메일입니다.");
        setEmailChecked(false);
        setEmailSuccess("");
      } else {
        setEmailError("");
        setEmailChecked(true);
        setEmailSuccess("사용 가능한 이메일입니다.");
        setEmailCheckedValue(email);
      }
    } catch (err) {
      console.error(err);
      setEmailError("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!(nicknameChecked && emailChecked && validatePassword(password))) {
      toast.warn("입력을 다시 확인해주세요.");
      return;
    }

    try {
      await api.post("/auth/signup", {
        email,
        password,
        nickname,
      });

      toast.success("회원가입 성공!");
      window.location.href = "/login";
    } catch (err) {
      console.error("서버 응답:", err.response?.data);
      toast.error(
        "회원가입 실패: " + (err.response?.data?.message || "알 수 없는 오류")
      );
    }
  };

  return (
    <>
      <div className="header">
      </div>
      <div className="signup-container">
        <div className="signup-image">
          <img src={signupImage} alt="Signup Illustration" />
        </div>

        <div className="signup-form">
          <h1>MoneyWay 가입하기</h1>
          <div className="input-form">
            <form onSubmit={handleSignup}>
              {/* 이메일 */}
              <label htmlFor="email">이메일</label>
              <div className="input-row">
                <input
                  className={`input-field ${emailChecked ? "checked" : ""} ${
                    emailError ? "error" : ""
                  } ${emailSuccess ? "success" : ""}`}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="moneyway@gmail.com"
                  value={email}
                  onChange={handleEmailChange}
                />
                <button
                  type="button"
                  className={`btn-check ${
                    emailChecked && email.length > 0 ? "active" : ""
                  }`}
                  onClick={handleEmailCheck}
                  disabled={email.length === 0}
                >
                  중복확인
                </button>
              </div>
              {emailError && <p className="error-message">{emailError}</p>}
              {!emailError && emailSuccess && (
                <p className="success-message">{emailSuccess}</p>
              )}

              {/* 비밀번호 */}
              <label htmlFor="password">비밀번호</label>
              <div className="input-row">
                <input
                  className={`input-field ${passwordError ? "error" : ""}`}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="8~16자 + 특수문자 포함"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
              {passwordError && (
                <p className="error-message">{passwordError}</p>
              )}

              {/* 닉네임 */}
              <label htmlFor="nickname">닉네임</label>
              <div className="input-row">
                <input
                  className={`input-field ${nicknameChecked ? "checked" : ""} ${
                    nicknameError ? "error" : ""
                  } ${nicknameSuccess ? "success" : ""}`}
                  type="text"
                  id="nickname"
                  name="nickname"
                  placeholder="2~10자 입력"
                  value={nickname}
                  onChange={handleNicknameChange}
                />
                <button
                  type="button"
                  className={`btn-check ${
                    nicknameChecked && nickname.length > 0 ? "active" : ""
                  }`}
                  onClick={handleNicknameCheck}
                  disabled={nickname.length === 0}
                >
                  중복확인
                </button>
              </div>
              {nicknameError && (
                <p className="error-message">{nicknameError}</p>
              )}
              {!nicknameError && nicknameSuccess && (
                <p className="success-message">{nicknameSuccess}</p>
              )}

              {/* 가입 버튼 */}
              <button
                type="submit"
                className="btn-submit"
                disabled={
                  !(
                    nicknameChecked &&
                    emailChecked &&
                    validatePassword(password)
                  )
                }
              >
                가입하기
              </button>
            </form>
          </div>
          <p className="login-link">
            이미 계정이 있으신가요? <a href="/login">로그인</a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;
