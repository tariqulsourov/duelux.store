'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  History,
  Store,
  ExternalLink,
  PlusCircle,
  Sparkles,
  LayoutTemplate,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const isCurrentActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  const navItems = [
    {
      name: t('admin_overview'),
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: language === 'bn' ? 'হোমপেজ ও মেনু বিল্ডার' : 'Homepage & Menu Builder',
      href: '/admin/layouts',
      icon: LayoutTemplate,
    },
    {
      name: t('admin_products'),
      href: '/admin/products',
      icon: Package,
    },
    {
      name: t('admin_inventory'),
      href: '/admin/inventory',
      icon: Boxes,
    },
    {
      name: t('admin_orders'),
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      name: t('admin_ledger'),
      href: '/admin/ledger',
      icon: History,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 z-30 shadow-lg dark:shadow-2xl transition-colors">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md group-hover:scale-105 transition-transform">
              DX
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                {t('brand_name')}
                <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t('admin_title')}
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Launch Buttons */}
        <div className="px-4 pt-4 pb-2 space-y-2">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition group"
          >
            <span className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {t('nav_pos')}
            </span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              {t('store_title')}
            </span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-3 flex-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            {language === 'bn' ? 'অপারেশনস' : 'Operations'}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isCurrentActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('system_operational')}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            {language === 'bn' ? 'ধানমন্ডি ফ্ল্যাগশিপ • তেজগাঁও ওয়্যারহাউজ' : 'Dhanmondi Flagship • Tejgaon WH'}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('admin_title')}
            </div>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-xs text-brand-700 dark:text-brand-400 font-bold bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
              {language === 'bn' ? '০.০০% ট্যাক্স-মুক্ত মোড' : '0.00% Tax-Free Mode'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageToggle className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm" />

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Quick Actions */}
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('create_product')}</span>
            </Link>

            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition shadow-sm"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>{t('receive_goods_grn')}</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
