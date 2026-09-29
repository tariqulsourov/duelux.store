import React from 'react';
import { notFound } from 'next/navigation';
import { ShieldCheck, Truck, ArrowLeft, RefreshCw, Zap } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '../../../components/ProductCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/products`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.find((p: any) => p.slug === slug) || null;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${product.title} - Luxury Collection`,
    description: product.description || 'Bespoke apparel available online and in-store.',
    openGraph: {
      title: product.title,
      description: product.description,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const variants = product.variants || [];
  const primaryVariant = variants[0];
  const price = primaryVariant ? Number(primaryVariant.sellingPrice) : 3500;

  // Schema.org JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: primaryVariant?.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'Duelux Signature',
    },
    offers: {
      '@type': 'Offer',
      url: `https://duelux.store/product/${slug}`,
      priceCurrency: 'BDT',
      price: price.toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Duelux Store',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Collection</span>
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Product Visual Presentation */}
          <div className="lg:col-span-7">
            <div className="flex h-96 sm:h-[480px] w-full items-center justify-center rounded-3xl bg-luxury-100/70 border border-gray-100 p-8 shadow-inner">
              <div className="text-center">
                <span className="text-xs font-black tracking-widest uppercase text-gray-400">
                  {product.brand?.name || 'Duelux Signature'}
                </span>
                <h1 className="mt-2 text-3xl font-black text-luxury-900 sm:text-4xl">
                  {product.title}
                </h1>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-800 border border-brand-200">
                  <Zap className="h-3.5 w-3.5 text-brand-600" />
                  <span>Available Online & In Flagship Store</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Purchasing Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <ProductCard product={product} />

            {/* Value Guarantees */}
            <div className="mt-6 space-y-3 rounded-2xl bg-gray-50 p-4 text-xs text-gray-600 border border-gray-100">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-brand-600 shrink-0" />
                <span>Next-day courier delivery inside Dhaka (৳60)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-blue-600 shrink-0" />
                <span>7-Day free counter exchange at Dhanmondi Flagship Store</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>100% Authentic Luxury Giza Cotton</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
