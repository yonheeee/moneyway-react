import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import "../../css/mypage/ProfileChange.css";
import useUserStore from "../../api/userStore";
import Profile from "../mypage/Profile";

const ProfileChange = () => {
  const navigate = useNavigate();
  const { user, setUser, clearUser } = useUserStore();

  const [nickname, setNickname] = useState(user?.nickname || "");
  const [initialNickname, setInitialNickname] = useState(user?.nickname || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false); // ✅ 중복확인 성공 여부

  useEffect(() => {
    if (!user) {
      toast.warn("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    const base = user.nickname || "";
    setNickname(base);
    setInitialNickname(base);
  }, [user, navigate]);

  // 변경 감지
  const isDirty = nickname.trim() !== (initialNickname || "").trim();
  const isValid = nickname.trim().length >= 3;
  const canSave = isDirty && isValid && isAvailable && !isSaving; // ✅ 중복확인까지 반영

  // 닉네임 저장
  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await api.patch("/mypage/nickname", { newNickname: nickname.trim() });
      setUser({ ...user, nickname: nickname.trim() });
      setInitialNickname(nickname.trim());
      setIsAvailable(false); // 저장 후 다시 중복확인 필요
      toast.success("프로필이 성공적으로 변경되었습니다.");
      navigate("/mypage");
    } catch (err) {
      const message =
        err.response?.data?.message || "정보 저장 중 오류가 발생했습니다.";
      toast.error(message);
      console.error("프로필 변경 실패:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // 닉네임 중복확인
  const handleCheckDup = async () => {
    const value = nickname.trim();
    if (!value) return toast.warn("닉네임을 입력해주세요.");
    if (value.length < 3) return toast.warn("닉네임은 3자 이상이어야 합니다.");

    setIsChecking(true);
    try {
      const res = await api.get("/users/check/nickname", {
        params: { nickname: value },
      });
      if (res.data?.exists) {
        setIsAvailable(false);
        toast.error("중복된 닉네임입니다.");
      } else {
        setIsAvailable(true);
        toast.success("사용 가능한 닉네임입니다.");
      }
    } catch {
      setIsAvailable(false);
      toast.error("닉네임 중복 확인 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  // 비밀번호 변경
  const goChangePassword = () => navigate("/changepassword");

  // 회원 탈퇴
  const handleWithdraw = async () => {
    const confirmed = window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!confirmed) return;

    try {
      await api.delete("/mypage/withdraw");
      toast.success("회원 탈퇴가 완료되었습니다.");
      clearUser();
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "회원 탈퇴 중 오류가 발생했습니다.";
      toast.error(message);
      console.error("회원 탈퇴 실패:", err);
    }
  };

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <div className="profile-card">
          <Profile />
        </div>
      </aside>

      <main className="profile-main">
        <section className="panel">
          <h2 className="panel-title">내 계정</h2>

          {/* 닉네임 */}
          <div className="form-row">
            <label className="label">닉네임</label>
            <div className="field-inline">
              <input
                type="text"
                className={`input ${isDirty ? "input-dirty" : ""}`}
                placeholder="3자리 이상"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setIsAvailable(false); // 값 바뀌면 중복확인 다시 해야 함
                }}
                maxLength={20}
              />
              <button
                type="button"
                className="btn-subtle"
                onClick={handleCheckDup}
                disabled={isChecking || !isDirty || !isValid}
              >
                {isChecking ? "확인중..." : "중복확인"}
              </button>
            </div>
          </div>

          {/* 비밀번호 변경 */}
          <div className="form-row">
            <label className="label">비밀번호 변경</label>
            <button className="btn-outline" onClick={goChangePassword}>
              변경하기
            </button>
          </div>

          {/* 저장 */}
          <div className="submit-wrap">
            <button
              className={`btn-primary ${canSave ? "is-active" : "is-idle"}`}
              onClick={handleSave}
              disabled={!canSave}
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </section>

        {/* 계정 탈퇴 */}
        <section className="panel danger">
          <h3 className="panel-subtitle">계정 탈퇴</h3>
          <p className="muted">데이터 및 계정과 관련된 모든 정보를 영구적으로 삭제합니다.</p>
          <div className="danger-actions">
            <button className="btn-danger" onClick={handleWithdraw}>
              탈퇴하기
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfileChange;
