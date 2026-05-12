import React from 'react';

const SearchInput = ({ searchTerm, setSearchTerm, onSubmit, onFocus, onBlur }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit) onSubmit();
    }
  };

  return (
    <div className="search-wrapper">
      <input
        type="text"
        className="search-input"
        placeholder="장소, 액티비티 등을 검색하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
};

export default SearchInput;
