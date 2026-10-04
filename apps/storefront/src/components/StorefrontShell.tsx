'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { StorefrontNavbar } from './StorefrontNavbar';
import { CartDrawer } from './CartDrawer';

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
      <footer className="border-t border-gray-200 bg-white py-12 text-center text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-sm font-black tracking-tight text-luxury-900 mb-1">
            DUELUX STORE OMNICHANNEL PLATFORM
          </div>
          <p>Physical Flagship Store: Dhanmondi, Dhaka • Central Warehouse: Tejgaon I/A</p>
          <p className="mt-3 text-gray-400">© 2026 Duelux Store. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
