// src/components/mypage/Profile.jsx
import { useNavigate } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { toast } from "react-toastify";
import useUserStore from "../../api/userStore"; // ✅ Zustand 유저 스토어
import "../../css/mypage/Profile.css";
import api from "../../api/axios";

const Profile = ({ onEditClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore(); // ✅ logout 사용

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("로그아웃 API 실패:", err);
    } finally {
      logout(); // ✅ 상태 + localStorage 초기화
      navigate("/");
      toast.success("로그아웃 되었습니다.");
    }
  };

  return (
    <div className="profilecard-container">
      <div className="profile-image">
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="프로필 이미지" />
        ) : (
          <div className="placeholder-image">👤</div>
        )}
      </div>
      <div className="nickname">
        <p>{user.nickname}</p>
      </div>
      <div className="info-fix">
        <button onClick={onEditClick}>
          정보 편집 <MdEdit />
        </button>
      </div>
      <div className="logout-btn">
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
};

export default Profile;
