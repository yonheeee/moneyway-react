import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext } from '@dnd-kit/core';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../../css/myplan/MyPlanPage.css';
import Schedule from './Schedule';
import ScheduleCart from './ScheduleCart';
import LodgingCart from './LodgingCart';
import ContextMenu from './ContextMenu';
import TimeSelectionModal from './TimeSelectionModal';
import api from "../../api/axios";
import useUserStore from '../../api/userStore';

import { ReactComponent as MapIcon } from '../../images/myplan/map.svg';
import { ReactComponent as PlaceIcon } from '../../images/myplan/place.svg';
import { ReactComponent as HoverMapIcon } from '../../images/myplan/hovermap.svg';
import { ReactComponent as HoverPlaceIcon } from '../../images/myplan/hoverplace.svg';

const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 23;
const toSlotIndex = (time) => {
  const [h] = String(time || '08:00').split(':').map(Number);
  return h - SLOT_START_HOUR;
};

const isOverlapping = (newSchedule, existingSchedules) => {
  const newStart = toSlotIndex(newSchedule.time);
  const newEnd = newStart + Math.round(newSchedule.duration);
  return (existingSchedules || []).some(existing => {
    if (existing.id === newSchedule.id) return false;
    const existStart = toSlotIndex(existing.time);
    const existEnd = existStart + Math.round(existing.duration);
    return !(newEnd <= existStart || newStart >= existEnd);
  });
};

