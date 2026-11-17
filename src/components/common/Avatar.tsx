import React, { useState } from 'react';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-7 h-7 text-[11px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${SIZE_MAP[size]} rounded-lg object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${SIZE_MAP[size]} rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80 font-semibold flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
