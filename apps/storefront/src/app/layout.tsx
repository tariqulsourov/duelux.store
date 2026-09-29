import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { StorefrontNavbar } from '../components/StorefrontNavbar';
import { CartDrawer } from '../components/CartDrawer';

export const metadata: Metadata = {
  metadataBase: new URL('https://duelux.store'),
  title: {
    default: 'Duelux Store - Luxury Fashion & Omnichannel Retail',
    template: '%s | Duelux Store',
  },
  description:
    'Experience automated omnichannel luxury apparel. Tightly synchronized physical store and online fulfillment across Bangladesh.',
  openGraph: {
    title: 'Duelux Store - Luxury Fashion & Omnichannel Commerce',
    description: 'High-end apparel with real-time in-store stock synchronization.',
    url: 'https://duelux.store',
    siteName: 'Duelux Store',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans antialiased text-gray-900 bg-luxury-50/50">
        <CartProvider>
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
        </CartProvider>
      </body>
    </html>
  );
}
