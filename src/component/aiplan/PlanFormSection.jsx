import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BudgetSlider from "../main/BudgetSlider";
import { ReactComponent as People } from "../../images/main/second/people.svg";
import { ReactComponent as BasicPeople } from "../../images/main/second/basic_people.svg";
import { ReactComponent as PlanButton } from "../../images/main/second/planbutton.svg";
import jejuOceanImg from "../../images/main/jejuocean.png";

import "../../css/aiplan/PlanFormSection.css";

const PlanFormSection = () => {
  const navigate = useNavigate();

  const [budget, setBudget] = useState([2500000]);
  const [tripDuration, setTripDuration] = useState(null);
  const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);
  const [planTitle, setPlanTitle] = useState(""); // ✅ 내부 상태로 변경

  const durationOptions = ["당일치기", "1박 2일", "2박 3일", "3박 4일"];

  return (
    <div className="plan-form-wrapper">
      <div className="plan-form-left">
        <div className="plan-title-card">
          <h2>예산과 일정을 입력해주세요</h2>
        </div>

        <BudgetSlider budget={budget} setBudget={setBudget} />

        <div className="selector-container">
          <div
            className="selector-row"
            onClick={() => setIsDurationPickerVisible(!isDurationPickerVisible)}
          >
            {tripDuration ? (
              <People className="icon" />
            ) : (
              <BasicPeople className="icon" />
            )}
            <span className={!tripDuration ? "placeholder" : ""}>
              {tripDuration || "여행 기간"}
            </span>
          </div>

          {isDurationPickerVisible && (
            <div className="selector-options">
              {durationOptions.map((option) => (
                <div
                  key={option}
                  className={`selector-option-item ${
                    tripDuration === option ? "selected" : ""
                  }`}
                  onClick={() => {
                    setTripDuration(option);
                    setIsDurationPickerVisible(false);
                  }}
                >
                  <People className="icon" />
                  <span>{option}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="plan-title-input-wrapper">
          <input
            type="text"
            className="plan-title-input"
            placeholder="플랜 이름을 작성하세요"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
          />
        </div>

        <button className="plan-submit">
          플랜 생성
          <PlanButton className="icon" />
        </button>

        <div className="plan-direct" onClick={() => navigate("/schedule")}> 
          직접 계획할래요
        </div>
      </div>

      <div className="plan-form-right">
        <div className="plan-image-box">
          <img
            src={jejuOceanImg}
            alt="JEJU a beautiful island"
            className="plan-image"
          />
          <div className="plan-image-title">
            <div>JEJU,</div>
            <div>a beautiful island</div>
            <span className="plan-title-bar"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanFormSection;
