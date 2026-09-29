import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Truck, ShoppingBag } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/products`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Failed to fetch storefront products:', err);
    return [];
  }
}

export default async function StorefrontHomePage() {
  const products = await getProducts();

  // Prepare Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Duelux Store Luxury Collection',
    description: 'Bespoke apparel synchronized with in-store POS stock.',
    itemListElement: products.map((p: any, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: p.title,
        description: p.description,
        url: `https://duelux.store/product/${p.slug}`,
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'BDT',
          lowPrice: p.variants?.[0]?.sellingPrice || '3500.00',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-800 mb-6">
              <Zap className="h-3.5 w-3.5 text-brand-600" />
              <span>Direct In-Store Inventory Synchronization Active</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl sm:leading-[1.1]">
              Architected for Luxury. Unified Across Counter & Web.
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Explore bespoke menswear and curated luxury essentials. What you see online is backed by our real-time atomic inventory ledger at the Dhanmondi Flagship store.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-xl bg-luxury-900 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-luxury-900/10 hover:bg-black transition"
              >
                <span>Shop New Arrivals</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-extrabold text-gray-800 hover:bg-gray-50 transition"
              >
                <span>Open POS Cashier Screen</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Omnichannel Value Props */}
      <section className="border-b border-gray-100 bg-gray-50/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-gray-100 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Zero Stock-Lag</h4>
                <p className="text-xs text-gray-500 mt-0.5">Physical store & web stock share 1 atomic ledger.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-gray-100 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Multi-Tier Delivery</h4>
                <p className="text-xs text-gray-500 mt-0.5">Automated zone pricing & courier tracking.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 border border-gray-100 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">In-Store Returns (BORIS)</h4>
                <p className="text-xs text-gray-500 mt-0.5">Buy online and exchange at any physical counter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section id="products" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b border-gray-200 pb-6 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Featured Catalog
              </span>
              <h2 className="text-2xl font-black text-gray-900 sm:text-3xl mt-1">
                Luxury Apparel & Essentials
              </h2>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              Showing {products.length} Master Products
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
