'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Car as CarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A curated pool of premium car photos used when a car has no imageUrl of its own.
 * A deterministic pick (keyed by the car) is used instead of a single default so the
 * fleet looks like a real showroom of distinct vehicles rather than one repeated stock
 * photo. Every URL here was verified to return a 200 image/jpeg. With `images.unoptimized`
 * enabled in next.config, arbitrary remote hosts render without remotePatterns config.
 */
const DEFAULT_POOL = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
];

/**
 * Deterministic string hash (djb2). Pure and stable across server/client renders,
 * so the pool pick never causes a hydration mismatch and stays consistent per car.
 */
function pickDefault(seed: string | undefined): string {
  if (!seed) return DEFAULT_POOL[0];
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  return DEFAULT_POOL[Math.abs(hash) % DEFAULT_POOL.length];
}

interface CarImageProps {
  src?: string | null;
  alt: string;
  /** Applied to the relative wrapper — set height/width/rounding here (e.g. "h-52 w-full rounded-2xl"). */
  className?: string;
  /** Extra classes merged onto the <Image> itself (e.g. a hover-zoom transform). */
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Shown inside the branded fallback if both the given src and the curated default fail to load. */
  label?: string;
  /**
   * Stable key (e.g. the car id) used to deterministically pick a curated default photo
   * when `src` is empty, so different cars show different photos. Falls back to `alt`.
   */
  seedKey?: string;
}

/**
 * Resilient car image with a three-stage fallback:
 *   0 → the car's own imageUrl
 *   1 → a curated premium default, varied per car via `seedKey` (still a real photo)
 *   2 → a branded, network-free gradient placeholder with a car icon
 * This guarantees the UI never shows a broken-image glyph, however bad the URL.
 */
export function CarImage({
  src,
  alt,
  className,
  imageClassName,
  sizes,
  priority,
  label,
  seedKey,
}: CarImageProps) {
  const fallback = pickDefault(seedKey ?? alt);
  const initialStage: 0 | 1 | 2 = src && src.trim() ? 0 : 1;
  const [stage, setStage] = useState<0 | 1 | 2>(initialStage);

  // Reset the fallback chain whenever the source changes (e.g. live URL preview
  // in the admin car form) so a freshly-typed URL is retried from scratch.
  useEffect(() => {
    setStage(src && src.trim() ? 0 : 1);
  }, [src]);

  const currentSrc = stage === 0 ? (src as string) : stage === 1 ? fallback : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950',
        className
      )}
    >
      {currentSrc ? (
        <Image
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          fill
          sizes={sizes || '(max-width: 768px) 100vw, 33vw'}
          priority={priority}
          className={cn('object-cover', imageClassName)}
          onError={() => setStage((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : s))}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.22),transparent_62%)]" />
          <CarIcon className="relative w-10 h-10 text-blue-500/70" />
          {label && (
            <span className="relative px-4 text-center text-xs font-medium text-slate-400 line-clamp-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
