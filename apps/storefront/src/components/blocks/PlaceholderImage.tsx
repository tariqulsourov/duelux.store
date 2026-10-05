'use client';

import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface PlaceholderImageProps {
  src?: string | null;
  alt: string;
  ratio?: 'banner' | 'tall' | 'square' | 'portrait' | 'video' | 'circle';
  suggestedSize?: string;
  label?: string;
  className?: string;
}

export function PlaceholderImage({
  src,
  alt,
  ratio = 'banner',
  suggestedSize,
  label,
  className = '',
}: PlaceholderImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  if (src && src.trim() !== '' && !loadFailed) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
        onError={() => setLoadFailed(true)}
      />
    );
  }

  const defaultSizes: Record<string, string> = {
    banner: '1920 × 800 px',
    tall: '600 × 900 px',
    portrait: '600 × 800 px',
    square: '600 × 600 px',
    video: '1080 × 1920 px (9:16)',
    circle: '300 × 300 px',
  };

  const sizeText = suggestedSize || defaultSizes[ratio] || 'High-Res Luxury Asset';

  return (
    <div
      className={`placeholder-fallback relative flex flex-col items-center justify-center bg-gradient-to-br from-luxury-900 via-luxury-950 to-black text-white p-6 text-center select-none overflow-hidden border border-white/10 ${
        ratio === 'circle' ? 'rounded-full aspect-square' : 'w-full h-full'
      } ${className}`}
    >
      {/* Subtle Luxury Pattern Watermark */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Gold Monogram Badge */}
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
        <ImageIcon className="h-6 w-6 stroke-[1.5]" />
      </div>

      <div className="relative z-10 max-w-[85%]">
        <span className="block text-xs font-black tracking-widest uppercase text-amber-300/90 mb-1">
          {label || alt}
        </span>
        <span className="inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-gray-300 tracking-wider">
          {sizeText}
        </span>
      </div>
    </div>
  );
}
