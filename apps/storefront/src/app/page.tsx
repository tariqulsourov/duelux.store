import React from 'react';
import { HomepageLayout, LayoutBlockConfig } from '@duelux/shared';
import { RenderBlock } from '../components/blocks/BlockRegistry';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getActiveLayout(): Promise<HomepageLayout | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/layouts/active`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('Failed to fetch active homepage layout:', err);
    return null;
  }
}

async function getProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Failed to fetch storefront products:', err);
    return [];
  }
}

// High-fidelity fallback blocks if CMS API is initializing or offline
const fallbackBlocks: LayoutBlockConfig[] = [
  {
    id: 'blk-fb-header-top',
    type: 'HEADER_TOP',
    title: 'Top Notice Bar',
    isVisible: true,
    order: 1,
    settings: {
      message: '✨ Complimentary Doorstep Express Delivery on bespoke orders over ৳5,000',
      actionText: 'Explore Collection',
      actionLink: '#products',
      theme: 'gold_black',
      showHotline: true,
      hotline: '+880 1700-000000',
    },
  },
  {
    id: 'blk-fb-hero',
    type: 'HERO_BANNER',
    title: 'Hero Showcase',
    isVisible: true,
    order: 2,
    settings: {
      style: 'single',
      headline: 'TIMELESS DRAPES, RARE TREASURES',
      subheadline: 'Artisanal luxury for the discerning connoisseur. Master-woven Mulberry Silks & Zardozi embroidery.',
      ctaPrimaryText: 'Shop The Collection',
      ctaPrimaryLink: '#products',
      badgeText: '✨ Royal Connoisseur Collection 2026',
    },
  },
  {
    id: 'blk-fb-trust',
    type: 'TRUST_BADGES',
    title: 'Trust Badges',
    isVisible: true,
    order: 3,
    settings: {
      theme: 'dark',
    },
  },
  {
    id: 'blk-fb-pillars',
    type: 'CATEGORY_BENTO',
    title: 'Category Pillars',
    isVisible: true,
    order: 4,
    settings: {
      style: 'pedestals',
      title: 'CURATED COLLECTION PILLARS',
    },
  },
  {
    id: 'blk-fb-products',
    type: 'PRODUCT_RAIL',
    title: 'Best Sellers',
    isVisible: true,
    order: 5,
    settings: {
      sectionTitle: 'OUR BEST SELLING ATTAR & SILK',
      sectionSubtitle: 'Hand-finished garments inspected by master weavers in Dhaka',
      queryFilter: 'ALL',
      columns: 4,
      itemLimit: 8,
    },
  },
  {
    id: 'blk-fb-story',
    type: 'BRAND_STORY',
    title: 'Brand Story',
    isVisible: true,
    order: 6,
    settings: {
      headline: 'BEST LUXURY ATELIER IN DHAKA',
      paragraph: 'Discover timeless tailoring where ancient Bengal handloom traditions unite with contemporary bespoke silhouettes.',
      imageSide: 'right',
    },
  },
  {
    id: 'blk-fb-reviews',
    type: 'TESTIMONIALS',
    title: 'Patron Reviews',
    isVisible: true,
    order: 7,
    settings: {
      title: "LET'S SEE WHAT PATRONS TALK ABOUT US",
      subtitle: 'Over 1,200+ Verified 5-Star Reviews across Bangladesh',
    },
  },
  {
    id: 'blk-fb-locator',
    type: 'STORE_LOCATOR',
    title: 'Showroom Locator',
    isVisible: true,
    order: 8,
    settings: {
      title: 'VISIT OUR FLAGSHIP BOUTIQUE',
      address: 'House 42, Road 11, Dhanmondi, Dhaka 1209',
    },
  },
];

export default async function StorefrontHomePage() {
  const [layout, products] = await Promise.all([getActiveLayout(), getProducts()]);

  const rawBlocks = layout?.blocks && layout.blocks.length > 0 ? layout.blocks : fallbackBlocks;

  // Filter visible blocks and sort in ascending order of block.order
  const blocksToRender = rawBlocks
    .filter((b) => b.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Prepare Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: layout?.name || 'Duelux Store Luxury Collection',
    description: layout?.description || 'Bespoke apparel handcrafted in Bangladesh.',
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

      {/* Dynamic Homepage Blocks */}
      <div className="w-full flex flex-col">
        {blocksToRender.map((block) => (
          <RenderBlock key={block.id} block={block} products={products} />
        ))}
      </div>
    </>
  );
}
