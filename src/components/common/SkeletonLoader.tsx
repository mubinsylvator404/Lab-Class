import React from 'react';

export const CardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 animate-pulse"
        >
          <div className="h-3 w-28 bg-slate-200 rounded" />
          <div className="h-5 w-3/4 bg-slate-200 rounded" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-slate-100 rounded" />
            <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
