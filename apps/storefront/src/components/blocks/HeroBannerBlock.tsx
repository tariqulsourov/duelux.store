import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { PlaceholderImage } from './PlaceholderImage';

interface HeroBannerBlockProps {
  settings: {
    style?: 'single' | 'tri_banner';
    headline?: string;
    subheadline?: string;
    ctaPrimaryText?: string;
    ctaPrimaryLink?: string;
    ctaSecondaryText?: string;
    ctaSecondaryLink?: string;
    badgeText?: string;
    imageUrl?: string | null;
    sideBanner1?: { title: string; link: string; imageUrl?: string | null };
    sideBanner2?: { title: string; link: string; imageUrl?: string | null };
  };
}

export function HeroBannerBlock({ settings }: HeroBannerBlockProps) {
  const {
    style = 'single',
    headline = 'TIMELESS DRAPES, RARE TREASURES',
    subheadline = 'Artisanal luxury for the discerning connoisseur. Master-woven Mulberry Silks & Zardozi embroidery.',
    ctaPrimaryText = 'Shop The Collection',
    ctaPrimaryLink = '#products',
    ctaSecondaryText = 'Explore Categories',
    ctaSecondaryLink = '#categories',
    badgeText = '✨ Royal Connoisseur Collection 2026',
    imageUrl,
    sideBanner1,
    sideBanner2,
  } = settings || {};

  if (style === 'tri_banner') {
    return (
      <section className="relative bg-luxury-950 py-6 lg:py-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Primary Banner (col-span-8) */}
            <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-white/10 min-h-[440px] flex flex-col justify-end p-8 lg:p-12 group bg-black">
              <div className="absolute inset-0 z-0">
                <PlaceholderImage
                  src={imageUrl}
                  alt={headline}
                  ratio="banner"
                  suggestedSize="1200 × 600 px (Main Hero)"
                  label="Hero Banner Image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              <div className="relative z-10 max-w-2xl">
                {badgeText && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-amber-300 mb-4">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>{badgeText}</span>
                  </div>
                )}
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {headline}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-gray-300 line-clamp-2 max-w-xl">
                  {subheadline}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href={ctaPrimaryLink}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
                  >
                    <span>{ctaPrimaryText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Stacked 2 Side Banners (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Side Banner 1 */}
              <Link
                href={sideBanner1?.link || '#products'}
                className="relative rounded-3xl overflow-hidden border border-white/10 flex-1 min-h-[200px] flex flex-col justify-end p-6 group bg-black"
              >
                <div className="absolute inset-0 z-0">
                  <PlaceholderImage
                    src={sideBanner1?.imageUrl}
                    alt={sideBanner1?.title || 'Side Promo 1'}
                    ratio="square"
                    suggestedSize="600 × 350 px"
                    label="Promo Banner 1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:via-black/40 transition" />
                </div>
                <div className="relative z-10">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                    Featured Spotlight
                  </span>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition mt-1">
                    {sideBanner1?.title || '31% OFF SHIRTS'}
                  </h3>
                </div>
              </Link>

              {/* Side Banner 2 */}
              <Link
                href={sideBanner2?.link || '#products'}
                className="relative rounded-3xl overflow-hidden border border-white/10 flex-1 min-h-[200px] flex flex-col justify-end p-6 group bg-black"
              >
                <div className="absolute inset-0 z-0">
                  <PlaceholderImage
                    src={sideBanner2?.imageUrl}
                    alt={sideBanner2?.title || 'Side Promo 2'}
                    ratio="square"
                    suggestedSize="600 × 350 px"
                    label="Promo Banner 2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:via-black/40 transition" />
                </div>
                <div className="relative z-10">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                    Limited Bundle
                  </span>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition mt-1">
                    {sideBanner2?.title || '25% OFF KURTA'}
                  </h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Single Full-Width Hero (Default)
  return (
    <section className="relative overflow-hidden bg-black text-white py-20 lg:py-32 border-b border-amber-900/30">
      {/* Background Image or Luxury Placeholder */}
      <div className="absolute inset-0 z-0 opacity-40">
        <PlaceholderImage
          src={imageUrl}
          alt={headline}
          ratio="banner"
          suggestedSize="1920 × 800 px"
          label="Hero Banner Image"
        />
      </div>

      {/* Atmospheric Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent z-0" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60 z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-amber-300 mb-6 shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{badgeText}</span>
            </div>
          )}

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
            {headline}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl font-normal">
            {subheadline}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={ctaPrimaryLink}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition"
            >
              <span>{ctaPrimaryText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {ctaSecondaryText && (
              <Link
                href={ctaSecondaryLink}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-8 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
              >
                <Compass className="h-4 w-4 text-amber-400" />
                <span>{ctaSecondaryText}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
