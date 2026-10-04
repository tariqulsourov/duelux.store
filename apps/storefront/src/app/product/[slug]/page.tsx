import React from 'react';
import { notFound } from 'next/navigation';
import { ShieldCheck, Truck, ArrowLeft, RefreshCw, Globe, Weight, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '../../../components/ProductCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/products?all=true`, { cache: 'no-store' });
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
    description: product.shortDescription || product.description || 'Bespoke apparel available online and in-store.',
    openGraph: {
      title: product.title,
      description: product.shortDescription || product.description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
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
  const allImages = [product.imageUrl, ...(product.galleryImages || [])].filter(Boolean);

  // Schema.org JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription || product.description,
    image: allImages,
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || '5.0',
      reviewCount: product.reviewsCount ? parseInt(product.reviewsCount, 10) || 18 : 18,
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

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Left: Product Visual Presentation & Gallery */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Main Image */}
            <div className="flex h-96 sm:h-[500px] w-full items-center justify-center rounded-3xl bg-luxury-100/60 border border-gray-100 overflow-hidden shadow-inner relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <span className="text-xs font-black tracking-widest uppercase text-gray-400">
                    {product.brand?.name || 'Duelux Signature'}
                  </span>
                  <h1 className="mt-2 text-3xl font-black text-luxury-900 sm:text-4xl">
                    {product.title}
                  </h1>
                </div>
              )}

              {/* Made in Region floating tag */}
              {product.madeInRegion && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    {product.madeInRegion}
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.galleryImages && product.galleryImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Product Gallery ({product.galleryImages.length + 1} Angles)
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {allImages.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-2xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 hover:border-luxury-900 transition cursor-pointer"
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Description Section */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Sartorial Craftsmanship & Product Specifications
              </h2>

              {product.shortDescription && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs font-medium text-amber-900 leading-relaxed italic">
                  "{product.shortDescription}"
                </div>
              )}

              <div className="prose max-w-none text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-sans">
                {product.description}
              </div>

              {/* Spec table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Origin</span>
                  <span className="text-xs font-bold text-gray-800">{product.madeInRegion || 'Bangladesh'}</span>
                </div>
                {product.weightVolume && (
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Weight / Volume</span>
                    <span className="text-xs font-bold text-gray-800">{product.weightVolume}</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Fabric Care</span>
                  <span className="text-xs font-bold text-gray-800">Dry Clean Recommended</span>
                </div>
              </div>
            </div>

            {/* Featured Customer Review Box */}
            {product.featuredReview && (
              <div className="p-6 rounded-2xl bg-luxury-950 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-white ml-2">{product.rating || '5.0'} / 5.0</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{product.reviewsCount || '18'} Verified Reviews</span>
                </div>

                <blockquote className="text-xs text-gray-200 italic leading-relaxed">
                  "{product.featuredReview}"
                </blockquote>
              </div>
            )}
          </div>

          {/* Right: Purchasing Card & Guarantees */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <ProductCard product={product} />

            {/* Value Guarantees */}
            <div className="space-y-3 rounded-2xl bg-gray-50 p-5 text-xs text-gray-600 border border-gray-100">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-brand-600 shrink-0" />
                <span>Express courier delivery across Dhaka (৳60) & nationwide</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-blue-600 shrink-0" />
                <span>7-Day free doorstep exchange or visit our Dhanmondi boutique</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>100% Genuine Handcrafted Mulberry Silk & Egyptian Cotton</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
