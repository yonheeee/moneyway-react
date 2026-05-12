import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import logoWallet from "../../images/login/logoWallet.svg";
import "../../css/login/ResetPassword.css"; // 같은 CSS 사용

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleCurrentChange = (e) => {
    setCurrentPassword(e.target.value);
    setCurrentPasswordError("");
    setGeneralError("");
  };

  const handleNewChange = (e) => {
    setNewPassword(e.target.value);
    setNewPasswordError("");
    setConfirmError("");
    setGeneralError("");
  };

  const handleConfirmChange = (e) => {
    setNewPasswordConfirm(e.target.value);
    setConfirmError("");
    setGeneralError("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    let valid = true;

    if (!currentPassword) {
      setCurrentPasswordError("현재 비밀번호를 입력해주세요.");
      valid = false;
    }

    if (!passwordRegex.test(newPassword)) {
      setNewPasswordError("8~16자, 특수문자(@$!%*?&)를 포함해야 합니다.");
      valid = false;
    }

    if (newPassword !== newPasswordConfirm) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      valid = false;
    }

    if (!valid) return;

    try {
      const res = await api.patch("/mypage/password", {
        currentPassword,
        newPassword,
      });

      if (res.data.message && res.data.message.includes("성공")) {
        toast.success(res.data.message || "비밀번호가 성공적으로 변경되었습니다.");
        navigate("/mypage"); // 필요시 경로 조정
      } else {
        toast.error(res.data.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다.";
      setGeneralError(message);
      console.error("❌ 서버 에러:", err.response?.data || err);
    }
  };

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    newPasswordConfirm.length > 0;

  return (
    <>
      <div className="reset-password-container">
        <div className="reset-password-header">
          <img
            src={logoWallet}
            alt="Wallet Logo"
            className="wallet-logo"
            style={{ marginBottom: "5rem" }}
          />
        </div>
        <div className="reset-password-form">
          <form onSubmit={handleChangePassword}>
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="현재 비밀번호 입력"
              className={`reset-input-field ${currentPasswordError ? "error" : ""}`}
              value={currentPassword}
              onChange={handleCurrentChange}
            />
            {currentPasswordError && (
              <p className="error-message">{currentPasswordError}</p>
            )}

            <label htmlFor="newPassword">새 비밀번호 입력</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="8자리 이상"
              className={`reset-input-field ${newPasswordError ? "error" : ""}`}
              value={newPassword}
              onChange={handleNewChange}
            />
            {newPasswordError && (
              <p className="error-message">{newPasswordError}</p>
            )}

            <label htmlFor="newPasswordConfirm">새 비밀번호 확인</label>
            <input
              type="password"
              id="newPasswordConfirm"
              name="newPasswordConfirm"
              placeholder="비밀번호 확인"
              className={`reset-input-field ${confirmError ? "error" : ""}`}
              value={newPasswordConfirm}
              onChange={handleConfirmChange}
            />
            {confirmError && <p className="error-message">{confirmError}</p>}

            {generalError && <p className="error-message">{generalError}</p>}

            <button type="submit" className="reset-btn" disabled={!canSubmit}>
              비밀번호 변경
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
