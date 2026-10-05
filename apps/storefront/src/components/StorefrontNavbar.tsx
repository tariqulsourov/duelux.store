'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  PhoneCall,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { HeaderMenuItem } from '@duelux/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const defaultMenuItems: HeaderMenuItem[] = [
  {
    id: 'menu-panjabi',
    label: 'Royal Panjabi',
    badge: 'Hot',
    subItems: [
      { id: 'sub-silk', label: 'Pure Mulberry Silk', link: '/#products', badge: 'Luxury' },
      { id: 'sub-zardozi', label: 'Zardozi Wedding Edition', link: '/#products', badge: 'New' },
      { id: 'sub-handloom', label: 'Tangail Handloom Cotton', link: '/#products' },
      { id: 'sub-kabli', label: 'Classic Kabli Sets', link: '/#products' },
    ],
  },
  {
    id: 'menu-shirts',
    label: 'Luxury Shirts',
    subItems: [
      { id: 'sub-oxford', label: 'Royal Oxford Formal', link: '/#products' },
      { id: 'sub-egyptian', label: 'Egyptian Giza Cotton', link: '/#products', badge: 'Premium' },
      { id: 'sub-linen', label: 'Bespoke Linen Casual', link: '/#products' },
    ],
  },
  {
    id: 'menu-kurtas',
    label: 'Bespoke Kurtas',
    subItems: [
      { id: 'sub-embroidered', label: 'Embroidered Festive Kurta', link: '/#products' },
      { id: 'sub-daily', label: 'Summer Casual Kurta', link: '/#products' },
    ],
  },
  {
    id: 'menu-collections',
    label: 'Collections',
    badge: 'Festive 2026',
    subItems: [
      { id: 'sub-eid', label: 'Eid Royal Showcase', link: '/#categories', badge: 'Trending' },
      { id: 'sub-groom', label: 'Heritage Wedding Atelier', link: '/#categories' },
      { id: 'sub-combos', label: 'Luxury Combo Sets', link: '/#products' },
    ],
  },
  {
    id: 'menu-heritage',
    label: 'Heritage & Craft',
    link: '/#craftsmanship',
    subItems: [],
  },
];

export function StorefrontNavbar() {
  const { totalCount, setIsCartOpen } = useCart();
  const [menuItems, setMenuItems] = useState<HeaderMenuItem[]>(defaultMenuItems);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenuId, setExpandedMobileMenuId] = useState<string | null>(null);

  // Fetch active layout navigation menu
  useEffect(() => {
    async function loadActiveNav() {
      try {
        const res = await fetch(`${API_BASE_URL}/cms/layouts/active`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.menuConfig && Array.isArray(json.data.menuConfig)) {
            setMenuItems(json.data.menuConfig);
          }
        }
      } catch (err) {
        // Fallback to defaultMenuItems gracefully
      }
    }
    loadActiveNav();
  }, []);

  const getBadgeClass = (badge?: string) => {
    switch (badge?.toLowerCase()) {
      case 'hot':
      case 'trending':
        return 'bg-amber-500 text-black';
      case 'new':
      case 'festive 2026':
        return 'bg-emerald-600 text-white';
      case 'luxury':
      case 'premium':
        return 'bg-luxury-900 text-amber-300 border border-amber-400/40';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Desktop Navigation */}
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

          {/* Desktop 2-Layer Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-700">
            {menuItems.map((item) => {
              const hasSubmenu = item.subItems && item.subItems.length > 0;

              if (!hasSubmenu) {
                return (
                  <Link
                    key={item.id}
                    href={item.link || '/'}
                    className="hover:text-luxury-900 transition flex items-center gap-1.5 py-2"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getBadgeClass(
                          item.badge
                        )}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              // Dropdown Item with 2nd Layer Submenu
              return (
                <div
                  key={item.id}
                  className="relative group py-2"
                  onMouseEnter={() => setOpenDropdownId(item.id)}
                  onMouseLeave={() => setOpenDropdownId(null)}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-luxury-900 transition group-hover:text-luxury-900 font-semibold text-sm"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${getBadgeClass(
                          item.badge
                        )}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-luxury-900 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* 2nd-Layer Dropdown Flyout */}
                  <div
                    className={`absolute top-full left-0 w-64 pt-2 transition-all duration-200 z-50 ${
                      openDropdownId === item.id
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-1 pointer-events-none'
                    }`}
                  >
                    <div className="rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl p-3 shadow-2xl ring-1 ring-black/5">
                      <div className="space-y-1">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.id}
                            href={sub.link}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-luxury-50 hover:text-luxury-950 transition group/sub"
                          >
                            <span>{sub.label}</span>
                            <div className="flex items-center gap-1.5">
                              {sub.badge && (
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase ${getBadgeClass(
                                    sub.badge
                                  )}`}
                                >
                                  {sub.badge}
                                </span>
                              )}
                              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition text-amber-500" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right Customer Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="tel:+8801700000000"
            className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-luxury-900 transition"
          >
            <PhoneCall className="h-3.5 w-3.5 text-amber-600" />
            <span>Support: +880 1700-000000</span>
          </a>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-xl bg-luxury-900 px-3.5 sm:px-4 py-2.5 text-sm font-bold text-white hover:bg-black transition shadow-md"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-black text-white">
              {totalCount}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (2-Layer Accordion Navigation) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-6 shadow-xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">
            Navigation Menu
          </div>
          {menuItems.map((item) => {
            const hasSubmenu = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMobileMenuId === item.id;

            if (!hasSubmenu) {
              return (
                <Link
                  key={item.id}
                  href={item.link || '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl p-3 text-sm font-bold text-gray-800 hover:bg-luxury-50"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${getBadgeClass(
                        item.badge
                      )}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <div key={item.id} className="rounded-xl border border-gray-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMobileMenuId(isExpanded ? null : item.id)
                  }
                  className="w-full flex items-center justify-between p-3 text-sm font-bold text-gray-800 bg-gray-50/50 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase ${getBadgeClass(
                          item.badge
                        )}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="p-2 space-y-1 bg-white border-t border-gray-100">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.link}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-luxury-50 hover:text-luxury-950"
                      >
                        <span>{sub.label}</span>
                        {sub.badge && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase ${getBadgeClass(
                              sub.badge
                            )}`}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}
