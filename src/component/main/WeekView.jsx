import React from 'react';
import '../../css/main/WeekView.css';

const WeekView = ({ selectedDate }) => {
  // selectedDate가 있으면 그 날짜를, 없으면(null) 오늘 날짜를 기준으로 사용
  const displayDate = selectedDate || new Date();

  // 기준 날짜가 속한 주의 모든 날짜(일~토)를 계산하는 함수
  const getWeekDays = (date) => {
    const week = [];
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(displayDate);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="week-view-container">
      {weekDays.map((date, index) => (
        <div key={index} className="day-block">
          <div className="day-of-week">{dayNames[index]}</div>
          <div className="date-number">{date.getDate()}</div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;