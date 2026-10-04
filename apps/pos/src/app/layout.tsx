import type { Metadata } from 'next';
import './globals.css';
import { Hind_Siliguri } from 'next/font/google';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Duelux POS - In-House High-Velocity Cashier Terminal',
  description: 'Enterprise point of sale with USB barcode scanner interceptor and direct thermal receipt printing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${hindSiliguri.variable} antialiased h-screen w-screen overflow-hidden flex flex-col font-sans bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

