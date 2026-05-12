import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "../../css/search/SearchMain.css";
import "../../css/search/list-wrapper-scroll.css";
import PlaceListView from "./PlaceListView";
import PlaceDetailView from "./PlaceDetailView";
import SearchPlaceBox from "./SearchPlaceBox";
import CategorySelector from "./CategorySelector";
import SearchInput from "./SearchInput";
import { getPlacesByCategory, searchPlacesByKeyword } from "../../api/tourApi";
import ShoppingTutorial from "./ShoppingTutorial";

/* =======================
   🔧 디버그 유틸
======================= */
const logSample = (label, data) => {
  try {
    if (Array.isArray(data)) {
      console.log(`${label} (length: ${data.length})`);
      if (data.length > 0) {
        // 첫 아이템만 보기 좋게
        console.log(`${label} [0]`, data[0]);
        // 표로 보고 싶으면 아래 주석 해제
        // console.table([data[0]]);
      }
    } else {
      console.log(label, data);
    }
  } catch (e) {
    console.warn("logSample error:", e);
  }
};

// ✅ 위경도 유효성 검사 함수 (지도 마커용)
const isValidJejuCoordinate = (lat, lng) => {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= 33.0 &&
    lat <= 34.0 &&
    lng >= 126.0 &&
    lng <= 127.0
  );
};

const CATEGORY_MAP = {
  관광지: "TOURIST_ATTRACTION",
  액티비티: "ACTIVITY",
  식당: "RESTAURANT",
  카페: "CAFE",
  쇼핑: "SHOPPING",
  숙소: "ACCOMMODATION",
};

