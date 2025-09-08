import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

interface SimpleRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

const SimpleRating: React.FC<SimpleRatingProps> = ({
  value,
  onChange,
  size = 'md',
  readOnly = true
}) => {
  const starSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  const handleStarClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center space-x-0.5">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          onClick={() => handleStarClick(index)}
          className={`cursor-${readOnly ? 'default' : 'pointer'} text-yellow-400`}
        >
          {index < value ? (
            <StarIcon className={starSize} />
          ) : (
            <StarIconOutline className={starSize} />
          )}
        </span>
      ))}
    </div>
  );
};

export default SimpleRating;
