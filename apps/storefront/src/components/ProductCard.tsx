'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, Star, Globe, ImageIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    galleryImages?: string[] | null;
    tags?: string[] | null;
    madeInRegion?: string | null;
    rating?: string | null;
    reviewsCount?: string | null;
    weightVolume?: string | null;
    brand?: { name: string };
    category?: { name: string };
    variants: Array<{
      id: string;
      sku: string;
      barcode: string;
      title: string;
      sellingPrice: string;
      imageUrl?: string | null;
      inventoryLevels?: Array<{ onHandQty: string; safetyStockBuffer: string }>;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const price = selectedVariant ? Number(selectedVariant.sellingPrice) : 3500;

  // Compute live available online stock minus safety buffer
  const onHand = selectedVariant?.inventoryLevels?.[0]?.onHandQty
    ? Number(selectedVariant.inventoryLevels[0].onHandQty)
    : 50;
  const buffer = selectedVariant?.inventoryLevels?.[0]?.safetyStockBuffer
    ? Number(selectedVariant.inventoryLevels[0].safetyStockBuffer)
    : 2;
  const availableOnline = Math.max(0, onHand - buffer);

  const displayImage = selectedVariant?.imageUrl || product.imageUrl;

  const handleQuickAdd = () => {
    if (!selectedVariant) return;

    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: selectedVariant.title,
      slug: product.slug,
      sku: selectedVariant.sku,
      price,
      quantity: 1,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="group flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-gray-200 hover:shadow-xl">
      <div>
        {/* Visual Luxury Thumbnail / Image */}
        <div className="relative mb-5 flex h-64 w-full items-center justify-center rounded-2xl bg-luxury-100/60 overflow-hidden border border-gray-100">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="text-center p-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                {product.brand?.name || 'Duelux Signature'}
              </span>
              <div className="mt-2 text-2xl font-black text-luxury-900 line-clamp-2">
                {product.title}
              </div>
            </div>
          )}

          {/* Real-time Inventory Tag */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-xs backdrop-blur-md ${
                availableOnline > 0
                  ? 'bg-emerald-100/90 text-emerald-800'
                  : 'bg-amber-100/90 text-amber-800'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span>{availableOnline > 0 ? `${availableOnline} Units Available` : 'Store Walk-In Only'}</span>
            </span>
          </div>

          {/* Made In Region Badge */}
          {product.madeInRegion && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white">
                <Globe className="w-2.5 h-2.5" />
                {product.madeInRegion.split(',')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Tags & Rating Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex flex-wrap gap-1">
            {product.tags?.slice(0, 2).map((tg, i) => (
              <span
                key={i}
                className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded"
              >
                #{tg}
              </span>
            ))}
          </div>

          {product.rating && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-gray-900 group-hover:text-brand-700 transition">
            <Link href={`/product/${product.slug}`}>{product.title}</Link>
          </h3>
          <p className="line-clamp-2 text-xs text-gray-500 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Variant Selectors (Size/Color) */}
        {variants.length > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Select Size:</span>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedVariant?.id === v.id
                      ? 'bg-luxury-900 text-white shadow-sm'
                      : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {v.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          <span className="text-[10px] font-semibold text-gray-400 block uppercase">Price</span>
          <span className="text-xl font-black text-luxury-900">৳{price.toFixed(2)}</span>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={availableOnline <= 0}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition shadow-sm ${
            addedAnimation
              ? 'bg-emerald-600 text-white'
              : 'bg-luxury-900 text-white hover:bg-black active:scale-[0.98]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {addedAnimation ? (
            <>
              <Check className="h-4 w-4" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
