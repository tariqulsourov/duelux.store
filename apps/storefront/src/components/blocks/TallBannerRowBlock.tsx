import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { PlaceholderImage } from './PlaceholderImage';

interface TallBannerRowBlockProps {
  settings: {
    categoryName?: string;
    categoryDescription?: string;
    badgeText?: string;
    exploreAllText?: string;
    tallPoster?: {
      badgeText?: string;
      title?: string;
      subtitle?: string;
      buttonText?: string;
      link?: string;
      imageUrl?: string | null;
    };
    queryFilter?: string;
    itemLimit?: number;
  };
  products?: any[];
}

export function TallBannerRowBlock({ settings, products = [] }: TallBannerRowBlockProps) {
  const {
    categoryName = 'ROYAL SILK COLLECTION',
    categoryDescription = 'Master-crafted garments paired with bespoke accessories',
    badgeText = 'Signature Collection',
    exploreAllText = 'Explore All',
    tallPoster,
    queryFilter,
    itemLimit = 4,
  } = settings || {};

  const poster = {
    title: tallPoster?.title || 'SWEET SILK',
    subtitle: tallPoster?.subtitle || 'Starting from ৳3,850',
    buttonText: tallPoster?.buttonText || 'View All Silk',
    link: tallPoster?.link || '#products',
    imageUrl: tallPoster?.imageUrl,
    badgeText: tallPoster?.badgeText || 'Featured Edit',
  };

  // Filter products for this row
  let rowProducts = [...products];
  if (queryFilter && queryFilter !== 'ALL') {
    rowProducts = rowProducts.filter(
      (p) =>
        p.category?.name?.toLowerCase().includes(queryFilter.toLowerCase()) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(queryFilter.toLowerCase()))
    );
    if (rowProducts.length === 0) rowProducts = [...products];
  }
  rowProducts = rowProducts.slice(0, itemLimit);

  return (
    <section className="py-16 bg-luxury-50/30 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="mb-8 pb-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-700">
              {badgeText}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {categoryName}
            </h2>
            {categoryDescription && (
              <p className="mt-1 text-sm text-gray-500">{categoryDescription}</p>
            )}
          </div>
          <Link
            href={poster.link || '#products'}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-luxury-900 hover:text-amber-600 transition"
          >
            <span>{exploreAllText}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 2-Column Row Layout: Left Tall Poster (1/3) + Right Product Grid (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Tall Promotional Poster */}
          <div className="lg:col-span-4 relative rounded-3xl overflow-hidden border border-amber-900/20 bg-luxury-950 flex flex-col justify-end p-8 min-h-[500px] shadow-lg group">
            <div className="absolute inset-0 z-0">
              <PlaceholderImage
                src={poster.imageUrl}
                alt={poster.title || 'Tall Promo Poster'}
                ratio="tall"
                suggestedSize="500 × 800 px (Tall Poster)"
                label={poster.title || 'Tall Promo Banner'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:via-black/35 transition duration-500" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[11px] font-bold text-amber-300 mb-3 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>{poster.badgeText}</span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">
                {poster.title}
              </h3>
              {poster.subtitle && (
                <p className="text-sm font-semibold text-gray-300 mt-2">
                  {poster.subtitle}
                </p>
              )}
              <div className="mt-6">
                <Link
                  href={poster.link || '#products'}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
                >
                  <span>{poster.buttonText || 'Explore Now'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Product Grid (Col-span-8: 4 products in 2x2 grid) */}
          <div className="lg:col-span-8">
            {rowProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                {rowProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 p-8 text-center bg-white">
                <p className="text-sm font-bold text-gray-500">
                  Products in this category will display here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
