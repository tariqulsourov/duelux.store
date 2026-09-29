'use client';

import React, { useState } from 'react';
import { Search, PackageCheck, AlertTriangle } from 'lucide-react';

export interface CatalogVariant {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  barcode: string;
  sellingPrice: string | number;
  taxRatePercent: string | number;
  isTaxExempt?: boolean;
  onHandQty: number;
}

interface PosProductCatalogProps {
  items: CatalogVariant[];
  onSelectItem: (item: CatalogVariant) => void;
  isLoading?: boolean;
}

export function PosProductCatalog({
  items,
  onSelectItem,
  isLoading = false,
}: PosProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.productTitle.toLowerCase().includes(q) ||
      item.variantTitle.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.barcode.includes(q);

    return matchesSearch;
  });

  return (
    <div className="flex h-full flex-col bg-gray-50/60 p-4 overflow-hidden">
      {/* Search Input Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Title, SKU or Barcode... (or scan directly)"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium shadow-sm transition placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid of Sellable Variant Cards */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-500">
            Loading products...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
            <PackageCheck className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium">No products match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => {
              const isLowStock = item.onHandQty > 0 && item.onHandQty <= 5;
              const isOutOfStock = item.onHandQty <= 0;

              return (
                <button
                  key={item.variantId}
                  type="button"
                  onClick={() => onSelectItem(item)}
                  disabled={isOutOfStock}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition shadow-sm ${
                    isOutOfStock
                      ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-brand-500 hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {item.sku}
                      </span>
                      {/* Stock Badge */}
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          isOutOfStock
                            ? 'bg-red-100 text-red-700'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOutOfStock ? '0' : `${Math.floor(item.onHandQty)} left`}
                      </span>
                    </div>

                    <h4 className="line-clamp-2 text-sm font-bold text-gray-900 leading-snug group-hover:text-brand-600 transition">
                      {item.productTitle}
                    </h4>
                    <span className="mt-0.5 inline-block text-xs font-semibold text-gray-500">
                      {item.variantTitle}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between border-t border-gray-100 pt-2">
                    <span className="text-base font-extrabold text-gray-900">
                      ৳{Number(item.sellingPrice).toFixed(2)}
                    </span>
                    {Number(item.taxRatePercent) > 0 && (
                      <span className="text-[10px] font-medium text-gray-400">
                        +{item.taxRatePercent}% VAT
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
