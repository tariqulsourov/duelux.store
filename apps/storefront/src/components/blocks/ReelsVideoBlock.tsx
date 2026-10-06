import React from 'react';
import Link from 'next/link';
import { Play, Eye, Clock } from 'lucide-react';
import { PlaceholderImage } from './PlaceholderImage';

interface ReelItem {
  title: string;
  videoDuration?: string;
  views?: string;
  thumbnail?: string | null;
  productLink?: string;
}

interface ReelsVideoBlockProps {
  settings: {
    title?: string;
    subtitle?: string;
    badgeText?: string;
    ctaText?: string;
    reels?: ReelItem[];
  };
}

export function ReelsVideoBlock({ settings }: ReelsVideoBlockProps) {
  const {
    title = 'WATCH BEFORE YOU BUY',
    subtitle = 'Real video previews of fabric drape, texture, and master tailoring',
    badgeText = 'Atelier Video Reels',
    ctaText = 'Tap to watch & shop →',
    reels,
  } = settings || {};

  const defaultReels: ReelItem[] = [
    {
      title: 'Zardozi Gold Silk Panjabi',
      videoDuration: '0:28',
      views: '14.2K',
      productLink: '#products',
    },
    {
      title: 'Royal Oxford High Collar',
      videoDuration: '0:35',
      views: '9.8K',
      productLink: '#products',
    },
    {
      title: 'Tangail Handloom Weave Drape',
      videoDuration: '0:42',
      views: '22.1K',
      productLink: '#products',
    },
  ];

  const items = reels && reels.length > 0 ? reels : defaultReels;

  return (
    <section className="py-16 bg-luxury-950 text-white border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            {badgeText}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-xs sm:text-sm text-gray-400">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {items.map((reel, idx) => (
            <Link
              key={idx}
              href={reel.productLink || '#products'}
              className="group relative rounded-3xl overflow-hidden border border-white/10 aspect-[9/16] flex flex-col justify-between p-6 bg-black transition hover:border-amber-400 hover:scale-[1.02] shadow-xl shadow-black/50"
            >
              <div className="absolute inset-0 z-0">
                <PlaceholderImage
                  src={reel.thumbnail}
                  alt={reel.title}
                  ratio="video"
                  suggestedSize="1080 × 1920 px (9:16 Video)"
                  label={reel.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50 group-hover:via-black/20 transition duration-300" />
              </div>

              {/* Top Meta Badges (Views & Duration) */}
              <div className="relative z-10 flex items-center justify-between">
                {reel.views && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-gray-200 border border-white/10">
                    <Eye className="h-3 w-3 text-amber-400" />
                    <span>{reel.views}</span>
                  </span>
                )}
                {reel.videoDuration && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-gray-200 border border-white/10">
                    <Clock className="h-3 w-3 text-amber-400" />
                    <span>{reel.videoDuration}</span>
                  </span>
                )}
              </div>

              {/* Center Play Button Overlay */}
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/40 group-hover:scale-110 group-hover:bg-amber-400 transition">
                <Play className="h-6 w-6 fill-current ml-0.5" />
              </div>

              {/* Bottom Title */}
              <div className="relative z-10">
                <h4 className="text-base font-black text-white group-hover:text-amber-300 transition line-clamp-2">
                  {reel.title}
                </h4>
                <span className="text-[11px] font-bold text-amber-400/90 mt-1 inline-block">
                  {ctaText}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
