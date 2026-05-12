// src/components/auth/LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import '../../css/login/LogoutButton.css';
import { toast } from 'react-toastify';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { clearAccessToken } = useAuthStore();

  const handleLogout = async () => {
    try {
      // 백엔드에서 Refresh Token 쿠키 삭제
      await api.post('/auth/logout');
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    } finally {
      // 메모리에서 Access Token 제거
      clearAccessToken();
      toast.success("로그아웃되었습니다");
      // 로그인 페이지로 이동
      navigate('/login');
    }
  };

  return (
    <button onClick={handleLogout} className="btn-logout">
      로그아웃
    </button>
  );
};

export default LogoutButton;