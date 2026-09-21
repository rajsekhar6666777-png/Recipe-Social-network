import React, { useState } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ value = 0, count = 5, onChange, readonly = false, size = '1rem', showCount = true, totalCount }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (val) => {
    if (!readonly && onChange) {
      onChange(val);
    }
  };

  const displayRating = hoverValue || value;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {Array.from({ length: count }, (_, index) => {
        const starValue = index + 1;
        const isFilled = displayRating >= starValue;
        const isHalf = displayRating >= starValue - 0.5 && displayRating < starValue;

        return (
          <span
            key={index}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            style={{
              cursor: readonly ? 'default' : 'pointer',
              color: isFilled || isHalf ? '#ffb703' : 'var(--border-color)',
              fontSize: size,
              transition: 'transform 0.15s ease, color 0.15s ease',
              display: 'inline-flex',
            }}
          >
            {isFilled ? <FaStar /> : isHalf ? <FaStarHalfAlt /> : <FaRegStar />}
          </span>
        );
      })}

      {showCount && (
        <span style={{ fontSize: '0.825rem', fontWeight: '700', marginLeft: '0.25rem', color: 'var(--text-main)' }}>
          {parseFloat(value).toFixed(1)} {totalCount !== undefined && <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({totalCount})</span>}
        </span>
      )}
    </div>
  );
};

export default StarRating;
