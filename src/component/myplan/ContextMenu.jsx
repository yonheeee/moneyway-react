import React, { useEffect, useRef, useState } from 'react';
import '../../css/myplan/ContextMenu.css';

const ContextMenu = ({ position, items, onClose }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({ top: 0, left: 0 });

  // 메뉴를 마우스 위(위쪽)에 뜨게 하고, 화면 밖으로 나가지 않도록 위치 보정
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const margin = 8; // 커서와의 간격 및 화면 여백

    // 기본: 커서 위에 표시
    let top = position.y - rect.height - margin;
    let left = position.x;

    // 위로 공간이 부족하면 아래에 표시
    if (top < margin) {
      top = Math.min(position.y + margin, vh - rect.height - margin);
    }

    // 오른쪽이 넘치면 좌측으로 당김
    if (left + rect.width + margin > vw) {
      left = Math.max(margin, vw - rect.width - margin);
    }

    // 왼쪽 여백 보장
    if (left < margin) left = margin;

    setStyle({ top, left });
  }, [position.x, position.y, items?.length]);

  useEffect(() => {
    const handleDismiss = () => {
      try { onClose && onClose(); } catch (_) {}
    };
    window.addEventListener('scroll', handleDismiss, { passive: true });
    window.addEventListener('wheel', handleDismiss, { passive: true });
    window.addEventListener('touchmove', handleDismiss, { passive: true });
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('scroll', handleDismiss);
      window.removeEventListener('wheel', handleDismiss);
      window.removeEventListener('touchmove', handleDismiss);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [onClose]);

  const menuStyle = {
    position: 'fixed',
    top: `${style.top}px`,
    left: `${style.left}px`,
    zIndex: 999,
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 18px rgba(0,0,0,0.13)',
    border: '1px solid #ececec',
    minWidth: '110px',
    padding: '6px 0'
  };

  const handleItemClick = (action) => {
    action();
    onClose();
  };

  return (
    <div
      className="context-menu"
      style={menuStyle}
      ref={ref}
      tabIndex={-1}
      onContextMenu={e => e.preventDefault()} // 메뉴 위에서 또 우클릭 방지
    >
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item, index) => (
          <li
            key={index}
            onClick={() => handleItemClick(item.action)}
            className={item.label === '삭제하기' ? 'danger' : ''}
            style={{
              padding: '10px 20px',
              fontSize: '15px',
              color: item.label === '삭제하기' ? '#FF3B30' : '#222',
              fontWeight: item.label === '삭제하기' ? 600 : 400,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'background 0.15s',
            }}
            onMouseDown={e => e.preventDefault()} // 포커스 방지(모바일에서)
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
