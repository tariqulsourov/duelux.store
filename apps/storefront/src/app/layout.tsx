import type { Metadata } from 'next';
import './globals.css';
import { Hind_Siliguri } from 'next/font/google';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { StorefrontShell } from '../components/StorefrontShell';

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${hindSiliguri.variable} min-h-screen flex flex-col font-sans antialiased text-gray-900 dark:text-slate-100 bg-luxury-50/50 dark:bg-slate-950 transition-colors duration-200`}>
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <StorefrontShell>{children}</StorefrontShell>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


