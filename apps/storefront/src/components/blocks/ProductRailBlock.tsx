import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from '../ProductCard';

interface ProductRailBlockProps {
  settings: {
    sectionTitle?: string;
    sectionSubtitle?: string;
    badgeText?: string;
    viewAllText?: string;
    queryFilter?: 'ALL' | 'FEATURED' | string;
    columns?: number;
    itemLimit?: number;
    viewAllLink?: string;
  };
  products?: any[];
}

export function ProductRailBlock({ settings, products = [] }: ProductRailBlockProps) {
  const {
    sectionTitle = 'FEATURED MASTERPIECES',
    sectionSubtitle = 'Bespoke apparel handcrafted by master tailors in Bangladesh',
    badgeText = 'Exclusive Collection',
    viewAllText = 'View Full Showcase',
    queryFilter = 'ALL',
    columns = 4,
    itemLimit = 8,
    viewAllLink = '#collection',
  } = settings || {};

  // Filter products based on queryFilter
  let displayedProducts = [...products];
  if (queryFilter === 'FEATURED') {
    // If tagged or category has featured, or simply first items
    displayedProducts = displayedProducts.filter(
      (p) => p.isFeatured || p.tags?.includes('featured') || p.tags?.includes('hot')
    );
    if (displayedProducts.length === 0) {
      displayedProducts = [...products]; // fallback if no specific featured tags
    }
  }

  // Slice to limit
  displayedProducts = displayedProducts.slice(0, itemLimit);

  // Column grid class map
  const columnClasses: Record<number, string> = {
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  };

  const gridClass = columnClasses[columns] || columnClasses[4];

  return (
    <section id="products" className="py-16 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Accent Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-gray-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-700">
                {badgeText}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p className="mt-1 text-sm text-gray-500">{sectionSubtitle}</p>
            )}
          </div>

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-luxury-900 hover:text-amber-600 transition group shrink-0"
            >
              <span>{viewAllText}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
          )}
        </div>

        {/* Product Cards Grid */}
        {displayedProducts.length > 0 ? (
          <div className={`grid ${gridClass} gap-6`}>
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center bg-luxury-50/50">
            <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-black text-gray-900">
              No products found for this section yet
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Add products in the POS / Inventory panel to showcase them automatically in this rail.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
