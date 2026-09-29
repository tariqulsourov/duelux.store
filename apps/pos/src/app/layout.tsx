import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="antialiased h-screen w-screen overflow-hidden flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
