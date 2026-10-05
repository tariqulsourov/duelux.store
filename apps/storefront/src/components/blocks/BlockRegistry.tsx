import React from 'react';
import { BlockType, LayoutBlockConfig } from '@duelux/shared';
import { HeaderTopBlock } from './HeaderTopBlock';
import { HeroBannerBlock } from './HeroBannerBlock';
import { TrustBadgesBlock } from './TrustBadgesBlock';
import { CategoryBentoBlock } from './CategoryBentoBlock';
import { ProductRailBlock } from './ProductRailBlock';
import { TallBannerRowBlock } from './TallBannerRowBlock';
import { SplitPromoBannersBlock } from './SplitPromoBannersBlock';
import { ReelsVideoBlock } from './ReelsVideoBlock';
import { BrandStoryBlock } from './BrandStoryBlock';
import { TestimonialsBlock } from './TestimonialsBlock';
import { StoreLocatorBlock } from './StoreLocatorBlock';

interface RenderBlockProps {
  block: LayoutBlockConfig;
  products?: any[];
}

export function RenderBlock({ block, products = [] }: RenderBlockProps) {
  if (!block.isVisible) return null;

  switch (block.type) {
    case 'HEADER_TOP':
      return <HeaderTopBlock key={block.id} settings={block.settings as any} />;

    case 'HERO_BANNER':
      return <HeroBannerBlock key={block.id} settings={block.settings as any} />;

    case 'TRUST_BADGES':
      return <TrustBadgesBlock key={block.id} settings={block.settings as any} />;

    case 'CATEGORY_BENTO':
      return <CategoryBentoBlock key={block.id} settings={block.settings as any} />;

    case 'PRODUCT_RAIL':
      return (
        <ProductRailBlock
          key={block.id}
          settings={block.settings as any}
          products={products}
        />
      );

    case 'TALL_BANNER_ROW':
      return (
        <TallBannerRowBlock
          key={block.id}
          settings={block.settings as any}
          products={products}
        />
      );

    case 'SPLIT_PROMO_BANNERS':
      return <SplitPromoBannersBlock key={block.id} settings={block.settings as any} />;

    case 'REELS_VIDEO_GRID':
      return <ReelsVideoBlock key={block.id} settings={block.settings as any} />;

    case 'BRAND_STORY':
      return <BrandStoryBlock key={block.id} settings={block.settings as any} />;

    case 'TESTIMONIALS':
      return <TestimonialsBlock key={block.id} settings={block.settings as any} />;

    case 'STORE_LOCATOR':
      return <StoreLocatorBlock key={block.id} settings={block.settings as any} />;

    default:
      return null;
  }
}
