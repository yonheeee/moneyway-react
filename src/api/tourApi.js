import api from "./axios.js";
import noImage from "../images/planning/noImage.svg";

// 유효한 제주도 좌표인지 확인
export const isValidJejuCoordinate = (lat, lng) => {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= 33.0 &&
    lat <= 34.0 &&
    lng >= 126.0 &&
    lng <= 127.0
  );
};

// 명세서에 맞는 카테고리 매핑
export const getCategoryFromName = (name) => {
  const mapping = {
    식당: "RESTAURANT",
    카페: "CAFE",
    숙소: "ACCOMMODATION",
    관광지: "TOURIST_ATTRACTION",
    "액티비티/체험": "ACTIVITY",
    쇼핑: "SHOPPING",
  };
  return mapping[name] || "ETC";
};

// 공통 응답 → 프론트에서 사용할 형식으로 변환
export const mapPlace = (item) => {
  const lat = Number(item.latitude);
  const lng = Number(item.longitude);

  // if (!isValidJejuCoordinate(lat, lng)) return null;

  return {
    placeId: item.placeId,
    title: item.title,
    category: getCategoryFromName(item.categoryName),
    categoryName: item.categoryName,
    address: item.address,
    priceInfo: item.priceInfo,
    imageUrls:
      item.imageUrls?.length > 0
        ? item.imageUrls
        : item.thumbnailUrl
        ? [item.thumbnailUrl]
        : [noImage],
    latitude: lat,
    longitude: lng,
    description: item.description || "",
    menu: item.menu || "",
    review: item.topReview || "",
    rating : item.rating || 0,
  };
};

// ✅ 1. 카테고리별 조회 (with page)
export const getPlacesByCategory = async (category) => {
  try {
    const { data } = await api.get(`/places`, {
      params: {
        category,
        size: 500, // ✅ 여기를 꼭 명시
      },
    });
    return Array.isArray(data.content)
      ? data.content.map(mapPlace).filter(Boolean)
      : [];
  } catch (err) {
    console.error(`❌ 카테고리(${category}) 조회 실패:`, err);
    return [];
  }
};

// ✅ 2. 단건 조회
export const getPlaceById = async (placeId) => {
  try {
    const { data } = await api.get(`/places/${placeId}`);
    return mapPlace(data) || null;
  } catch (err) {
    console.error(`❌ 장소(${placeId}) 상세 조회 실패:`, err);
    return null;
  }
};

// 가정: 서버 페이지는 0-based. 필요시 pageBase를 1로 바꾸세요.
const PAGE_BASE = 0;       // 서버가 0-based면 0, 1-based면 1
const DEFAULT_SIZE = 20;   // 원하는 페이지 사이즈로 조정

export const searchPlacesByKeyword = async (keyword, page = 1, size = DEFAULT_SIZE) => {
  const q = (keyword ?? "").trim();
  if (!q) return []; // 빈 키워드 방지

  // 서버가 0-based라면 클라이언트 1-based 입력을 0-based로 보정
  const serverPage = Math.max( (page ?? 1) - (PAGE_BASE === 0 ? 1 : 0), 0 );

  try {
    const { data } = await api.get("/places/search", {
      params: { keyword: q, page: serverPage, size },
    });

    const list = Array.isArray(data?.content) ? data.content : [];
    return list.map(mapPlace).filter(Boolean);
  } catch (err) {
    console.error(`❌ 키워드(${q}) 검색 실패:`, err);
    return [];
  }
};
