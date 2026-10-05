import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PlaceholderImage } from './PlaceholderImage';

interface PedestalItem {
  title: string;
  subtitle?: string;
  link: string;
  imageUrl?: string | null;
}

interface BentoTileItem {
  title: string;
  link: string;
  imageUrl?: string | null;
}

interface CircleCategoryItem {
  name: string;
  link: string;
  imageUrl?: string | null;
}

interface CategoryBentoBlockProps {
  settings: {
    style?: 'pedestals' | 'bento_4' | 'circle_strip';
    title?: string;
    subtitle?: string;
    pillars?: PedestalItem[];
    tiles?: BentoTileItem[];
    categories?: CircleCategoryItem[];
  };
}

export function CategoryBentoBlock({ settings }: CategoryBentoBlockProps) {
  const {
    style = 'pedestals',
    title = 'CURATED COLLECTION PILLARS',
    subtitle = 'Choose your signature aesthetic crafted by master weavers',
    pillars,
    tiles,
    categories,
  } = settings || {};

  // 1. Pedestals Layout (Zahab & Kholzi inspired)
  if (style === 'pedestals') {
    const defaultPillars: PedestalItem[] = [
      { title: 'ROYAL SILK', subtitle: 'Mulberry & Rajshahi Gold', link: '#products' },
      { title: 'FESTIVE ZARDOZI', subtitle: 'Hand-Embroidered Wedding Editions', link: '#products' },
      { title: 'BESPOKE FORMAL', subtitle: 'Royal Oxford & Egyptian Cotton', link: '#products' },
    ];
    const items = pillars && pillars.length > 0 ? pillars : defaultPillars;

    return (
      <section className="py-16 bg-black text-white border-b border-amber-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black tracking-widest uppercase text-amber-400">
              The Sovereign Pillars
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((pillar, idx) => (
              <Link
                key={idx}
                href={pillar.link || '#products'}
                className="group relative rounded-3xl overflow-hidden border border-amber-500/20 bg-luxury-950 aspect-[3/4] flex flex-col justify-end p-8 transition hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                {/* Visual Image / Luxury Placeholder */}
                <div className="absolute inset-0 z-0">
                  <PlaceholderImage
                    src={pillar.imageUrl}
                    alt={pillar.title}
                    ratio="portrait"
                    suggestedSize="600 × 800 px (Portrait)"
                    label={pillar.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent group-hover:via-black/40 transition duration-500" />
                </div>

                <div className="relative z-10">
                  <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase">
                    Pillar 0{idx + 1}
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-tight mt-1 group-hover:text-amber-300 transition">
                    {pillar.title}
                  </h3>
                  {pillar.subtitle && (
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                      {pillar.subtitle}
                    </p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                    <span>Explore Pillar</span>
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

  // 2. Bento 4-Card Grid Layout (Tashrif BD inspired)
  if (style === 'bento_4') {
    const defaultTiles: BentoTileItem[] = [
      { title: 'ROYAL PANJABI', link: '#products' },
      { title: 'EGYPTIAN SHIRTS', link: '#products' },
      { title: 'HANDLOOM KABLI', link: '#products' },
      { title: 'PERFUME OILS & ATTAR', link: '#products' },
    ];
    const items = tiles && tiles.length > 0 ? tiles : defaultTiles;

    return (
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <span className="text-xs font-black tracking-widest text-emerald-700 uppercase">
                Categories
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {title}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((tile, idx) => (
              <Link
                key={idx}
                href={tile.link || '#products'}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 aspect-[4/5] flex flex-col justify-end p-6 bg-luxury-900 transition hover:border-emerald-600 hover:shadow-xl"
              >
                <div className="absolute inset-0 z-0">
                  <PlaceholderImage
                    src={tile.imageUrl}
                    alt={tile.title}
                    ratio="portrait"
                    suggestedSize="500 × 600 px"
                    label={tile.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:via-black/30 transition duration-500" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-300 transition">
                    {tile.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-300 mt-1">
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 3. Circle Strip Layout (Modern Beauty BD inspired)
  const defaultCircles: CircleCategoryItem[] = [
    { name: 'Panjabi', link: '#products' },
    { name: 'Shirts', link: '#products' },
    { name: 'Kurta', link: '#products' },
    { name: 'Kabli', link: '#products' },
    { name: 'Silk', link: '#products' },
    { name: 'Footwear', link: '#products' },
  ];
  const items = categories && categories.length > 0 ? categories : defaultCircles;

  return (
    <section className="py-10 bg-luxury-50/50 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {title && (
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 text-center">
            {title}
          </h3>
        )}

        <div className="flex items-center justify-start sm:justify-center gap-6 overflow-x-auto pb-4 scrollbar-none">
          {items.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.link || '#products'}
              className="flex flex-col items-center gap-2.5 shrink-0 group"
            >
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-white shadow-md p-0.5 bg-white group-hover:border-amber-500 group-hover:scale-105 transition duration-300">
                <PlaceholderImage
                  src={cat.imageUrl}
                  alt={cat.name}
                  ratio="circle"
                  suggestedSize="200 × 200 px"
                  label={cat.name}
                />
              </div>
              <span className="text-xs font-black text-gray-800 group-hover:text-amber-600 transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