const MyPlanPage = () => {
  const { planId: planIdParam } = useParams();
  const planId = String(planIdParam ?? '');
  const navigate = useNavigate();
  const { user: loggedInUser } = useUserStore();
  const [planDetails, setPlanDetails] = useState({
    id: null,
    title: '',
    author: '',
    totalBudget: 0,
    usedBudget: 0,
  });

  const emptyDays = useMemo(
    () => ({ 'Day 1': [], 'Day 2': [], 'Day 3': [], 'Day 4': [] }),
    []
  );
  const [dailySchedules, setDailySchedules] = useState(emptyDays);

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(true);

  const [allPlanIds, setAllPlanIds] = useState([]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const [isDirty, setIsDirty] = useState(false);
  const [isAIPlan, setIsAIPlan] = useState(false);

  const location = useLocation();
  const isNewPlan = location.state?.isNewPlan;

  const [enabledDays, setEnabledDays] = useState(1);
  const handleAddDay = useCallback(() => {
    setEnabledDays((d) => Math.min(4, d + 1));
  }, []);

  const [timeModal, setTimeModal] = useState({
    isOpen: false,
    step: 'start',
    draggedItem: null,
    targetDay: null,
    selectedStartTime: null,
  });

  const [menuState, setMenuState] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    selectedItem: null,
    day: null,
    contextType: 'schedule',
  });

  const fetchCartItems = useCallback(async () => {
    setLoadingCart(true);
    try {
      const res = await api.get('/cart');
      setCartItems(res.data?.cartItems || []);
    } catch (error) {
      console.error('카트 불러오기 실패:', error);
      alert('카트를 불러오지 못했습니다.');
    } finally {
      setLoadingCart(false);
    }
  }, []);

  const fetchPlanDetail = useCallback(async (id) => {
    setLoadingPlan(true);
    try {
      const res = await api.get(`/plans/${id}`);
      const data = res.data;

    
      const aiFlag = (data?.isAi ?? data?.isAI ?? data?.ai ?? location.state?.isAIPlan ?? false) === true;
      setIsAIPlan(aiFlag);

      const finalProfileImageUrl = loggedInUser?.profileImageUrl || data.profileImageUrl || "기본 SVG...";

      setPlanDetails({
        id: String(data.id ?? data.planId ?? id),
        title: data.title ?? '',
        username: data.username ?? '',
        profileImageUrl: finalProfileImageUrl,
        totalBudget: Number(data.totalPrice ?? 0),
        usedBudget: Number(data.currentPrice ?? 0),
        period: data.period ?? null,
        places: data.places || [],
        isAi: aiFlag, 
      });

      const newSchedules = { 'Day 1': [], 'Day 2': [], 'Day 3': [], 'Day 4': [] };
      (data.places || []).forEach(place => {
        const day = `Day ${place.dayNumber}`;
        if (!newSchedules[day]) newSchedules[day] = [];

        const start = (place.startTime || '09:00:00').slice(0,5);
        const end = (place.endTime || '10:00:00').slice(0,5);
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const duration = Math.max(1, ((eh*60 + em) - (sh*60 + sm)) / 60);

        newSchedules[day].push({
          id: place.placeId || Date.now() + Math.random(),
          name: place.placeName,
          time: start,
          duration,
          cost: place.cost || 0,
          cartId: place.cartId,
          placeId: place.placeId,
          category: place.category,
          profileImageUrl: finalProfileImageUrl,
          mapX: place.mapX || null,
          mapY: place.mapY || null,
          isAI: aiFlag, 
        });
      });

      setDailySchedules(newSchedules);

      const maxDay = (data.places || []).reduce(
        (max, place) => Math.max(max, place.dayNumber || 0), 0
      );

      setEnabledDays(Math.max(1, maxDay));
      setIsDirty(false);
    } catch (e) {
      console.error('GET /plans/{id} 실패:', e);
      setPlanDetails({
        id: String(id ?? ''),
        title: '',
        username: '',
        profileImageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80'><rect width='100%' height='100%' fill='%23eef2ff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='12'>No Image</text></svg>",
        totalBudget: 0,
        usedBudget: 0
      });
      setDailySchedules(emptyDays);
    } finally {
      setLoadingPlan(false);
    }
  }, [loggedInUser, emptyDays, location.state]);

  const fetchAllPlanIds = useCallback(async () => {
    try {
      const res = await api.get('/plans');
      const ids = (res.data || [])
        .map(plan => String(plan.id ?? plan.planId))
        .filter(Boolean);
      setAllPlanIds(prev => {
        const cur = String(planId || '');
        if (cur && !ids.includes(cur)) return [...ids, cur];
        return ids;
      });
    } catch (e) {
      console.error("전체 계획 목록을 불러오지 못했습니다.", e);
      setAllPlanIds(prev => {
        const cur = String(planId || '');
        if (cur && !prev.includes(cur)) return [...prev, cur];
        return prev;
      });
    }
  }, [planId]);

  const { prevPlanId, nextPlanId } = useMemo(() => {
    const currentIndex = allPlanIds.indexOf(String(planId));
    if (currentIndex === -1) {
      return { prevPlanId: null, nextPlanId: null };
    }
    const prev = currentIndex > 0 ? allPlanIds[currentIndex - 1] : null;
    const next = currentIndex < allPlanIds.length - 1 ? allPlanIds[currentIndex + 1] : null;
    return { prevPlanId: prev, nextPlanId: next };
  }, [allPlanIds, planId]);

  const navigateToPlan = useCallback((targetPlanId) => {
    if (!targetPlanId) return;
    if (isDirty && !window.confirm('저장되지 않은 변경사항이 있습니다. 이동하시겠습니까?')) {
      return;
    }
    navigate(`/myplan/${targetPlanId}`);
  }, [isDirty, navigate]);

  
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        if (location.state?.isAIPlan != null) {
          setIsAIPlan(!!location.state.isAIPlan);
        }
        await Promise.all([
          fetchAllPlanIds(),
          fetchCartItems(),
          planId ? fetchPlanDetail(planId) : Promise.resolve(),
        ]);
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
      } finally {
        if (mounted);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [planId, location.state, fetchAllPlanIds, fetchCartItems, fetchPlanDetail]);

  useEffect(() => {
    if (!planId) return;
    if (isNewPlan) setIsEditMode(true);
    else setIsEditMode(false);
  }, [planId, isNewPlan]);

  useEffect(() => {
    if (isNewPlan) {
      setIsDirty(true);
    }
  }, [isNewPlan]);

  useEffect(() => {
    if (location.state?.isAIPlan && location.state?.planData) {
      setIsAIPlan(true);

      const aiPlanData = location.state.planData;
      const newSchedules = { 'Day 1': [], 'Day 2': [], 'Day 3': [], 'Day 4': [] };

      aiPlanData.days.forEach(dayData => {
        const dayKey = `Day ${dayData.day.replace('일차', '')}`;
        if (!newSchedules[dayKey]) newSchedules[dayKey] = [];

        dayData.places.forEach(place => {
          const start = place.startTime || '09:00';
          const end = place.endTime || '10:00';
          const [sh, sm] = start.split(':').map(Number);
          const [eh, em] = end.split(':').map(Number);

          const originalDurationMinutes = (eh * 60 + em) - (sh * 60 + sm);
          const duration = Math.max(1, Math.round(originalDurationMinutes / 60));

          newSchedules[dayKey].push({
            id: place.placeId,
            name: place.title,
            time: start,
            duration,
            cost: place.cost || 0,
            placeId: place.placeId,
            category: place.categoryName,
            thumbnailUrl: place.thumbnailUrl || "기본 이미지 URL",
            mapX: place.mapX,
            mapY: place.mapY,
            isAI: true,
          });
        });
      });
      setDailySchedules(newSchedules);

      setPlanDetails({
        id: location.state.planId,
        title: location.state.planTitle,
        totalBudget: location.state.budget,
        profileImageUrl: loggedInUser?.profileImageUrl || null,
        isAi: true,
      });

      const daysLength = aiPlanData.days?.length || 1;
      setEnabledDays(daysLength);
      setIsEditMode(true);
      setIsDirty(true);
    }
  }, [location.state, loggedInUser]);

  const planDurationStr = `${Math.max(0, enabledDays - 1)}박 ${enabledDays}일`;
  const SLOT_HEIGHT_PX = 90;

  const timeSlots = useMemo(() => {
    const arr = [];
    for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
      arr.push(`${String(h).padStart(2, '0')}:00`);
    }
    return arr;
  }, []);

  /** ---------- DnD ---------- */
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    if (!over) return;

    const origin = active.data.current?.origin;

    if (origin === 'cart' || origin === 'lodging') {
      const draggedItem = cartItems.find(item => item.cartId === active.id);
      if (!draggedItem) return;

      const [day] = over.id.split('-');
      setTimeModal({
        isOpen: true,
        step: 'start',
        draggedItem,
        targetDay: day,
        selectedStartTime: null,
      });
      return;
    }

    if (origin === 'schedule') {
      const movedItem = { ...active.data.current };
      const originalDay = movedItem.originalDay;
      const [newDay, newTime] = over.id.split('-');

      const updatedItem = { ...movedItem, time: newTime, day: newDay };

      if (isOverlapping(updatedItem, dailySchedules[newDay] || [])) {
        alert('해당 시간에는 이미 다른 일정이 있습니다.');
        return;
      }

      setDailySchedules(prev => {
        const ns = { ...prev };
        ns[originalDay] = (ns[originalDay] || []).filter(item => item.id !== movedItem.id);
        ns[newDay] = [...(ns[newDay] || []), updatedItem];
        return ns;
      });

      setIsDirty(true);
    }
  }, [cartItems, dailySchedules]);

  /** ---------- 시간 선택 모달 ---------- */
  const handleTimeConfirm = useCallback((selectedTime) => {
    const { step, draggedItem, targetDay, selectedStartTime } = timeModal;

    if (step === 'start') {
      setTimeModal(prev => ({ ...prev, step: 'end', selectedStartTime: selectedTime }));
      return;
    }

    const startTime = selectedStartTime;
    const endTime = selectedTime;

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const durationHours = (endMinutes - startMinutes) / 60;

    if (durationHours <= 0) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    const newScheduleItem = {
      id: Date.now(),
      name: draggedItem.placeName,
      cost: draggedItem.price,
      category: draggedItem.category,
      time: startTime,
      duration: durationHours,
      cartId: draggedItem.cartId,
      placeId: draggedItem.placeId,
      mapX: draggedItem.mapX,
      mapY: draggedItem.mapY,
      isAI: !!draggedItem?.isAI, 
    };

    if (isOverlapping(newScheduleItem, dailySchedules[targetDay] || [])) {
      alert('해당 시간에는 이미 다른 일정이 있습니다.');
      setTimeModal({ isOpen: false, step: 'start', draggedItem: null, targetDay: null, selectedStartTime: null });
      return;
    }

    setDailySchedules(prev => ({
      ...prev,
      [targetDay]: [...(prev[targetDay] || []), newScheduleItem]
    }));

    setCartItems(prev => {
      const isLodging = (draggedItem.category || '').includes('숙소') || draggedItem.category === '숙소';
      return isLodging ? prev : prev.filter(item => item.cartId !== draggedItem.cartId);
    });

    setTimeModal({ isOpen: false, step: 'start', draggedItem: null, targetDay: null, selectedStartTime: null });
    setIsDirty(true);
  }, [timeModal, dailySchedules]);

  const handleTimeModalClose = useCallback(() => {
    setTimeModal({ isOpen: false, step: 'start', draggedItem: null, targetDay: null, selectedStartTime: null });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState(prev => ({ ...prev, visible: false }));
  }, []);

  const handleContextMenu = useCallback((event, item, day) => {
    event.preventDefault();
    if (!isEditMode || !item || !day) return;

    setMenuState({
      visible: true,
      position: { x: event.clientX, y: event.clientY },
      selectedItem: item,
      day: day,
      contextType: 'schedule',
    });
  }, [isEditMode]);

  const handleLodgingContextMenu = useCallback((event, item) => {
    event.preventDefault();
    if (!item?.cartId) return;

    if (window.confirm(`'${item.placeName}' 항목을 카트에서 삭제하시겠습니까?`)) {
      setCartItems(prev => prev.filter(i => i.cartId !== item.cartId));
      setIsDirty(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__MYPLAN_DIRTY__ = !!isDirty;
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.__MYPLAN_DIRTY__ = false;
      }
    };
  }, [isDirty]);

  useEffect(() => {
    const handleClickOutside = () => closeMenu();
    if (menuState.visible) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [menuState.visible, closeMenu]);

  const handleDeleteItem = useCallback(() => {
    const { selectedItem, day } = menuState;
    if (!selectedItem || !day) return;

    setDailySchedules(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(item => item.id !== selectedItem.id)
    }));

    const isLodging = selectedItem.category === '숙소' || selectedItem.category?.includes('숙소');
    if (!isLodging && selectedItem.cartId) {
      const cartItem = {
        cartId: selectedItem.cartId || Date.now(),
        placeId: selectedItem.placeId,
        placeName: selectedItem.name,
        category: selectedItem.category,
        price: selectedItem.cost,
        mapX: selectedItem.mapX,
        mapY: selectedItem.mapY,
      };
      setCartItems(prev => [...prev, cartItem]);
    }

    setIsDirty(true);
    closeMenu();
  }, [menuState, closeMenu]);

  const handleDeleteAIItem = useCallback(() => {
    const { selectedItem, day } = menuState;
    if (!selectedItem || !day) return;

    setDailySchedules(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(item => item.id !== selectedItem.id)
    }));

    setIsDirty(true);
    closeMenu();
  }, [menuState, closeMenu]);

  useEffect(() => {
    if (menuState.visible) {
      const handleClickOutside = () => closeMenu();
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [menuState.visible, closeMenu]);


  useEffect(() => {
    const allScheduleItems = Object.values(dailySchedules).flat();
    const totalCost = allScheduleItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    setPlanDetails(prev => ({ ...prev, usedBudget: totalCost }));
  }, [dailySchedules]);

  useEffect(() => {
    const daysWithItems = Object.entries(dailySchedules)
      .filter(([day, items]) => items && items.length > 0)
      .map(([day]) => parseInt(day.replace('Day ', ''), 10))
      .sort((a, b) => a - b);

    if (daysWithItems.length > 0) {
      const maxDayWithItems = Math.max(...daysWithItems);
      const newEnabledDays = Math.max(1, Math.min(4, maxDayWithItems));
      setEnabledDays(newEnabledDays);
    } else {
      setEnabledDays(1);
    }
  }, [dailySchedules]);

 
  const handleBudgetClick = useCallback(() => {
    if (planDetails.totalBudget > 0) {
      setBudgetInput(String(planDetails.totalBudget));
    } else {
      setBudgetInput('');
    }
    setIsEditingBudget(true);
  }, [planDetails.totalBudget]);

  const handleBudgetChange = useCallback((e) => setBudgetInput(e.target.value), []);

  const handleBudgetBlur = useCallback(() => {
    const newTotalBudget = parseInt(budgetInput, 10) || 0;
    setPlanDetails(prev => ({ ...prev, totalBudget: newTotalBudget }));
    setIsEditingBudget(false);
    setIsDirty(true);
  }, [budgetInput]);
  const handleBudgetKeyDown = useCallback((e) => { if (e.key === 'Enter') handleBudgetBlur(); }, [handleBudgetBlur]);


  const handleTitleClick = useCallback(() => { setTitleInput(planDetails.title); setIsEditingTitle(true); }, [planDetails.title]);
  const handleTitleChange = useCallback((e) => setTitleInput(e.target.value), []);
  const handleTitleBlur = useCallback(() => {
    setPlanDetails(prev => ({ ...prev, title: titleInput }));
    setIsEditingTitle(false);
    setIsDirty(true);
  }, [titleInput]);
  const handleTitleKeyDown = useCallback((e) => { if (e.key === 'Enter') handleTitleBlur(); }, [handleTitleBlur]);

  const handleSave = async () => {
    const places = [];

    Object.entries(dailySchedules).forEach(([day, items]) => {
      const dayNumber = Number(String(day).replace('Day ', '')) || Number(day);

      (items || []).forEach((item) => {
        if (!item?.time) {
          console.warn("저장 제외 (ID 정보 부족):", item);
          return;
        }

        if (!item?.time || (item.cartId == null && item.placeId == null)) {
          console.warn("저장 제외 (ID가 null이거나 없음):", item);
          return;
        }

        const [h, m] = String(item.time).split(':').map(Number);
        const startMinutes = (h || 0) * 60 + (m || 0);
        const endMinutes = startMinutes + Math.max(60, Math.round((item.duration || 1) * 60));

        const toHHMM = (mins) => {
          const clamped = Math.max(0, Math.min(1439, mins));
          const H = String(Math.floor(clamped / 60)).padStart(2, '0');
          const M = String(clamped % 60).padStart(2, '0');
          return `${H}:${M}`;
        };

        const base = {
          cost: Number(item.cost || 0),
          dayNumber,
          startTime: toHHMM(startMinutes),
          endTime: toHHMM(endMinutes),
        };

        if (item.placeId && item.cartId) {
          places.push({ ...base, placeId: item.placeId, cartId: item.cartId });
        } else if (item.placeId) {
          places.push({ ...base, placeId: item.placeId });
        } else if (item.cartId) {
          places.push({ ...base, cartId: item.cartId });
        }
      });
    });

    if (!places.length && isDirty) {
      alert('스케줄에 추가된 일정이 없습니다!');
      return;
    }

    try {
      let currentPlanId = planId;

      if (!currentPlanId || currentPlanId === "new") {
        const res = await api.post("/plans/empty", {
          title: planDetails?.title || "새 여행 계획",
        });
        currentPlanId = String(res?.data?.id ?? res?.data?.planId);
        if (!currentPlanId) {
          throw new Error("새로운 계획 ID를 발급받지 못했습니다.");
        }
      }

      const payload = {
        title: planDetails?.title || "새 여행 계획",
        totalPrice: Number(planDetails.totalBudget || 0),
        places,
      };
      await api.patch(`/plans/${currentPlanId}`, payload);

      alert("여행 계획이 저장되었습니다.");
      setIsEditMode(false);

      setCartItems([]);
      setIsDirty(false);

      navigate(`/myplan/${currentPlanId}`, {
        replace: true,
        state: { isNewPlan: false, isAIPlan }
      });

    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      console.error("ERROR:", e?.response || e);
      alert(`저장 실패! ${msg}`);
    }
  };

 
  const handleEdit = useCallback(() => {
    setIsEditMode(true);
    if (planDetails?.isAi === true) setIsAIPlan(true);
  }, [planDetails]);

  const menuItems = useMemo(() => {
    if (menuState.contextType === 'lodging') {
      return [
        {
          action: () => {
            if (menuState.selectedItem?.cartId) {
              alert('dl 카트를 삭제할까요.');
              setCartItems(prev => prev.filter(i => i.cartId !== menuState.selectedItem.cartId));
              setIsDirty(true);
              closeMenu();
            }
          }
        }
      ];
    }

    const selected = menuState.selectedItem;
    const isAIItem =
      selected?.isAI === true ||
      (isAIPlan && selected && selected.isAI === undefined && !selected?.cartId);

    if (isAIItem) {
      return [
        { label: '삭제하기', action: handleDeleteAIItem },
      ];
    }

    return [
      { label: '카트로 옮기기', action: handleDeleteItem },
    ];
  }, [menuState, handleDeleteItem, handleDeleteAIItem, closeMenu, isAIPlan]);

  const handleMapView = () => {
    const toHHMM = (mins) => {
      const clamped = Math.max(0, Math.min(1439, mins));
      const H = String(Math.floor(clamped / 60)).padStart(2, '0');
      const M = String(clamped % 60).padStart(2, '0');
      return `${H}:${M}`;
    };

    const placesByDay = Object.entries(dailySchedules)
      .filter(([day, items]) => {
        const dayNumber = parseInt(day.replace('Day ', ''), 10);
        return dayNumber <= enabledDays && items.length > 0;
      })
      .map(([day, items]) => {
        const dayNumber = parseInt(day.replace('Day ', ''), 10);

        const places = items
          .filter(item => {
            const lat = parseFloat(item.mapY);
            const lng = parseFloat(item.mapX);
            const hasLocation = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

            if (!hasLocation) {
              console.warn(`위치 정보가 없는 항목: ${item.name}`, {
                mapX: item.mapX,
                mapY: item.mapY,
                parsedLng: lng,
                parsedLat: lat
              });
            }
            return hasLocation;
          })
          .map(item => {
            const [h, m] = String(item.time || '00:00').split(':').map(Number);
            const startMinutes = h * 60 + m;
            const durationMinutes = Math.round((item.duration || 1) * 60);
            const endMinutes = startMinutes + durationMinutes;

            return {
              id: item.placeId || item.cartId || item.id,
              name: item.name,
              category: item.category,
              lat: parseFloat(item.mapY),
              lng: parseFloat(item.mapX),
              startTime: item.time,
              endTime: toHHMM(endMinutes),
            };
          });

        places.sort((a, b) => a.startTime.localeCompare(b.startTime));

        return {
          day: dayNumber,
          places: places,
        };
      })
      .filter(dayData => dayData.places.length > 0);

    if (placesByDay.length === 0 || placesByDay.every(day => day.places.length === 0)) {
      alert('지도에 표시할 위치 정보가 없습니다. 장소를 추가하거나 위치 정보를 확인해주세요.');
      return;
    }

    navigate('/map', { state: { placesByDay: placesByDay } });
  };

  const handleTimeBack = () => {
    setTimeModal((prev) => ({
      ...prev,
      step: "start"
    }));
  };

  return (
    <DndContext onDragEnd={handleDragEnd} disabled={!isEditMode}>
      <div className='myplan-page-container'>
        {isEditMode ? (
          <LodgingCart
            cartItems={cartItems}
            isEditMode={isEditMode}
            onContextMenu={handleLodgingContextMenu}
          />
        ) : (
          <div className="side-card-container-placeholder"></div>
        )}

        <div className="center-column">
          <div className='schedule-header'>
            <div className="plan-sequence">
              <button
                className="plan-nav-arrow"
                onClick={() => navigateToPlan(prevPlanId)}
                disabled={!prevPlanId}
              >
                &lt;
              </button>

              <span className='plan-breadcrumb'>
                {planDetails.title || '새 여행 계획'}
              </span>

              <button
                className="plan-nav-arrow"
                onClick={() => navigateToPlan(nextPlanId)}
                disabled={!nextPlanId}
              >
                &gt;
              </button>
            </div>
            <div className="header-buttons">
              {!isEditMode && (
                <>
                  <button className='icon-button map-view-button' onClick={handleMapView}>
                    <MapIcon className='basic-icon ' />
                    <HoverMapIcon className='hover-basic-icon' />
                  </button>

                  <button
                    className="icon-button go-to-shopping"
                    onClick={() => {
                      navigate("/search");
                    }}
                  >
                    <PlaceIcon className='basic-icon' />
                    <HoverPlaceIcon className='hover-basic-icon' />
                  </button>
                </>
              )}

              {isEditMode ? (
                <button className='save-button' onClick={handleSave}>저장하기</button>
              ) : (
                <button className='edit-button' onClick={handleEdit}>수정하기</button>
              )}
            </div>
          </div>

          {(loadingPlan || loadingCart) && (
            <div className="loading-box">불러오는 중…</div>
          )}

          <div className='schedule-main-container'>
            <Schedule
              isEditingTitle={isEditingTitle}
              titleInput={titleInput}
              onTitleClick={handleTitleClick}
              onTitleChange={handleTitleChange}
              onTitleBlur={handleTitleBlur}
              onTitleKeyDown={handleTitleKeyDown}
              planDetails={planDetails}
              dailySchedules={dailySchedules}
              timeSlots={timeSlots}
              onContextMenu={handleContextMenu}
              slotHeight={SLOT_HEIGHT_PX}
              isEditMode={isEditMode}
              isEditingBudget={isEditingBudget}
              onBudgetClick={handleBudgetClick}
              onBudgetChange={handleBudgetChange}
              onBudgetBlur={handleBudgetBlur}
              onBudgetKeyDown={handleBudgetKeyDown}
              budgetInput={budgetInput}
              planDurationStr={planDurationStr}
              enabledDays={enabledDays}
              onAddDay={handleAddDay}
            />

            <TimeSelectionModal
              isOpen={timeModal.isOpen}
              onClose={handleTimeModalClose}
              onConfirm={handleTimeConfirm}
              itemName={timeModal.draggedItem?.placeName}
              category={timeModal.draggedItem?.category}
              step={timeModal.step}
              onBack={handleTimeBack}
            />
          </div>
        </div>

        {isEditMode
          ? <ScheduleCart cartItems={cartItems.filter(item => !(item.category === '숙소' || item.category?.includes('숙소')))} dailySchedules={dailySchedules} />
          : <div className="side-card-container-placeholder"></div>}
      </div>

      {isEditMode && menuState.visible && (
        <ContextMenu
          position={menuState.position}
          items={menuItems}
          onClose={closeMenu}
        />
      )}
    </DndContext>
  );
};

export default MyPlanPage;
