import React, { useEffect, useRef } from 'react';

const InfiniteScrollSentinel = ({ onIntersect, loading, hasMore }) => {
  const ref = useRef();

  useEffect(() => {
    if (!hasMore || loading) return;

    // .list-wrapper를 root로 지정 (리스트 스크롤 기준)
    const rootElem = document.querySelector('.list-wrapper');
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      { root: rootElem, threshold: 1.0 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onIntersect, loading, hasMore]);

  return <div ref={ref} style={{ height: 1 }} />;
};

export default InfiniteScrollSentinel;
