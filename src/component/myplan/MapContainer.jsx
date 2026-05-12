// src/COMPONENTS/AI/MapContainer.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";

import "../../css/myplan/MapContainer.css";

/* === 거리 계산 (하버사인) === */
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // km
  return Number.isFinite(distance) ? distance : 0;
}

/* === 커스텀 핀(SVG) 생성 === */
function makePinImage(kakao, color = "#80A5F6") {
  const svg = `
  <svg width="20" height="28" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <path d="M11 0c6.1 0 11 4.9 11 11 0 7.5-11 19-11 19S0 18.5 0 11C0 4.9 4.9 0 11 0z" fill="url(#g)"/>
    <circle cx="11" cy="11" r="5.2" fill="#fff"/>
    <circle cx="11" cy="11" r="2.4" fill="${color}"/>
  </svg>`;
  const url = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  const size = new kakao.maps.Size(20, 28);
  const offset = new kakao.maps.Point(10, 28);
  return new kakao.maps.MarkerImage(url, size, { offset });
}

/* === 유틸 === */
const nNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
const hasCoord = (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng);

/* 얕은 비교용 시그니처(내용이 같으면 문자열도 같게) */
const placeSig = (p) =>
  [p.name, p.lat, p.lng, p.startTime ?? "", p.endTime ?? "", p.id ?? ""].join(
    "|"
  );
const daysSig = (arr) =>
  JSON.stringify(
    (arr || []).map((d) => [
      d.day,
      d.places.length,
      d.places.map(placeSig).join(";"),
    ])
  );

/* 안전한 equals */
const sameDays = (a, b) => daysSig(a) === daysSig(b);
const samePlaces = (a, b) =>
  Array.isArray(a) &&
  Array.isArray(b) &&
  a.length === b.length &&
  a.every((v, i) => placeSig(v) === placeSig(b[i]));

