import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { PlaceholderImage } from './PlaceholderImage';

interface BrandStoryBlockProps {
  settings: {
    headline?: string;
    paragraph?: string;
    imageSide?: 'left' | 'right';
    imageUrl?: string | null;
    stats?: string[];
  };
}

export function BrandStoryBlock({ settings }: BrandStoryBlockProps) {
  const {
    headline = 'BEST LUXURY ATELIER IN DHAKA',
    paragraph = 'Discover timeless tailoring where ancient Bengal handloom traditions unite with contemporary bespoke silhouettes. Every garment is cut from pure natural fibers with heirloom-grade longevity.',
    imageSide = 'right',
    imageUrl,
    stats = [
      '100% Pure Mulberry & Rajshahi Silk',
      'Hereditary Master Zardozi Threading',
      'Doorstep Try-On & Instant Exchange',
    ],
  } = settings || {};

  const isLeft = imageSide === 'left';

  return (
    <section id="craftsmanship" className="py-20 bg-luxury-900 text-white overflow-hidden border-b border-amber-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div
            className={`lg:col-span-6 ${
              isLeft ? 'lg:order-2' : 'lg:order-1'
            } space-y-6`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Heritage & Artistry</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {headline}
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
              {paragraph}
            </p>

            {stats && stats.length > 0 && (
              <div className="pt-4 space-y-3 border-t border-white/10">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-200">
                      {stat}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Frame / Luxury Placeholder */}
          <div
            className={`lg:col-span-6 ${
              isLeft ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/20 shadow-2xl aspect-[4/3] bg-black">
              <PlaceholderImage
                src={imageUrl}
                alt={headline}
                ratio="portrait"
                suggestedSize="1000 × 750 px Atelier Studio"
                label="Brand Craft Story Image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
