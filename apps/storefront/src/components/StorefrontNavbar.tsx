'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function StorefrontNavbar() {
  const { totalCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md transition-colors">
      {/* Top Customer Announcement Strip */}
      <div className="bg-luxury-900 px-4 py-2 text-center text-xs font-semibold text-white/90 tracking-wide flex justify-center items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        <span>Complimentary Express Delivery in Dhaka on Orders Over ৳5,000 • 100% Bespoke Luxury Apparel</span>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-luxury-900 text-lg font-black text-white shadow-md group-hover:scale-105 transition">
              DX
            </div>
            <div>
              <span className="block text-xl font-black tracking-tight text-luxury-900">
                DUELUX
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                EST. 2026 • LUXURY
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-700">
            <Link href="/" className="hover:text-luxury-900 transition">
              Home
            </Link>
            <Link href="/#collection" className="hover:text-luxury-900 transition">
              Collection
            </Link>
            <Link href="/#categories" className="hover:text-luxury-900 transition">
              Categories
            </Link>
            <Link href="/#new-arrivals" className="hover:text-luxury-900 transition">
              New Arrivals
            </Link>
            <Link href="/#craftsmanship" className="hover:text-luxury-900 transition">
              Heritage & Craft
            </Link>
          </nav>
        </div>

        {/* Right Customer Actions */}
        <div className="flex items-center gap-4">
          <a
            href="tel:+8801700000000"
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-luxury-900 transition"
          >
            <PhoneCall className="h-3.5 w-3.5 text-amber-600" />
            <span>Support: +880 1700-000000</span>
          </a>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2.5 rounded-xl bg-luxury-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-black transition shadow-md"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Bag</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-black text-white">
              {totalCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