export default function MapContainer({
  places: propPlaces = [],         // 평면 배열도 지원 (Day 1로 간주)
  placesByDay: propPlacesByDay,    // 일자 배열 우선 사용
  initialMode = "driving",         // (무시됨) - 하위 호환을 위해 props만 남김
  onMapReady,
  onRouteComputed,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  /* === 상태 === */
  const [days, setDays] = useState([]); // [{ day, places: [...] }]
  const [activeDayIdx, setActiveDayIdx] = useState(0); // -1 = All Day
  const [places, setPlaces] = useState([]); // 현재 일자 places (또는 All)
  const [routeInfo, setRouteInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(null);

  /* === refs === */
  const mapRef = useRef(null);
  const mapInitedRef = useRef(false);
  const onMapReadyRef = useRef(onMapReady);
  const onRouteComputedRef = useRef(onRouteComputed);

  const markersRef = useRef([]);
  const overlaysRef = useRef([]);
  const pulseOverlaysRef = useRef([]);
  const segmentRefs = useRef([]);
  const firstCardOpenedOnceRef = useRef(false);
  const initialZoomAppliedRef = useRef(false);

  /* 최신 콜백 ref 동기화 */
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);
  useEffect(() => {
    onRouteComputedRef.current = onRouteComputed;
  }, [onRouteComputed]);

  /* ---- 들어온 데이터 한 번 확인용 로그 ---- */
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[MapContainer] location.state:", location?.state);
    // eslint-disable-next-line no-console
    console.log("[MapContainer] props.placesByDay:", propPlacesByDay);
    // eslint-disable-next-line no-console
    console.log("[MapContainer] props.places(flat):", propPlaces);
  }, [location?.state, propPlacesByDay, propPlaces]);

  /* === 입력 → 정규화 === */
  const normalizedFromInputs = useMemo(() => {
    const statePBD = location?.state?.placesByDay;
    const stateFlat = location?.state?.places;

    const propPBD = propPlacesByDay;
    const propFlat = Array.isArray(propPlaces) ? propPlaces : [];

    let src =
      (Array.isArray(statePBD) && statePBD) ||
      (Array.isArray(propPBD) && propPBD) ||
      null;

    if (!src) {
      const flat = (Array.isArray(stateFlat) && stateFlat) || propFlat || [];
      src = flat.length ? [{ day: 1, places: flat }] : [];
    }

    const normalizePlace = (p, idx) => {
      const lat = nNum(p.lat ?? p.latitude ?? p.mapY);
      const lng = nNum(p.lng ?? p.longitude ?? p.mapX);
      return {
        id:
          p.id ??
          p.placeId ??
          p.cartId ??
          `${p.name ?? "장소"}-${p.startTime ?? ""}-${idx}`,
        name: p.name ?? "장소",
        category: p.category ?? p.type ?? "",
        lat,
        lng,
        startTime: p.startTime ?? p.time ?? "", // 정렬만 사용, 표시X
        endTime: p.endTime ?? "",               // 표시X
        naverPlaceId: p.naverPlaceId,
      };
    };

    const normalized = (src || [])
      .map((d, di) => {
        const list = Array.isArray(d.places) ? d.places : [];
        const norm = list
          .map(normalizePlace)
          .filter(hasCoord)
          .sort((a, b) =>
            String(a.startTime).localeCompare(String(b.startTime))
          );
        return { day: Number(d.day ?? di + 1), places: norm };
      })
      .filter((d) => d.places.length > 0);

    return normalized;
  }, [
    location?.state?.placesByDay,
    location?.state?.places,
    propPlacesByDay,
    propPlaces,
  ]);

  /* === 모든 일자 합치기 === */
  const flattenAllPlaces = useCallback((srcDays) => {
    const list = (srcDays || []).flatMap((d) =>
      Array.isArray(d.places) ? d.places : []
    );
    return list.sort((a, b) =>
      String(a.startTime).localeCompare(String(b.startTime))
    );
  }, []);

  /* === days 세팅: 바뀔 때만 === */
  const prevDaysSigRef = useRef("");
  useEffect(() => {
    const nextSig = daysSig(normalizedFromInputs);
    if (prevDaysSigRef.current !== nextSig) {
      setDays((prev) =>
        sameDays(prev, normalizedFromInputs) ? prev : normalizedFromInputs
      );
      // -1(전체보기)은 유지, 범위 벗어나면 0으로
      setActiveDayIdx((prev) => {
        if (prev === -1) return -1;
        return prev >= normalizedFromInputs.length ? 0 : prev;
      });
      prevDaysSigRef.current = nextSig;
    }
  }, [normalizedFromInputs]);

  /* === activeDayIdx 변경 시 places 세팅: 바뀔 때만 === */
  const prevPlacesSigRef = useRef("");
  useEffect(() => {
    const current =
      activeDayIdx === -1
        ? flattenAllPlaces(normalizedFromInputs)
        : normalizedFromInputs[activeDayIdx]?.places || [];
    const curSig = JSON.stringify(current.map(placeSig));
    if (prevPlacesSigRef.current !== curSig) {
      setPlaces((prev) => (samePlaces(prev, current) ? prev : current));
      setSelectedSegmentIndex(null);
      prevPlacesSigRef.current = curSig;
    }
  }, [normalizedFromInputs, activeDayIdx, flattenAllPlaces]);

  /* === 카카오맵 SDK 로더 === */
  const loadKakao = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.kakao?.maps?.LatLng) return resolve();
      const apiKey = process.env.REACT_APP_KAKAO_MAP_API_KEY;
      if (!apiKey) return reject(new Error("REACT_APP_KAKAO_MAP_API_KEY 누락"));

      const id = "kakao-map-sdk";
      const ready = () => {
        try {
          window.kakao.maps.load(() => {
            if (window.kakao?.maps?.LatLng) resolve();
            else reject(new Error("kakao.maps 준비 실패"));
          });
        } catch {
          reject(new Error("kakao.maps.load 호출 실패"));
        }
      };

      const existed = document.getElementById(id);
      if (existed) {
        existed.addEventListener("load", ready, { once: true });
        existed.addEventListener("error", () =>
          reject(new Error("카카오맵 스크립트 로드 실패(중복)"))
        );
        return;
      }

      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
      s.onload = ready;
      s.onerror = () => reject(new Error("카카오맵 스크립트 로드 실패"));
      document.head.appendChild(s);
    });
  }, []);

  /* === 정리 유틸 === */
  function clearMarkersAndOverlays() {
    markersRef.current.forEach((m) => m.setMap && m.setMap(null));
    overlaysRef.current.forEach((o) => o.setMap && o.setMap(null));
    pulseOverlaysRef.current.forEach((p) => p.setMap && p.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];
    pulseOverlaysRef.current = [];
  }
  function clearSegments() {
    segmentRefs.current.forEach((seg) => {
      seg.outline?.setMap && seg.outline.setMap(null);
      seg.polyline?.setMap && seg.polyline.setMap(null);
      seg.label?.setMap && seg.label.setMap(null);
    });
    segmentRefs.current = [];
  }

  /* === 마커 + 카드 + 펄스 추가 (시간 표시 제거) === */
  function addMarkerWithOverlay(map, place, idx, openNow = false) {
    const { kakao } = window;
    const pos = new kakao.maps.LatLng(place.lat, place.lng);

    const image = makePinImage(kakao, "#80A5F6");
    const marker = new kakao.maps.Marker({
      position: pos,
      map,
      image,
      zIndex: 4,
    });
    markersRef.current.push(marker);

    const pulseEl = document.createElement("div");
    pulseEl.className = "seosan-pin-pulse";
    const pulseOverlay = new kakao.maps.CustomOverlay({
      position: pos,
      content: pulseEl,
      xAnchor: 0.5,
      yAnchor: 1.0,
      zIndex: 3,
      clickable: false,
    });
    pulseOverlay.setMap(map);
    pulseOverlaysRef.current.push(pulseOverlay);

    const container = document.createElement("div");
    container.className = "seosan-overlay-card";
    container.innerHTML = `
      <div class="title">${idx + 1}. ${place.name ?? "장소"}</div>
      <div class="seosan-overlay-arrow"></div>
    `;

    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content: container,
      yAnchor: 1.15,
      xAnchor: 0.5,
      zIndex: 5,
      clickable: true,
    });
    overlaysRef.current.push(overlay);

    let visible = false;
    const show = () => {
      if (!visible) {
        overlay.setMap(map);
        visible = true;
      }
    };
    const hide = () => {
      if (visible) {
        overlay.setMap(null);
        visible = false;
      }
    };

    if (openNow && !firstCardOpenedOnceRef.current) {
      show();
      firstCardOpenedOnceRef.current = true;
    }

    kakao.maps.event.addListener(marker, "click", () => {
      overlaysRef.current.forEach((o) => o.setMap && o.setMap(null));
      visible = false;
      show();
    });
    kakao.maps.event.addListener(marker, "mouseover", show);
    kakao.maps.event.addListener(marker, "mouseout", hide);
    kakao.maps.event.addListener(map, "click", hide);

    return { marker, overlay, pulseOverlay };
  }

  /* === 경로 그리기 (거리만) === */
  const drawRoute = useCallback(
    async (placesArg, map) => {
      if (!map || !window.kakao?.maps) return;
      clearSegments();

      if (!placesArg || placesArg.length < 2) {
        setRouteInfo((prev) => (prev.length ? [] : prev));
        return;
      }

      setLoading(true);
      try {
        const info = [];
        const { kakao } = window;

        const COLORS = [
          "#80A5F6",
          "#03C75A",
          "#FF7A59",
          "#FFD400",
          "#9B59B6",
          "#E74C3C",
        ];
        const STYLES = ["solid", "shortdash", "dash", "shortdot"];

        for (let i = 0; i < placesArg.length - 1; i++) {
          const o = placesArg[i],
            d = placesArg[i + 1];

          const distanceKm = getDistanceKm(o.lat, o.lng, d.lat, d.lng);
          info.push({
            from: o.name,
            to: d.name,
            distance: distanceKm.toFixed(1),
          });

          const path = [
            new kakao.maps.LatLng(o.lat, o.lng),
            new kakao.maps.LatLng(d.lat, d.lng),
          ];
          const color = COLORS[i % COLORS.length];
          const style = STYLES[i % STYLES.length];

          const outline = new kakao.maps.Polyline({
            path,
            strokeWeight: 8,
            strokeColor: "rgba(0,0,0,0.45)",
            strokeOpacity: 0.7,
            strokeStyle: "solid",
            zIndex: 2,
          });
          outline.setMap(map);

          const polyline = new kakao.maps.Polyline({
            path,
            strokeWeight: 6,
            strokeColor: color,
            strokeOpacity: 0.95,
            strokeStyle: style,
            zIndex: 3,
          });
          polyline.setMap(map);

          const midLat = (o.lat + d.lat) / 2;
          const midLng = (o.lng + d.lng) / 2;
          const labelEl = document.createElement("div");
          labelEl.className = "seosan-seg-label";
          labelEl.textContent = `코스 ${i + 1}`;
          labelEl.style.borderColor = color;

          const labelOverlay = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(midLat, midLng),
            content: labelEl,
            xAnchor: 0.5,
            yAnchor: 0.5,
            zIndex: 4,
            clickable: false,
          });
          labelOverlay.setMap(map);

          segmentRefs.current.push({ outline, polyline, label: labelOverlay });
        }

        // 루프 방지: 내용이 달라질 때만 갱신
        const nextSig = JSON.stringify(info);
        const prevSig = JSON.stringify(routeInfo);
        if (nextSig !== prevSig) setRouteInfo(info);

        onRouteComputedRef.current?.(info, {
          day: activeDayIdx === -1 ? "ALL" : (days[activeDayIdx]?.day ?? 1),
        });
      } finally {
        setLoading(false);
      }
    },
    [activeDayIdx, days, routeInfo]
  );

  const applyInitialZoom = useCallback((center) => {
    const map = mapRef.current;
    if (!map || typeof window === "undefined") return;
    const run = () => {
      map.setLevel(7);

      if (initialZoomAppliedRef.current) return;

      initialZoomAppliedRef.current = true;

      const targetCenter =
        center ||
        (typeof map.getCenter === "function" ? map.getCenter() : null);

      if (targetCenter && typeof map.setCenter === "function") {
        map.setCenter(targetCenter);
      }
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
  }, []);

  /* === 지도 범위 맞추기 === */
  const fitBoundsForAll = useCallback(() => {
    const map = mapRef.current;
    if (!map || markersRef.current.length === 0) return;
    const { kakao } = window;
    const bounds = new kakao.maps.LatLngBounds();
    markersRef.current.forEach((m) => bounds.extend(m.getPosition()));
    map.relayout();
    map.setBounds(bounds);
    const center =
      typeof bounds.getCenter === "function" ? bounds.getCenter() : null;
    applyInitialZoom(center);
  }, [applyInitialZoom]);

  /* === 구간 포커스 (오른쪽 패널 폭만큼 X 보정) === */
  const focusSegmentCenter = useCallback(
    (i, delay = 0) => {
      const map = mapRef.current;
      if (!map || !places[i] || !places[i + 1]) return;

      const midLat = (places[i].lat + places[i + 1].lat) / 2;
      const midLng = (places[i].lng + places[i + 1].lng) / 2;

      const run = () => {
        map.relayout();
        const proj = map.getProjection?.();
        const { kakao } = window;
        const midLatLng = new kakao.maps.LatLng(midLat, midLng);

        let xOffset = 0;
        const panel = document.querySelector(".seosan-route-info-overlay");
        if (panel) {
          const w = panel.clientWidth || 0;
          xOffset = Math.min(Math.round(w * 0.45), 260);
        }

        if (proj?.containerPointFromCoords && proj?.coordsFromContainerPoint) {
          const pt = proj.containerPointFromCoords(midLatLng);
          const adjPt = new kakao.maps.Point(pt.x - xOffset, pt.y);
          const target = proj.coordsFromContainerPoint(adjPt);
          map.panTo(target);
        } else {
          map.panTo(midLatLng);
        }
      };

      if (delay > 0) setTimeout(run, delay);
      else run();
    },
    [places]
  );

  const applySegmentVisibility = useCallback((idx) => {
    const map = mapRef.current;
    if (!map) return;
    const segs = segmentRefs.current;

    segs.forEach((seg, i) => {
      const show = idx === null || i === idx;
      seg.outline?.setMap && seg.outline.setMap(show ? map : null);
      seg.polyline?.setMap && seg.polyline.setMap(show ? map : null);
      seg.label?.setMap && seg.label.setMap(show ? map : null);

      if (seg.polyline?.setOptions) {
        seg.polyline.setOptions({
          strokeWeight: show && idx !== null ? 8 : 6,
          strokeOpacity: show && idx !== null ? 1 : 0.95,
          zIndex: show && idx !== null ? 5 : 3,
        });
      }
    });
  }, []);

  const updateMarkerVisibility = useCallback((idx) => {
    const map = mapRef.current;
    if (!map) return;
    const showAll = idx === null;

    markersRef.current.forEach((marker, markerIdx) => {
      if (!marker?.setMap) return;
      const shouldShow = showAll || markerIdx === idx || markerIdx === idx + 1;
      marker.setMap(shouldShow ? map : null);
    });

    pulseOverlaysRef.current.forEach((pulse, pulseIdx) => {
      if (!pulse?.setMap) return;
      const shouldShow = showAll || pulseIdx === idx || pulseIdx === idx + 1;
      pulse.setMap(shouldShow ? map : null);
    });
  }, []);

  const showOverlaysForSegment = useCallback((i) => {
    const map = mapRef.current;
    if (!map) return;
    overlaysRef.current.forEach((ov, idx) => {
      if (idx === i || idx === i + 1) ov.setMap(map);
      else ov.setMap(null);
    });
  }, []);

  const handleFocusSegment = useCallback(
    (i) => {
      setSelectedSegmentIndex(i);
      applySegmentVisibility(i);
      showOverlaysForSegment(i);
      updateMarkerVisibility(i);

      const needDelay = !showRouteInfo;
      if (!showRouteInfo) setShowRouteInfo(true);
      focusSegmentCenter(i, needDelay ? 300 : 0);
    },
    [
      applySegmentVisibility,
      showOverlaysForSegment,
      focusSegmentCenter,
      showRouteInfo,
      updateMarkerVisibility,
    ]
  );

  const handleShowAllSegments = useCallback(() => {
    setSelectedSegmentIndex(null);
    applySegmentVisibility(null);
    overlaysRef.current.forEach((o) => o.setMap && o.setMap(null));
    updateMarkerVisibility(null);
    fitBoundsForAll();
  }, [applySegmentVisibility, fitBoundsForAll, updateMarkerVisibility]);

  /* === 지도 초기화/업데이트 === */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadKakao();
        if (cancelled) return;

        const { kakao } = window;
        const container = document.getElementById("map");
        if (!container) return;

        if (!mapInitedRef.current) {
          const map = new kakao.maps.Map(container, {
            center: new kakao.maps.LatLng(36.7819, 126.4502),
            level: 8,
          });
          mapRef.current = map;
          mapInitedRef.current = true;
          onMapReadyRef.current?.(map);
        }

        const map = mapRef.current;
        if (!map) return;

        clearMarkersAndOverlays();

        if (places.length > 0) {
          const bounds = new kakao.maps.LatLngBounds();
          places.forEach((p, idx) => {
            const { marker } = addMarkerWithOverlay(map, p, idx, idx === 0);
            bounds.extend(marker.getPosition());
          });
          map.setBounds(bounds);
          const center =
            typeof bounds.getCenter === "function" ? bounds.getCenter() : null;
          applyInitialZoom(center);
        } else {
          applyInitialZoom();
        }

        await drawRoute(places, map);
        updateMarkerVisibility(selectedSegmentIndex);

        if (selectedSegmentIndex === null) {
          fitBoundsForAll();
        } else {
          applySegmentVisibility(selectedSegmentIndex);
          showOverlaysForSegment(selectedSegmentIndex);
          focusSegmentCenter(selectedSegmentIndex, showRouteInfo ? 0 : 300);
        }
      } catch (e) {
        console.error("카카오맵 초기화/업데이트 오류:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    places,
    loadKakao,
    drawRoute,
    applySegmentVisibility,
    selectedSegmentIndex,
    fitBoundsForAll,
    focusSegmentCenter,
    showOverlaysForSegment,
    showRouteInfo,
    applyInitialZoom,
    updateMarkerVisibility,
  ]);

  /* === 네이버 directions === */
  const toMercator = (lat, lng) => {
    const R = 6378137.0;
    const x = R * ((lng * Math.PI) / 180);
    const y = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));
    return [x, y];
  };
  const fmt = (n) => (Math.round(n * 1e7) / 1e7).toString();
  const openNaverSegment = useCallback(
    (i) => {
      const segP = (p) => {
        if (!Number.isFinite(p?.lat) || !Number.isFinite(p?.lng)) return "";
        const [x, y] = toMercator(p.lat, p.lng);
        const name = encodeURIComponent(p.name || "");
        const poi = p.naverPlaceId ? `,${p.naverPlaceId},PLACE_POI` : "";
        return `${fmt(x)},${fmt(y)},${name}${poi}`;
      };
      if (!Array.isArray(places) || i < 0 || i >= places.length - 1) return;
      const o = places[i],
        d = places[i + 1];
      const url = `https://map.naver.com/p/directions/${segP(o)}/${segP(
        d
      )}/-/transit?c=14.00,0,0,0,dh`;
      window.open(url, "_blank", "noopener");
    },
    [places]
  );

  /* === 뒤로가기 === */
  const prevStep = useCallback(() => navigate(-1), [navigate]);

  const activeDayLabel =
    activeDayIdx === -1 ? "All" : (days[activeDayIdx]?.day ?? 1);

  return (
    <div className="seosan-map-fullscreen-container">
      <button
        className="step-interest-prev-btn"
        onClick={prevStep}
        aria-label="이전 단계로"
      >
        <FiChevronLeft style={{ fontSize: "2.1rem", color: "black" }} />
      </button>

      {days.length > 0 && (
        <aside className="seosan-day-rail" aria-label="여행 일자">
          <div className="seosan-day-rail-inner">
            {/* All Day 버튼 */}
            <button
              className={[
                "seosan-day-rail-item",
                activeDayIdx === -1 ? "active" : "",
                (days.reduce((acc, d) => acc + (d?.places?.length || 0), 0) === 0)
                  ? "is-empty"
                  : "has-places",
              ].join(" ")}
              onClick={() => setActiveDayIdx(-1)}
              aria-pressed={activeDayIdx === -1}
              aria-label={`All Day (전체 보기)`}
              title={`All Day · 모든 일자 보기`}
            >
              <div className="seosan-day-rail-day">All Day</div>
              <div className="seosan-day-rail-badge">
                {days.reduce((acc, d) => acc + (d?.places?.length || 0), 0)}
              </div>
            </button>

            {days.map((d, idx) => {
              const count = d?.places?.length ?? 0;
              const isActive = idx === activeDayIdx;
              const isEmpty = count === 0;
              return (
                <button
                  key={d.day ?? idx}
                  className={[
                    "seosan-day-rail-item",
                    isActive ? "active" : "",
                    isEmpty ? "is-empty" : "has-places",
                  ].join(" ")}
                  onClick={() => setActiveDayIdx(idx)}
                  aria-pressed={isActive}
                  aria-label={`Day ${d.day ?? idx + 1} (${count}개)`}
                  title={`Day ${d.day ?? idx + 1} · 장소 ${count}개`}
                >
                  <div className="seosan-day-rail-day">
                    Day {d.day ?? idx + 1}
                  </div>
                  <div className="seosan-day-rail-badge">{count}</div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* 지도 */}
      <div id="map" className="seosan-map-container" />

      {/* 장소 없음 */}
      {places.length === 0 && (
        <div className="seosan-no-places-overlay">
          <div className="seosan-no-places-message">
            <h3>장소 데이터가 없습니다</h3>
            <p>
              AI 추천에서 ‘지도 보기’를 눌러 이동하거나, 샘플 데이터를
              로드하세요.
            </p>
            <div className="seosan-command-examples">
              <div className="seosan-command">
                <strong>서산9경:</strong>
                <code>loadSeosan9ScenicOnStart()</code>
              </div>
              <div className="seosan-command">
                <strong>서울 관광지:</strong>
                <code>loadSeoulOnStart()</code>
              </div>
              <div className="seosan-command">
                <strong>샘플:</strong>
                <code>saveSamplePlaces()</code>
              </div>
              <div className="seosan-command">
                <strong>삭제:</strong>
                <code>clearPlacesAndReload()</code>
              </div>
            </div>
            <div className="seosan-note">
              💡 개발자도구(Console)에서 실행하세요.
            </div>
          </div>
        </div>
      )}

      {/* 오른쪽 사이드바 패널 */}
      {places.length > 0 && (
        <div
          className={`seosan-route-info-overlay ${
            showRouteInfo ? "active" : ""
          }`}
        >
          <button
            className="seosan-route-toggle-button"
            onClick={() => setShowRouteInfo((s) => !s)}
          >
            <span className="seosan-toggle-icon">—</span>
          </button>

          <div className="seosan-route-info-list">
            <div className="seosan-route-header">
              <h3>{`경로 정보 · Day ${activeDayLabel}`}</h3>
              <div className="seosan-route-header-actions">
                <button
                  className="seosan-show-all-button"
                  onClick={handleShowAllSegments}
                  disabled={selectedSegmentIndex === null}
                >
                  전체 경로 보기
                </button>
              </div>
            </div>

            {routeInfo.length > 0 ? (
              <div className="seosan-route-cards">
                {routeInfo.map((r, i) => (
                  <div
                    key={i}
                    className={`seosan-route-card ${
                      selectedSegmentIndex === i ? "active" : ""
                    }`}
                  >
                    <div className="seosan-route-card-header">
                      <div className="seosan-route-number">코스 {i + 1}</div>
                    </div>

                    <div className="seosan-route-card-content">
                      <div className="seosan-route-label">경로</div>
                      <div className="seosan-route-value">
                        {r.from} → {r.to}
                      </div>

                      <div className="seosan-route-label">거리</div>
                      <div className="seosan-route-value">
                        {r.distance} km
                      </div>
                    </div>

                    <div className="seosan-seg-actions">
                      <button
                        className={`seosan-seg-view-button ${
                          selectedSegmentIndex === i ? "active" : ""
                        }`}
                        onClick={() => handleFocusSegment(i)}
                      >
                        구간 보기
                      </button>
                      <button
                        className="seosan-seg-naver-button"
                        onClick={() => openNaverSegment(i)}
                      >
                        네이버 지도
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="seosan-no-route-message">
                {loading
                  ? "경로 정보를 계산 중입니다..."
                  : "경로 정보가 없습니다."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
