'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

export function StorefrontNavbar() {
  const { totalCount, setIsCartOpen } = useCart();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      {/* Top Notification Strip */}
      <div className="bg-luxury-900 dark:bg-black px-4 py-1.5 text-center text-xs font-semibold text-white/90 tracking-wide flex justify-center items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
        <span>{t('omnichannel_notice')}</span>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-luxury-900 dark:bg-brand-600 text-lg font-black text-white shadow-md group-hover:scale-105 transition">
              DX
            </div>
            <div>
              <span className="block text-xl font-black tracking-tight text-luxury-900 dark:text-white">
                {t('brand_name')}
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-gray-400 dark:text-slate-400 uppercase">
                {t('est_tag')}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700 dark:text-slate-300">
            <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              {t('nav_collection')}
            </Link>
            <Link href="/#products" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              {t('nav_apparel')}
            </Link>
            <Link href="/#products" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              {t('nav_new_arrivals')}
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <LanguageToggle className="border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900" />

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Direct Switch to Admin Dashboard */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>{t('nav_admin')}</span>
          </Link>

          {/* Direct Switch to In-House POS Terminal */}
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <span>{t('nav_pos')}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-xl bg-luxury-900 dark:bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-black dark:hover:bg-brand-500 transition shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{t('bag')}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 dark:bg-white text-xs font-black text-white dark:text-brand-700">
              {totalCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