const SearchMain = () => {
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const overlayRef = useRef(null);

  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultCategory = queryParams.get("category") || "카페";
  const [category, setCategory] = useState(defaultCategory);
  const [showTutorial, setShowTutorial] = useState(false);

  // 🔧 오버레이 생성 유틸
  const showOverlay = useCallback(
    (place, position) => {
      if (!map) return;

      // 기존 오버레이 제거
      if (overlayRef.current) overlayRef.current.setMap(null);

      // 디버그: 오버레이 표시 로그
      console.groupCollapsed("[Overlay] Show");
      console.log("place:", place);
      console.log("position:", position?.toString?.() ?? position);
      console.groupEnd();

      const content = document.createElement("div");
      content.className = "custom-overlay-card";
      content.innerHTML = `
        <div style="background:white; border-radius:8px; border:2px solid #2d6cff; padding:10px; width:180px; box-shadow:0 2px 8px rgba(0,0,0,0.15);">
          ${
            place.imageUrls?.[0]
              ? `<img src="${place.imageUrls[0]}" style="width:100%; height:80px; object-fit:cover; border-radius:4px;" />`
              : ""
          }
          <div style="margin-top:6px; font-size:14px; font-weight:bold; color:#2d6cff;">${place.title}</div>
          <button id="detail-btn" style="margin-top:8px; width:100%; background:#2d6cff; color:white; border:none; border-radius:4px; padding:6px 0; cursor:pointer;">
            자세히 보기
          </button>
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({ position, content, yAnchor: 1 });
      overlay.setMap(map);
      overlayRef.current = overlay;

      // 버튼 이벤트 연결
      setTimeout(() => {
        const btn = document.getElementById("detail-btn");
        if (btn) {
          btn.onclick = () => {
            console.log("[Overlay] '자세히 보기' 클릭 → setSelectedPlace", place);
            setSelectedPlace(place);
            overlay.setMap(null);
          };
        }
      }, 0);
    },
    [map]
  );

  // ✅ 단일 진입 함수: 옵션으로 동작 제어
  const handlePlaceSelect = useCallback(
    (place, opts = {}) => {
      const {
        showDetail = false,   // 상세 열기
        panMap = true,        // 지도 이동/확대
        overlay = false,      // 오버레이 표시
        zoomLevel = 4,        // 이동 시 레벨
      } = opts;

      console.groupCollapsed("[Select] handlePlaceSelect");
      console.log("place:", place);
      console.log("options:", opts);
      console.groupEnd();

      const hasCoord =
        isValidJejuCoordinate(place?.latitude, place?.longitude);

      if (map && panMap && hasCoord) {
        const position = new window.kakao.maps.LatLng(place.latitude, place.longitude);
        map.setLevel(zoomLevel);
        map.panTo(position);

        if (overlay) {
          showOverlay(place, position);
        } else if (overlayRef.current) {
          // 리스트에서 상세로 바로 들어갈 때는 오버레이 제거
          overlayRef.current.setMap(null);
          overlayRef.current = null;
        }
      }

      if (showDetail) {
        setSelectedPlace(place);
      }
    },
    [map, showOverlay]
  );

  const handleBack = () => {
    console.log("[Back] 상세 닫기");
    setSelectedPlace(null);
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }
  };

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSearchResults(false);
    }, 50);
  };

  useEffect(() => {
    if (!window.kakao) return;
    window.kakao.maps.load(() => {
      const mapInstance = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(33.3839982207, 126.5895708953),
        level: 9,
      });
      console.log("[Map] kakao map init", mapInstance);
      setMap(mapInstance);
    });
  }, []);


  useEffect(() => {
    try {
      const key = "mw_search_tutorial_v1";
      const seen = localStorage.getItem(key);
      if (!seen) {
        setShowTutorial(true);
        localStorage.setItem(key, "1");
      }
    } catch (_) {}
  }, []);

  const loadPlaces = useCallback(async () => {
    try {
      const categoryCode = CATEGORY_MAP[category];
      console.groupCollapsed("[API] getPlacesByCategory");
      console.log("category:", category, "→ code:", categoryCode);

      const data = await getPlacesByCategory(categoryCode);

      // 응답 확인 로그
      logSample("response data", data);

      // 타입/필드 간단 확인
      if (Array.isArray(data)) {
        const first = data[0];
        if (first) {
          console.log("fields of first item:", Object.keys(first));
          // 자주 쓰는 필드 빠르게 확인
          console.log("sample fields:", {
            placeId: first.placeId,
            title: first.title,
            categoryName: first.categoryName,
            address: first.address,
            latitude: first.latitude,
            longitude: first.longitude,
            rating: first.rating,
            imageUrls: first.imageUrls?.length,
          });
        }
      }
      console.groupEnd();

      setPlaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("카테고리별 관광지 로딩 실패:", err);
    }
  }, [category]);

  useEffect(() => {
    setPlaces([]);
    loadPlaces();
  }, [category, loadPlaces]);

  useEffect(() => {
    if (!map || places.length === 0) return;

    if (clustererRef.current) clustererRef.current.clear();

    // ✅ 유효한 좌표만 마커 생성
    const validPlaces = places.filter((p) => isValidJejuCoordinate(p.latitude, p.longitude));
    console.groupCollapsed("[Map] Marker build");
    console.log("places.length:", places.length);
    console.log("validPlaces.length:", validPlaces.length);
    console.groupEnd();

    const newMarkers = validPlaces.map((place) => {
      const position = new window.kakao.maps.LatLng(place.latitude, place.longitude);
      const marker = new window.kakao.maps.Marker({ position });
      marker._placeData = place;
      window.kakao.maps.event.addListener(marker, "click", () => {
        console.log("[Marker] clicked:", place?.title, place);
        // 마커 클릭: 지도 이동 + 오버레이
        handlePlaceSelect(place, { panMap: true, overlay: true, showDetail: false, zoomLevel: 4 });
      });
      return marker;
    });

    if (newMarkers.length === 0) {
      console.warn("⚠️ 유효한 좌표를 가진 장소가 없어 마커를 표시할 수 없습니다.");
      return;
    }

    const clusterer = new window.kakao.maps.MarkerClusterer({
      map,
      markers: newMarkers,
      gridSize: 60,
      averageCenter: true,
      minLevel: 7,
    });

    console.log("[Map] Clusterer created. markers:", newMarkers.length);

    clustererRef.current = clusterer;

    const bounds = new window.kakao.maps.LatLngBounds();
    newMarkers.forEach((m) => bounds.extend(m.getPosition()));
    map.setBounds(bounds);
  }, [map, places, handlePlaceSelect]);

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const fetchSearch = async () => {
      try {
        console.groupCollapsed("[API] searchPlacesByKeyword");
        console.log("keyword:", searchTerm);
        const results = await searchPlacesByKeyword(searchTerm);
        logSample("search results", results);
        console.groupEnd();
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (e) {
        console.error("검색 실패:", e);
        setSearchResults([]);
      }
    };

    fetchSearch();
  }, [searchTerm]);

  // 선택된 장소 변경 로깅
  useEffect(() => {
    if (!selectedPlace) return;
    console.groupCollapsed("[Detail] Open");
    console.log("selectedPlace:", selectedPlace);
    console.groupEnd();
  }, [selectedPlace]);

  return (
    <>
      <div className="map-header"></div>
      <div className="map-container">
        <div className={`category-container ${selectedPlace ? "detail-mode" : ""}`}>
          {selectedPlace ? (
            <PlaceDetailView place={selectedPlace} onBack={handleBack} />
          ) : (
            <>
              <h1>
                <span className="highlight-blue">일정</span>을 추가하고
                <br />
                나만의 <span className="highlight-blue">계획</span>을 짜세요
              </h1>
              <div className="search-container">
                <SearchInput 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm} 
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                {searchTerm && showSearchResults && (
                  <SearchPlaceBox
                    results={searchResults}
                    onSelect={(place) => {
                      handlePlaceSelect(place, { showDetail: true, panMap: true, overlay: false, zoomLevel: 4 });
                      setShowSearchResults(false); // 검색 결과 선택 시 숨기기
                    }}
                  />
                )}
              </div>
              <CategorySelector
                category={category}
                setCategory={setCategory}
                categories={Object.keys(CATEGORY_MAP)}
              />
              <hr className="category-divider" />
              <div key={category} className="list-wrapper fade-in">
                <PlaceListView
                  places={places}
                  onSelect={(place) =>
                    handlePlaceSelect(place, { showDetail: true, panMap: true, overlay: false, zoomLevel: 4 })
                  }
                />
              </div>
            </>
          )}
        </div>
        <div className="map-canvas" ref={mapRef} />
      </div>
      {showTutorial && <ShoppingTutorial onClose={() => setShowTutorial(false)} />}
    </>
  );
};

export default SearchMain;
