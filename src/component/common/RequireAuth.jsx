//로그인 된 상태인지 검증하는 컴포넌트임
//로그인이 된 상태라면 자식 컴포넌트를 리디렉트함
//쓰는 방법이 알고 싶다면 Router.js를 확인하면 된다잉
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

function RequireAuth({ children }) {
  const [isAuthed, setIsAuthed] = useState(null);
  const location = useLocation();

  useEffect(() => {
    api
      .get('/users/me', { withCredentials: true })
      .then(() => setIsAuthed(true))
      .catch(() => setIsAuthed(false));
  }, []);

  if (isAuthed === null) return null;       // 로딩 중
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;                          // 인증 완료
}
export default RequireAuth;