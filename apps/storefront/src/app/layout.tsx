import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { StorefrontShell } from '../components/StorefrontShell';

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
          <StorefrontShell>{children}</StorefrontShell>
        </CartProvider>
      </body>
    </html>
  );
}

