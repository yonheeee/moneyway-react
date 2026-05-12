import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProgressStep from '../aiplan/ProgressStep';
import api from '../../api/axios';
import Loader from './Loader'; // ✅ Loader import
import Tutorial from './Tutorial'
import '../../css/aiplan/AIName.css';

const AIPlanName = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { budget, duration } = location.state || {};

    const [planName, setPlanName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async () => {
        if (!planName.trim()) {
            alert("플랜 이름을 입력해주세요.");
            return;
        }
        setIsLoading(true);

        try {
            const requestData = {
                planTitle: planName.trim(),
                budget: budget,
                duration: duration,
            };

            console.log("서버에 전송할 최종 데이터:", requestData);

            const response = await api.post("ai/plans", requestData);
            console.log("API 응답:", response.data);

            if (response.data && response.data.planId) {
                const { planId, plan } = response.data;

                navigate(`/myplan/${planId}`, {
                    replace: true,
                    state: {
                        isNewPlan: true,
                        isAIPlan: true,
                        planId: planId,
                        planData: plan,
                        planTitle: planName.trim(),
                        budget: budget,
                        duration: duration,
                    }
                });
            } else {
                alert("플랜 생성은 완료되었지만 데이터를 불러올 수 없습니다.");
            }
        } catch (error) {
            console.error("플랜 생성 실패:", error);
            const errorMessage = error.response?.data?.message || "플랜 생성 중 오류가 발생했습니다.";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <ProgressStep currentStep={3} />

            <div className="content-container">
                <div className="ai-title-section">
                    <h1>플랜의 이름은?</h1>
                    <p>플랜에 이름을 짓고 나의 여행일정에 저장하세요.</p>
                </div>

                <div className="input-container">
                    <input
                        type="text"
                        className="plan-name-input"
                        placeholder="제주도 해변 투어"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                
                <button
                    className="complete-button"
                    onClick={handleComplete}
                    disabled={!planName.trim() || isLoading}
                >
                    {isLoading ? "플랜 생성 중..." : "완료"}
                </button>
            </div>

            {/* ✅ 로딩 중일 때 Loader 표시 */}
            {isLoading && (
                <div className="loader-overlay">
                    <Loader />
                    <Tutorial />
                </div>

            )}
        </div>
    );
};

export default AIPlanName;