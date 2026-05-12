import React from "react";
import { Routes, Route } from "react-router-dom";

import Search from "./component/search/SearchMain";
import ProtectedRoute from "./ProtectedRoute";
import Main from "./component/main/Main";
import LoginPage from "./component/login/LoginPage";
import MyPage from "./component/mypage/MyPage";
import Signup from "./component/login/Signup";
import Signin from "./component/login/Signin";
import ForgotPwd from "./component/login/ForgotPwd";
import EmailCode from "./component/login/EmailCode";
import ResetPassword from "./component/login/ResetPassword";
import ChangePassword from "./component/login/ChangePassword";

import AIPeriod from "./component/aiplan/AIPeriod";
import AIPeople from "./component/aiplan/AIPeople";
import AIName from "./component/aiplan/AIName";
import AIBudget from "./component/aiplan/AIBudget";
import CartMain from "./component/shopping/CartMain";
import PlanList from "./component/common/PlanList";
import CreatePlan from "./component/aiplan/CreatePlan";
import CommunityMain from "./component/community/CommunityMain";
import PostCreate from "./component/community/PostCreate";
import PostDetail from "./component/community/PostDetail";
import PostEditForm from "./component/community/PostEditForm";
import MyPlanPage from "./component/myplan/MyPlanPage";
import MapContainer from "./component/myplan/MapContainer";

import AppLayout from "./component/common/AppLayout"; // ✅ 레이아웃

function AppRouter() {
  return (
    <Routes>

      {/* ✅ 이 레이아웃 안의 Outlet만 애니메이션, Header/Footers는 고정 */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Main />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgot-pwd" element={<ForgotPwd />} />
        <Route path="/emailcode" element={<EmailCode />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/changepassword" element={<ChangePassword />} />

        <Route path="/search" element={<Search />} />

        <Route
          path="/aiplan"
          element={
            <ProtectedRoute>
              <AIBudget />
            </ProtectedRoute>
          }
        />
        <Route path="/ai-period" element={<AIPeriod />} />
        <Route path="/ai-people" element={<AIPeople />} />
        <Route path="/ai-name" element={<AIName />} />

        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartMain />
            </ProtectedRoute>
          }
        />

        <Route
          path="/planlist"
          element={
            <ProtectedRoute>
              <PlanList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-plan"
          element={
            <ProtectedRoute>
              <CreatePlan />
            </ProtectedRoute>
          }
        />
        <Route
        path="/myplan/:planId"
        element={
          <ProtectedRoute>
            <MyPlanPage />
          </ProtectedRoute>
        }
      />

        <Route path="/community" element={<ProtectedRoute><CommunityMain /></ProtectedRoute>} />
        <Route path="/posts/create" element={<ProtectedRoute><PostCreate /></ProtectedRoute>} />
        <Route path="/posts/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/posts/:postId/edit" element={<ProtectedRoute><PostEditForm /></ProtectedRoute>} />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <MyPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapContainer />
            </ProtectedRoute>
          }
        />

      </Route>

    </Routes>
  );
}

export default AppRouter;
