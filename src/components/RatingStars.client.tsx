"use client";

import { useState } from 'react';

type RatingStarsProps = {
  rating?: number;
  size?: 'sm' | 'md' | 'lg';
  onRate?: (value: number) => void;
};

const starSizes: Record<NonNullable<RatingStarsProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export default function RatingStars({ rating = 0, size = 'md', onRate }: RatingStarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((value) => {
        const active = hover !== null ? value <= hover : value <= rating;
        return (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} star`}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onRate?.(value)}
            className={`${starSizes[size]} transition-transform hover:-translate-y-0.5 ${
              active ? 'text-highlight drop-shadow-[0_0_6px_rgba(255,209,102,0.6)]' : 'text-gray-600'
            }`}
          >
            {active ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}
