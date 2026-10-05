import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PlaceholderImage } from './PlaceholderImage';

interface SplitBannerItem {
  title: string;
  subtitle?: string;
  link: string;
  imageUrl?: string | null;
}

interface SplitPromoBannersBlockProps {
  settings: {
    columns?: 2 | 3;
    banners?: SplitBannerItem[];
  };
}

export function SplitPromoBannersBlock({ settings }: SplitPromoBannersBlockProps) {
  const { columns = 2, banners } = settings || {};

  const defaultBanners: SplitBannerItem[] = [
    {
      title: 'THE WEDDING TRUNK',
      subtitle: 'Curated 5-piece royal ensemble in bespoke mahogany presentation box',
      link: '#products',
    },
    {
      title: 'THE SILK ATELIER BOX',
      subtitle: 'Pure mulberry silk Panjabi with hand-cast mother-of-pearl buttons',
      link: '#products',
    },
  ];

  const items = banners && banners.length > 0 ? banners : defaultBanners;

  return (
    <section className="py-14 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 ${
            columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
          } gap-8`}
        >
          {items.map((banner, idx) => (
            <Link
              key={idx}
              href={banner.link || '#products'}
              className="group relative rounded-3xl overflow-hidden border border-gray-200 aspect-[16/9] sm:aspect-[2/1] flex flex-col justify-end p-8 bg-black transition hover:border-gray-400 hover:shadow-xl"
            >
              <div className="absolute inset-0 z-0">
                <PlaceholderImage
                  src={banner.imageUrl}
                  alt={banner.title}
                  ratio="banner"
                  suggestedSize="800 × 500 px Promo Banner"
                  label={banner.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent group-hover:via-black/40 transition duration-500" />
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                  Curated Ensemble
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1 group-hover:text-amber-300 transition">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2 max-w-md">
                    {banner.subtitle}
                  </p>
                )}
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-amber-400 transition">
                  <span>Explore Showcase</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
