import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import BudgetDisplay from "../myplan/BudgetDisplay.jsx";
import "../../css/mypage/MyPlan.css";
import ArrowRightIcon from "../../images/myplan/right-arrow.svg";

/* ---------- 유틸 ---------- */
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const orderLabel = (i) => `${i + 1}번째 플랜`;

/* ---------- 컴포넌트 ---------- */
const MyPlan = ({ onClose }) => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revealId, setRevealId] = useState(null); // 화살표 hover 시 열릴 카드 id

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/plans");
      const list = Array.isArray(res.data) ? res.data : [];

      // ✅ isAi 보존해서 전달
      const normalized = list.map((p, idx) => {
        const id = String(p.id ?? idx);
        const maxBudget = toNumber(p.totalPrice);
        const current = toNumber(p.currentPrice);
        const thumb =
          p.thumbnailUrl ||
          p.profileImageUrl ||
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80'><rect width='100%' height='100%' fill='%23eef2ff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='12'>No Image</text></svg>";

        return {
          id,
          title: p.title ?? "제목 없음",
          username: p.username ?? "",
          thumbnailUrl: thumb,
          period: p.period ?? "일정 미정",
          maxBudget,
          currentSpent: current,
          isAi: !!(p?.isAi ?? p?.isAI ?? p?.ai), // ✅ 추가
        };
      });

      setPlans(normalized);
    } catch (e) {
      console.error("GET /plans 실패:", e);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  /* 플랜 생성: POST /plans/empty → /myplan/:id */
  const handleAddPlanClick = async () => {
    try {
      onClose?.();
      const res = await api.post("/plans/empty");
      const newPlanId = res?.data?.id ?? res?.data?.planId;
      if (!newPlanId) {
        alert("생성된 여행 계획 ID를 확인할 수 없습니다.");
        return;
      }
      navigate(`/myplan/${String(newPlanId)}`, { state: { isNewPlan: true } });
    } catch (e) {
      console.error("POST /plans/empty 실패:", e);
      alert("새 여행 계획을 만들 수 없어요. 잠시 후 다시 시도해주세요.");
    }
  };

  /* 플랜 삭제: DELETE /api/plans/{id} */
  const handleDelete = async (id) => {
    if (!window.confirm("이 여행 계획을 삭제할까요?")) return;
    try {
      await api.delete(`/plans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setRevealId(null);
    } catch (e) {
      console.error("DELETE /plans/{id} 실패:", e);
      alert("삭제에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleReveal = (id) => setRevealId(id);
  const handleHide = () => setRevealId(null);
  const handleToggleReveal = (id) => setRevealId((prev) => (prev === id ? null : id));

  return (
    <div className="myplan-container">
      {loading && <div className="plan-loading">불러오는 중…</div>}
      {!loading && plans.length === 0 && (
        <>
          <h1>새로운 제주 여행 계획하기</h1>
          <p className="plan-empty-text">
            '+'버튼을 눌러 당신의 여정을 시작하세요.<br />
            여행의 이름을 설정하고 나만의 플랜을 만들 수 있습니다.
          </p>
        </>
      )}

      {plans.map((plan, idx) => {
        return (
          <section key={plan.id} className="plan-section">
            <p className="section-label">{orderLabel(idx)}</p>

            {/* 카드: 트랙(내용) + 액션 패널 */}
            <div
              className={`plan-card ${revealId === plan.id ? "is-reveal" : ""}`}
              onMouseLeave={handleHide}
            >
              {/* 좌/우 내용이 들어있는 트랙 - 왼쪽 슬라이드 */}
              <div className="card-track">
                <div className="plan-card-left">
                  <img className="plan-thumb" src={plan.thumbnailUrl} alt="플랜 썸네일" />
                  <div className="plan-title-box">
                    <div className="myplan-title">{plan.title}</div>
                    <div className="plan-subtitle">{plan.period}</div>
                  </div>
                </div>

                <div className="plan-card-right">
                  <BudgetDisplay
                    usedBudget={plan.currentSpent}
                    totalBudget={plan.maxBudget}
                    isEditMode={false}
                    isEditingBudget={false}
                    onBudgetClick={() => {}}
                    onBudgetChange={() => {}}
                    onBudgetBlur={() => {}}
                    onBudgetKeyDown={() => {}}
                    budgetInput=""
                    zeroBudgetDisplay="number"
                  />

                  {/* 화살표 버튼: hover/클릭 시 우측 액션패널 open */}
                  <button
                    className="chevron-btn"
                    aria-label="액션 열기"
                    aria-expanded={revealId === plan.id}
                    onMouseEnter={() => handleReveal(plan.id)}
                    onFocus={() => handleReveal(plan.id)}
                    onClick={() => handleToggleReveal(plan.id)}
                  >
                    <img
                      src={ArrowRightIcon}
                      alt="arrow right"
                      style={{ width: "2rem", height: "2rem" }}
                    />
                  </button>
                </div>
              </div>

              {/* 우측 액션 패널 */}
              <div className="card-actions" onMouseEnter={() => handleReveal(plan.id)}>
                <button className="action-btn danger" onClick={() => handleDelete(plan.id)}>
                  삭제하기
                </button>

                <button
                  className="action-btn primary"
                  onClick={() =>
                    navigate(`/myplan/${plan.id}`, {
                      // ✅ 계획보기로 들어갈 때 isAIPlan 함께 전달
                      state: { isNewPlan: false, viewOnly: true, isAIPlan: plan.isAi },
                    })
                  }
                >
                  계획보기
                </button>
              </div>
            </div>
          </section>
        );
      })}

      {/* 추가 카드 */}
      <div
        className="add-card"
        onClick={handleAddPlanClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" ? handleAddPlanClick() : null)}
        aria-label="새 여행 계획 만들기"
        title="새 여행 계획 만들기"
      >
        <div className="add-circle">+</div>
      </div>
    </div>
  );
};

export default MyPlan;
