export interface SubMenuItem {
  id: string;
  label: string;
  link: string;
  badge?: string;
  isExternal?: boolean;
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  link?: string;
  badge?: string;
  isExternal?: boolean;
  subItems: SubMenuItem[]; // Strictly 2nd-layer items only
}

export type BlockType =
  | 'HEADER_TOP'
  | 'NAVBAR_MENU'
  | 'HERO_BANNER'
  | 'CATEGORY_BENTO'
  | 'PRODUCT_RAIL'
  | 'TALL_BANNER_ROW'
  | 'SPLIT_PROMO_BANNERS'
  | 'REELS_VIDEO_GRID'
  | 'BRAND_STORY'
  | 'TESTIMONIALS'
  | 'STORE_LOCATOR'
  | 'TRUST_BADGES'
  | 'FOOTER';

export interface LayoutBlockConfig {
  id: string;
  type: BlockType;
  title: string;
  isVisible: boolean;
  order: number;
  settings: Record<string, any>;
}

export interface HomepageLayout {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  previewImage: string | null;
  isActive: boolean;
  menuConfig: HeaderMenuItem[];
  blocks: LayoutBlockConfig[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
