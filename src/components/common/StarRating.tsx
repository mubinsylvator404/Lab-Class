import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = 'sm',
  interactive = false,
  onChange,
}) => {
  const iconSize =
    size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
      {Array.from({ length: max }).map((_, index) => {
        const starVal = index + 1;
        const filled = starVal <= Math.round(rating);
        if (interactive) {
          return (
            <button
              key={starVal}
              type="button"
              onClick={() => onChange?.(starVal)}
              aria-label={`Rate ${starVal} out of ${max} stars`}
              className="p-0.5 rounded focus-visible:outline-2 focus-visible:outline-blue-600 transition-transform hover:scale-110"
            >
              <Star
                className={`${iconSize} ${
                  starVal <= rating
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-slate-300'
                }`}
              />
            </button>
          );
        }
        return (
          <Star
            key={starVal}
            className={`${iconSize} ${
              filled ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
            }`}
          />
        );
      })}
    </div>
  );
};
