
import React from "react";
import "../../css/search/SearchPlaceBox.css";

const SearchPlaceBox = ({ results = [], onSelect }) => {

  const renderStars = (rating) => {
    const safeRating = typeof rating === "number" && !isNaN(rating) ? rating : 0;
    const stars = Math.round(safeRating);
    return (
      <span className="star-rating">
        <span className="rating-number">{safeRating.toFixed(1)}</span>
        <span className="stars">
          {"★".repeat(stars)}
          {"☆".repeat(5 - stars)}
        </span>
      </span>
    );
  };

  return (
    <div className="search-place-box">
      {results.length === 0 ? (
        <div className="search-no-result">검색 결과가 없습니다.</div>
      ) : (
        results.map((place) => (
          <div
            key={place.placeId}
            className="search-item"
            onClick={() => onSelect(place)}
          >
            {place.imageUrls?.[0] && (
              <img src={place.imageUrls[0]} alt={place.title} />
            )}
            <div className="search-item-info">
              <div className="search-title-row">
                <strong>{place.title}</strong>
                {renderStars(place.rating)}
              </div>
              <span className="meta">{place.categoryName}</span>
              <span className="meta">{place.address}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SearchPlaceBox;
