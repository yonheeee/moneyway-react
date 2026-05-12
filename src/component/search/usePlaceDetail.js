import { useEffect, useState } from 'react';
import { getTourPlaceById } from '../../api/tourApi.js';

const usePlaceDetail = (place) => {
  const [placeDetail, setPlaceDetail] = useState(place);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!place?.id) return;

    setLoading(true);
    getTourPlaceById(place.id)
      .then((data) => {
        if (data) {
          setPlaceDetail((prev) => ({ ...prev, ...data }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('장소 상세 호출 실패:', err);
        setLoading(false);
      });
  }, [place]);

  return { placeDetail, loading };
};

export default usePlaceDetail;
