import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  RefreshCw,
  CreditCard,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
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
    description: 'Bespoke apparel handcrafted in Bangladesh.',
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
      <section className="relative overflow-hidden bg-gradient-to-b from-luxury-50/60 to-white py-20 lg:py-28 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 mb-6">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Royal Heritage Collection 2026</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl sm:leading-[1.15]">
              Exquisite Craftsmanship. Uncompromising Luxury.
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Discover bespoke Panjabis, handcrafted silk Sherwanis, and fine Egyptian cotton shirts tailored for royal distinction and effortless comfort.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#collection"
                className="inline-flex items-center gap-2 rounded-xl bg-luxury-900 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-luxury-900/10 hover:bg-black transition"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-4 text-sm font-extrabold text-gray-800 hover:bg-gray-50 transition shadow-xs"
              >
                <span>Browse Categories</span>
              </a>
            </div>

            {/* Quick Guarantees Pill */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100% Handcrafted Silks & Cottons
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Free Express Delivery Over ৳5,000
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Cash on Delivery & Instant Exchanges
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Value Props Strip */}
      <section className="border-b border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-4 rounded-2xl bg-luxury-50/50 p-5 border border-gray-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Express Delivery</h4>
                <p className="text-xs text-gray-500 mt-1">Same-day dispatch in Dhaka & 48h courier nationwide.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-luxury-50/50 p-5 border border-gray-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Master Craftsmanship</h4>
                <p className="text-xs text-gray-500 mt-1">Mulberry silks & fine Egyptian Giza cotton weaves.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-luxury-50/50 p-5 border border-gray-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Hassle-Free Exchange</h4>
                <p className="text-xs text-gray-500 mt-1">7-day doorstep exchange or visit our Dhanmondi store.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-luxury-50/50 p-5 border border-gray-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Flexible Payments</h4>
                <p className="text-xs text-gray-500 mt-1">Cash on Delivery, bKash, Nagad, & Visa/Mastercard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Showcase */}
      <section id="categories" className="py-16 bg-gray-50/50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Curated Wardrobe
            </span>
            <h2 className="text-3xl font-black text-gray-900 mt-1">
              Shop by Category
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Explore meticulously tailored luxury styles made for special moments and distinguished everyday wear.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category 1 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-luxury-900 to-black text-white p-8 shadow-lg flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400">
                  Festive & Wedding
                </span>
                <h3 className="text-2xl font-black mt-2">
                  Royal Panjabis & Sherwanis
                </h3>
                <p className="text-xs text-gray-300 mt-2">
                  Intricate zardozi embroidery on pure mulberry silk and dupion textures.
                </p>
              </div>
              <a
                href="#collection"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-white group-hover:translate-x-1 transition mt-6"
              >
                <span>View Panjabi Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Category 2 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-8 shadow-lg flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-400">
                  Executive Wardrobe
                </span>
                <h3 className="text-2xl font-black mt-2">
                  Luxury Oxford & Formal Shirts
                </h3>
                <p className="text-xs text-gray-300 mt-2">
                  Long-staple Egyptian cotton with mother-of-pearl buttons and crisp structural collars.
                </p>
              </div>
              <a
                href="#collection"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition mt-6"
              >
                <span>View Formal Shirts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Category 3 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-black text-white p-8 shadow-lg flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400">
                  Casual Sophistication
                </span>
                <h3 className="text-2xl font-black mt-2">
                  Bespoke Kurtas & Accessories
                </h3>
                <p className="text-xs text-gray-300 mt-2">
                  Breathable linen tunics, pure silk shawls, and handcrafted brass cufflinks.
                </p>
              </div>
              <a
                href="#collection"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:text-white group-hover:translate-x-1 transition mt-6"
              >
                <span>View Essentials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section id="collection" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 pb-6 mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                New Arrivals
              </span>
              <h2 className="text-3xl font-black text-gray-900 mt-1">
                Featured Luxury Catalog
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Handcrafted garments currently available for instant order and express delivery.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                {products.length} Master Styles Available
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-sm">
              No products found in the catalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Heritage & Craftsmanship Banner */}
      <section id="craftsmanship" className="py-20 bg-luxury-950 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                The Duelux Standard
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2 leading-tight">
                Master Tailoring Backed by Generational Artisans
              </h2>
              <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                Every Duelux garment is individually cut and finished with obsessive attention to detail. We combine time-honored South Asian embroidery techniques with modern sartorial silhouettes to produce garments that command respect and exude quiet confidence.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Pure Natural Fibers</h4>
                    <p className="text-xs text-gray-400">Natural mulberry silks, breathable pure linens, and 120s Egyptian cotton.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Hand-Finished Seams</h4>
                    <p className="text-xs text-gray-400">Reinforced stitching and French seams ensuring longevity through decades of wear.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Box */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <blockquote className="text-sm text-gray-200 italic leading-relaxed">
                "The fabric quality of the Royal Silk Sherwani exceeded my expectations. The tailoring in Dhanmondi was impeccable, and the doorstep delivery in Gulshan was smooth and professional. A true luxury label for Bangladesh."
              </blockquote>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Tanvir Chowdhury</div>
                  <div className="text-[11px] text-gray-400">Gulshan-2, Dhaka • Verified Buyer</div>
                </div>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  Verified Order
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Boutique Experience Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-luxury-50 p-8 sm:p-12 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-luxury-900">
                In-Store Bespoke Fitting
              </span>
              <h3 className="text-2xl font-black text-gray-900">
                Visit Our Flagship Store in Dhanmondi
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Prefer to feel the fabrics in person? Visit our flagship boutique for private bridal consultations, bespoke measurements, and instant collections.
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  House 42, Road 11, Dhanmondi
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  10:00 AM - 10:00 PM Daily
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href="#collection"
                className="text-center px-6 py-3.5 rounded-xl bg-luxury-900 hover:bg-black text-white text-xs font-bold shadow-md transition"
              >
                Shop Online Now
              </a>
              <a
                href="tel:+8801700000000"
                className="text-center px-6 py-3.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold shadow-xs transition"
              >
                Book Styling Appointment
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
