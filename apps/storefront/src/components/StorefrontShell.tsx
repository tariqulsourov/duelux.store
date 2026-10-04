'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StorefrontNavbar } from './StorefrontNavbar';
import { CartDrawer } from './CartDrawer';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <StorefrontNavbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>

      {/* Standard E-Commerce Footer */}
      <footer className="border-t border-gray-200 bg-luxury-950 text-white pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            {/* Brand Intro */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-luxury-950 text-lg font-black">
                  DX
                </div>
                <span className="text-xl font-black tracking-tight text-white">DUELUX</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Bangladesh’s premier bespoke menswear atelier. Dedicated to handcrafted Panjabis, fine Egyptian cotton formalwear, and royal wedding couture.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Boutique Open Daily: 10:00 AM - 10:00 PM</span>
              </div>
            </div>

            {/* Collections & Shop */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
                Shop Collections
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li>
                  <Link href="/#collection" className="hover:text-white transition">
                    Royal Panjabi Collection
                  </Link>
                </li>
                <li>
                  <Link href="/#collection" className="hover:text-white transition">
                    Handcrafted Silk Sherwanis
                  </Link>
                </li>
                <li>
                  <Link href="/#collection" className="hover:text-white transition">
                    Luxury Oxford & Formal Shirts
                  </Link>
                </li>
                <li>
                  <Link href="/#collection" className="hover:text-white transition">
                    Festive & Eid Capsule
                  </Link>
                </li>
                <li>
                  <Link href="/#collection" className="hover:text-white transition">
                    Pure Silk Shawls & Accessories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care & Policies */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dhaka Express & Nationwide Delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>7-Day Doorstep Exchange Policy</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>100% Genuine Fabric Guarantee</span>
                </li>
                <li>
                  <span className="text-gray-400">Payment: Cash on Delivery, bKash, Cards</span>
                </li>
              </ul>
            </div>

            {/* Store Locations & Contact */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
                Flagship Boutique
              </h4>
              <div className="space-y-3 text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>House 42, Road 11, Dhanmondi, Dhaka 1209</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Hotline: +880 1700-000000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>care@duelux.store</span>
                </div>
                <div className="pt-2">
                  <span className="text-[11px] text-gray-500 block">Tejgaon Central Warehouse:</span>
                  <span className="text-[11px] text-gray-400">Plot 18, Tejgaon Industrial Area, Dhaka</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Discreet Staff Link */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <div>
              © 2026 DUELUX STORE. All Rights Reserved. Crafted for Luxury.
            </div>

            <div className="flex items-center gap-6">
              <Link href="/checkout" className="hover:text-gray-300 transition">
                Secure Checkout
              </Link>
              <Link href="/admin" className="hover:text-gray-300 transition text-[11px] text-gray-600 hover:text-gray-400">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
