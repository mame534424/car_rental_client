import React from 'react';

export function CarCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 animate-pulse border border-slate-800">
      <div className="w-full h-48 bg-slate-800/80 rounded-xl" />
      <div className="space-y-2">
        <div className="h-6 bg-slate-800 rounded-md w-3/4" />
        <div className="h-4 bg-slate-800/60 rounded-md w-1/2" />
      </div>
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="h-7 bg-slate-800 rounded-md w-1/3" />
        <div className="h-10 bg-slate-800 rounded-xl w-28" />
      </div>
    </div>
  );
}

export function CarGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CarCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CarDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-8 bg-slate-800 rounded-md w-1/4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full h-96 bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-800/60 rounded-xl" />
        </div>
        <div className="h-96 bg-slate-800/80 rounded-2xl" />
      </div>
    </div>
  );
}
