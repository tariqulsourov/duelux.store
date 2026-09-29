'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, Search, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function StorefrontNavbar() {
  const { totalCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      {/* Top Notification Strip */}
      <div className="bg-luxury-900 px-4 py-1.5 text-center text-xs font-semibold text-white/90 tracking-wide flex justify-center items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
        <span>Omnichannel Retail: Unified Physical Store & Online Warehouse Inventory</span>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-luxury-900 text-lg font-black text-white shadow-md group-hover:bg-brand-600 transition">
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
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link href="/" className="hover:text-brand-600 transition">
              Collection
            </Link>
            <Link href="/#products" className="hover:text-brand-600 transition">
              Apparel
            </Link>
            <Link href="/#products" className="hover:text-brand-600 transition">
              New Arrivals
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Direct Switch to In-House POS Terminal */}
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:border-brand-500 hover:bg-white hover:text-brand-700 transition"
          >
            <span>Launch POS Terminal</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-xl bg-luxury-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-black transition shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-black text-white">
              {totalCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
