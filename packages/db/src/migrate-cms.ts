import { pool } from './client.js';

const defaultMenu = [
  {
    id: 'menu-panjabi',
    label: 'Royal Panjabi',
    badge: 'Hot',
    subItems: [
      { id: 'sub-silk', label: 'Pure Mulberry Silk', link: '/#products', badge: 'Luxury' },
      { id: 'sub-zardozi', label: 'Zardozi Wedding Edition', link: '/#products', badge: 'New' },
      { id: 'sub-handloom', label: 'Tangail Handloom Cotton', link: '/#products' },
      { id: 'sub-kabli', label: 'Classic Kabli Sets', link: '/#products' },
    ],
  },
  {
    id: 'menu-shirts',
    label: 'Luxury Shirts',
    subItems: [
      { id: 'sub-oxford', label: 'Royal Oxford Formal', link: '/#products' },
      { id: 'sub-egyptian', label: 'Egyptian Giza Cotton', link: '/#products', badge: 'Premium' },
      { id: 'sub-linen', label: 'Bespoke Linen Casual', link: '/#products' },
    ],
  },
  {
    id: 'menu-kurtas',
    label: 'Bespoke Kurtas',
    subItems: [
      { id: 'sub-embroidered', label: 'Embroidered Festive Kurta', link: '/#products' },
      { id: 'sub-daily', label: 'Summer Casual Kurta', link: '/#products' },
    ],
  },
  {
    id: 'menu-collections',
    label: 'Collections',
    badge: 'Festive 2026',
    subItems: [
      { id: 'sub-eid', label: 'Eid Royal Showcase', link: '/#categories', badge: 'Trending' },
      { id: 'sub-groom', label: 'Heritage Wedding Atelier', link: '/#categories' },
      { id: 'sub-combos', label: 'Luxury Combo Sets', link: '/#products' },
    ],
  },
  {
    id: 'menu-heritage',
    label: 'Heritage & Craft',
    link: '/#story',
    subItems: [],
  },
];

const presets = [
  {
    id: 'preset-royal-connoisseur',
    name: 'Royal Connoisseur (Black & Gold)',
    slug: 'royal-connoisseur',
    description: 'Black & Gold dark luxury atmosphere with 5-column product rails, 3-pillar pedestals, and verified client testimonials. Inspired by Kholzi & Zahab.',
    previewImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    menuConfig: defaultMenu,
    blocks: [
      {
        id: 'blk-rc-header-top',
        type: 'HEADER_TOP',
        title: 'Header Top Announcement',
        isVisible: true,
        order: 1,
        settings: {
          message: '✨ Complimentary Doorstep Express Delivery on bespoke orders over ৳5,000',
          actionText: 'Explore Exclusive',
          actionLink: '#products',
          theme: 'gold_black',
          showHotline: true,
          hotline: '+880 1700-000000',
        },
      },
      {
        id: 'blk-rc-hero',
        type: 'HERO_BANNER',
        title: 'Cinematic Royal Hero Banner',
        isVisible: true,
        order: 2,
        settings: {
          style: 'single',
          headline: 'TIMELESS DRAPES, RARE TREASURES',
          subheadline: 'Kholzi-inspired artisanal luxury for the discerning connoisseur. Master-woven Mulberry Silks & Zardozi embroidery.',
          ctaPrimaryText: 'Shop The Collection',
          ctaPrimaryLink: '#products',
          ctaSecondaryText: 'Visit Boutique',
          ctaSecondaryLink: '#locator',
          badgeText: '✨ Royal Connoisseur Collection 2026',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
        },
      },
      {
        id: 'blk-rc-trust',
        type: 'TRUST_BADGES',
        title: 'Connoisseur Value Guarantees',
        isVisible: true,
        order: 3,
        settings: {
          theme: 'dark',
          badges: [
            { icon: 'Award', title: '100% Authentic Handloom', desc: 'Direct from Tangail & Rajshahi ateliers' },
            { icon: 'Truck', title: 'Express Doorstep Delivery', desc: 'Inside Dhaka in 24 hours' },
            { icon: 'RefreshCw', title: '7-Day Easy Exchange', desc: 'Hassle-free doorstep sizing swap' },
            { icon: 'ShieldCheck', title: 'Zero Counterfeit Guarantee', desc: 'Individually serialized & certified' },
          ],
        },
      },
      {
        id: 'blk-rc-pillars',
        type: 'CATEGORY_BENTO',
        title: 'Three Pedestals of Luxury',
        isVisible: true,
        order: 4,
        settings: {
          style: 'pedestals',
          title: 'Curated Collection Pillars',
          subtitle: 'Choose your signature aesthetic crafted by master tailors',
          pillars: [
            { title: 'ROYAL SILK', subtitle: 'Mulberry & Rajshahi Gold', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80' },
            { title: 'FESTIVE ZARDOZI', subtitle: 'Hand-Embroidered Wedding Editions', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80' },
            { title: 'BESPOKE FORMAL', subtitle: 'Royal Oxford & Egyptian Cotton', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80' },
          ],
        },
      },
      {
        id: 'blk-rc-products',
        type: 'PRODUCT_RAIL',
        title: 'Best Selling Masterpieces (5-Column Rail)',
        isVisible: true,
        order: 5,
        settings: {
          sectionTitle: 'OUR BEST SELLING ATTAR & SILK',
          sectionSubtitle: 'Hand-finished garments inspected by master weavers in Dhaka',
          queryFilter: 'ALL',
          columns: 4,
          itemLimit: 8,
          viewAllLink: '/collection',
        },
      },
      {
        id: 'blk-rc-story',
        type: 'BRAND_STORY',
        title: 'Best Boutique in Dhaka - Brand Story',
        isVisible: true,
        order: 6,
        settings: {
          headline: 'BEST LUXURY ATELIER IN DHAKA',
          paragraph: 'Discover timeless tailoring where ancient Bengal handloom traditions unite with contemporary bespoke silhouettes. Every garment is cut from pure natural fibers with heirloom-grade longevity.',
          imageSide: 'right',
          imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
          stats: ['Pure Mulberry Silk', 'Master Zardozi Threading', '48h Express Tailoring'],
        },
      },
      {
        id: 'blk-rc-reviews',
        type: 'TESTIMONIALS',
        title: 'Google Verified Reviews Carousel',
        isVisible: true,
        order: 7,
        settings: {
          title: "LET'S SEE WHAT PATRONS TALK ABOUT US",
          subtitle: 'Over 1,200+ Verified 5-Star Reviews across Bangladesh',
          ratingScore: '5.00',
          reviews: [
            { author: 'Tanvir Ahmed', role: 'Dhanmondi, Dhaka', verified: true, quote: 'The fabric quality of the Bespoke Silk Panjabi is unmatched. Truly royal craftsmanship.' },
            { author: 'Dr. K. Rahman', role: 'Gulshan, Dhaka', verified: true, quote: 'Impeccable cut and finish. The doorstep exchange was seamless within 24 hours.' },
            { author: 'S. Chowdhury', role: 'Chattogram', verified: true, quote: 'Exceeded all expectations. Worth every taka for high-profile weddings.' },
          ],
        },
      },
      {
        id: 'blk-rc-locator',
        type: 'STORE_LOCATOR',
        title: 'Dhanmondi Showroom Locator',
        isVisible: true,
        order: 8,
        settings: {
          title: 'VISIT OUR FLAGSHIP BOUTIQUE',
          subtitle: 'Experience fabric swatches, private styling, and custom collar fitting.',
          address: 'House 42, Road 11, Dhanmondi, Dhaka 1209',
          hours: 'Open Daily: 10:00 AM – 10:00 PM',
          phone: '+880 1700-000000',
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
        },
      },
    ],
  },
  {
    id: 'preset-minimalist-editorial',
    name: 'Minimalist Editorial (High-Fashion)',
    slug: 'minimalist-editorial',
    description: 'Clean monochrome high-fashion aesthetic, generous whitespace, serif editorial headlines, and unboxing story banners. Inspired by Aromatica.',
    previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    isActive: false,
    menuConfig: defaultMenu,
    blocks: [
      {
        id: 'blk-me-header-top',
        type: 'HEADER_TOP',
        title: 'Minimalist Top Strip',
        isVisible: true,
        order: 1,
        settings: {
          message: 'COMPLIMENTARY SHIPPING ON BESPOKE ATELIER ORDERS',
          actionText: 'DISCOVER',
          actionLink: '#products',
          theme: 'dark_minimal',
          showHotline: false,
        },
      },
      {
        id: 'blk-me-hero',
        type: 'HERO_BANNER',
        title: 'Minimalist Editorial Hero',
        isVisible: true,
        order: 2,
        settings: {
          style: 'single',
          headline: 'LUXURY BY THE DETAIL',
          subheadline: 'Uncompromising handloom artistry. Refined bespoke silhouettes designed for quiet confidence.',
          ctaPrimaryText: 'VIEW COLLECTION',
          ctaPrimaryLink: '#products',
          badgeText: 'ATELIER 2026',
          imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=85',
        },
      },
      {
        id: 'blk-me-wordmark',
        type: 'BRAND_STORY',
        title: 'Editorial Wordmark Ticker',
        isVisible: true,
        order: 3,
        settings: {
          headline: 'JUDGE • REFINE • TEST • WEAR',
          paragraph: 'Every garment is a testament to mindful creation. We source raw silk cocoons and spin single-origin yarns with zero synthetic compromise.',
          imageSide: 'left',
          imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
        },
      },
      {
        id: 'blk-me-products',
        type: 'PRODUCT_RAIL',
        title: 'New Arrivals Minimalist Rail',
        isVisible: true,
        order: 4,
        settings: {
          sectionTitle: 'NEW ARRIVALS',
          sectionSubtitle: 'Pure single-origin fabrics crafted in limited editions',
          queryFilter: 'ALL',
          columns: 4,
          itemLimit: 4,
        },
      },
      {
        id: 'blk-me-split',
        type: 'SPLIT_PROMO_BANNERS',
        title: 'Dual Unboxing Presentation Banners',
        isVisible: true,
        order: 5,
        settings: {
          columns: 2,
          banners: [
            { title: 'THE WEDDING TRUNK', subtitle: 'Curated 5-piece royal ensemble in bespoke mahogany box', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80' },
            { title: 'THE SILK ATELIER BOX', subtitle: 'Pure mulberry silk with mother-of-pearl cufflinks', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80' },
          ],
        },
      },
      {
        id: 'blk-me-reviews',
        type: 'TESTIMONIALS',
        title: 'Worn. Loved. Repeated. Reviews',
        isVisible: true,
        order: 6,
        settings: {
          title: 'Worn. Loved. Repeated.',
          subtitle: 'Reflections from patrons of the atelier',
          reviews: [
            { author: 'Farhan I.', role: 'Dhaka', verified: true, quote: 'The stitch tension and collar structure are comparable to Savile Row craftsmanship.' },
            { author: 'Naveed Z.', role: 'Sylhet', verified: true, quote: 'Understated, breathable, and unmistakably premium.' },
          ],
        },
      },
    ],
  },
  {
    id: 'preset-bento-combos',
    name: 'Bento Category & Combos',
    slug: 'bento-combos',
    description: 'Category Bento grid, combo packages rail, and prominent collection rails with accent stripes. Inspired by Tashrif BD.',
    previewImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    isActive: false,
    menuConfig: defaultMenu,
    blocks: [
      {
        id: 'blk-bc-header-top',
        type: 'HEADER_TOP',
        title: 'Top Notice Bar',
        isVisible: true,
        order: 1,
        settings: {
          message: '⚡ EID SPECIAL COMBO PACKAGES AVAILABLE NOW • LIMITED STOCK',
          actionText: 'BUY NOW',
          actionLink: '#combos',
          theme: 'emerald_brand',
          showHotline: true,
          hotline: '+880 1700-000000',
        },
      },
      {
        id: 'blk-bc-hero',
        type: 'HERO_BANNER',
        title: 'Full-Width Slider Hero',
        isVisible: true,
        order: 2,
        settings: {
          style: 'single',
          headline: 'SIGNATURE COMBO EDITIONS',
          subheadline: 'Exclusive Silk Panjabi paired with genuine leather footwear & matching shawl.',
          ctaPrimaryText: 'ORDER NOW',
          ctaPrimaryLink: '#combos',
          imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85',
        },
      },
      {
        id: 'blk-bc-bento',
        type: 'CATEGORY_BENTO',
        title: '4-Card Bento Grid Category Tiles',
        isVisible: true,
        order: 3,
        settings: {
          style: 'bento_4',
          title: 'FEATURED CATEGORIES',
          tiles: [
            { title: 'YUSUF BHAI SERIES', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80' },
            { title: 'HAWAS SERIES', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80' },
            { title: 'DESIGNER & NICHE', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80' },
            { title: 'PERFUME OILS', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
          ],
        },
      },
      {
        id: 'blk-bc-combos',
        type: 'PRODUCT_RAIL',
        title: 'Combo Packages Rail',
        isVisible: true,
        order: 4,
        settings: {
          sectionTitle: 'COMBO PACKAGES & GIFT BOXES',
          sectionSubtitle: 'Complete celebratory ensembles at curated bundle savings',
          queryFilter: 'ALL',
          columns: 4,
          itemLimit: 4,
        },
      },
      {
        id: 'blk-bc-featured',
        type: 'PRODUCT_RAIL',
        title: 'Perfume & Silk Collection',
        isVisible: true,
        order: 5,
        settings: {
          sectionTitle: 'PERFUME & SILK COLLECTION',
          sectionSubtitle: 'Bestselling fragrance oils and handloom garments',
          queryFilter: 'FEATURED',
          columns: 4,
          itemLimit: 8,
        },
      },
      {
        id: 'blk-bc-trust',
        type: 'TRUST_BADGES',
        title: 'Payment Gateways & Delivery',
        isVisible: true,
        order: 6,
        settings: {
          theme: 'light',
          badges: [
            { icon: 'ShieldCheck', title: 'Secured Payment', desc: 'bKash, Nagad, Visa, Mastercard' },
            { icon: 'Truck', title: 'Fast Courier', desc: 'Doorstep dispatch with live Steadfast tracking' },
            { icon: 'Check', title: 'Authentic Quality', desc: 'Verified 100% natural materials' },
          ],
        },
      },
    ],
  },
  {
    id: 'preset-commercial-reels',
    name: 'Commercial Multi-Promo & Reels',
    slug: 'commercial-reels',
    description: 'High-density commercial store with tri-banner hero, circular category avatars, flash sale deals, and vertical video reels. Inspired by Modern Beauty BD.',
    previewImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    isActive: false,
    menuConfig: defaultMenu,
    blocks: [
      {
        id: 'blk-cr-header-top',
        type: 'HEADER_TOP',
        title: 'Urgent Flash Ticker',
        isVisible: true,
        order: 1,
        settings: {
          message: '🔥 EID FLASH SALE: UP TO 25% OFF ON ALL READY-TO-WEAR PANJABIS',
          actionText: 'GRAB DEAL',
          actionLink: '#sale',
          theme: 'dark_red',
          showHotline: true,
          hotline: '+880 1700-000000',
        },
      },
      {
        id: 'blk-cr-hero',
        type: 'HERO_BANNER',
        title: 'Tri-Banner Hero Layout',
        isVisible: true,
        order: 2,
        settings: {
          style: 'tri_banner',
          headline: 'MASTER CRAFT. UNBEATABLE OFFERS.',
          subheadline: 'Explore 300+ styles ready for immediate courier dispatch.',
          ctaPrimaryText: 'SHOP DEALS',
          ctaPrimaryLink: '#sale',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
          sideBanner1: { title: '31% OFF SHIRTS', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80' },
          sideBanner2: { title: '25% OFF KURTA', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80' },
        },
      },
      {
        id: 'blk-cr-circles',
        type: 'CATEGORY_BENTO',
        title: 'Category Circular Avatar Strip',
        isVisible: true,
        order: 3,
        settings: {
          style: 'circle_strip',
          title: 'SHOP BY STYLE',
          categories: [
            { name: 'Panjabi', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80' },
            { name: 'Shirts', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=200&q=80' },
            { name: 'Kurta', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=200&q=80' },
            { name: 'Kabli', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80' },
            { name: 'Silk', link: '#products', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=200&q=80' },
          ],
        },
      },
      {
        id: 'blk-cr-reels',
        type: 'REELS_VIDEO_GRID',
        title: 'Watch Before You Buy (Reels Video Cards)',
        isVisible: true,
        order: 4,
        settings: {
          title: 'WATCH BEFORE YOU BUY',
          subtitle: 'Real video previews of fabric drape, texture, and master tailoring',
          reels: [
            { title: 'Zardozi Gold Silk Panjabi', videoDuration: '0:28', views: '14.2K', thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80', productLink: '#products' },
            { title: 'Royal Oxford High Collar', videoDuration: '0:35', views: '9.8K', thumbnail: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80', productLink: '#products' },
            { title: 'Tangail Handloom Weave Drape', videoDuration: '0:42', views: '22.1K', thumbnail: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80', productLink: '#products' },
          ],
        },
      },
      {
        id: 'blk-cr-products',
        type: 'PRODUCT_RAIL',
        title: 'Flash Sale Deals Grid',
        isVisible: true,
        order: 5,
        settings: {
          sectionTitle: 'TODAY’S FLASH DEALS',
          sectionSubtitle: 'Instant checkout with Cash on Delivery or bKash',
          queryFilter: 'ALL',
          columns: 4,
          itemLimit: 8,
        },
      },
    ],
  },
  {
    id: 'preset-tall-banner-rails',
    name: 'Tall Banner Category Rails',
    slug: 'tall-banner-rails',
    description: 'Category showcases featuring a tall left promotional poster paired with 4 adjacent product cards on the right. Inspired by Zahab Perfumes collection rows.',
    previewImage: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80',
    isActive: false,
    menuConfig: defaultMenu,
    blocks: [
      {
        id: 'blk-tb-header-top',
        type: 'HEADER_TOP',
        title: 'Top Notice',
        isVisible: true,
        order: 1,
        settings: {
          message: '🌟 LUXURY BESPOKE PANJABI COLLECTION • VISIT DHANMONDI FLAGSHIP',
          actionText: 'VIEW MAP',
          actionLink: '#locator',
          theme: 'gold_black',
          showHotline: true,
          hotline: '+880 1700-000000',
        },
      },
      {
        id: 'blk-tb-hero',
        type: 'HERO_BANNER',
        title: 'Golden Hero Banner',
        isVisible: true,
        order: 2,
        settings: {
          style: 'single',
          headline: 'GIFT YOUR FAVORITE ROYAL STYLE',
          subheadline: 'Artisanal zardozi embroidery crafted by hereditary master weavers in Dhaka.',
          ctaPrimaryText: 'SHOP COLLECTIONS',
          ctaPrimaryLink: '#collections',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
        },
      },
      {
        id: 'blk-tb-row-1',
        type: 'TALL_BANNER_ROW',
        title: 'Royal Silk Collection (Tall Poster + 4 Products)',
        isVisible: true,
        order: 3,
        settings: {
          categoryName: 'ROYAL SILK PANJABI',
          categoryDescription: 'Crafted from pure mulberry silk with gold metal buttons',
          tallPoster: {
            title: 'SWEET SILK',
            subtitle: 'Starting from ৳3,850',
            buttonText: 'View All Silk',
            link: '#products',
            imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=500&q=80',
          },
          queryFilter: 'FEATURED',
          itemLimit: 4,
        },
      },
      {
        id: 'blk-tb-story',
        type: 'BRAND_STORY',
        title: 'Why Choose Duelux',
        isVisible: true,
        order: 4,
        settings: {
          headline: 'WHY CHOOSE DUELUX LUXURY?',
          paragraph: 'We control every stage of fabrication: from spinning pure silkworm cocoons to hand-stitching buttonholes with 100% silk thread.',
          imageSide: 'right',
          imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
        },
      },
      {
        id: 'blk-tb-row-2',
        type: 'TALL_BANNER_ROW',
        title: 'Festive Zardozi (Tall Poster + 4 Products)',
        isVisible: true,
        order: 5,
        settings: {
          categoryName: 'FESTIVE ZARDOZI EDITIONS',
          categoryDescription: 'Hand-sewn gold and silver bullion embroidery for milestone celebrations',
          tallPoster: {
            title: 'ROYAL ZARDOZI',
            subtitle: 'Starting from ৳4,500',
            buttonText: 'View All Zardozi',
            link: '#products',
            imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80',
          },
          queryFilter: 'ALL',
          itemLimit: 4,
        },
      },
      {
        id: 'blk-tb-locator',
        type: 'STORE_LOCATOR',
        title: 'Flagship Showroom Exterior',
        isVisible: true,
        order: 6,
        settings: {
          title: 'DHANMONDI BOUTIQUE',
          subtitle: 'Shop # 27, Ground Floor, Dhanmondi 11',
          address: 'House 42, Road 11, Dhanmondi, Dhaka 1209',
          hours: 'Open 7 Days: 10 AM - 10 PM',
          phone: '+880 1700-000000',
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
        },
      },
    ],
  },
];

async function main() {
  console.log('🔄 Checking homepage_layouts table in MySQL...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS homepage_layouts (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      slug VARCHAR(150) NOT NULL UNIQUE,
      description TEXT NULL,
      preview_image VARCHAR(1000) NULL,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      menu_config JSON NOT NULL,
      blocks JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('✓ homepage_layouts table ready in MySQL.');

  console.log('🌱 Seeding 5 reference-tailored layout presets...');
  for (const preset of presets) {
    const [existing] = await pool.query('SELECT id FROM homepage_layouts WHERE slug = ?', [preset.slug]);
    if ((existing as any[]).length === 0) {
      console.log(`Inserting layout: ${preset.name}...`);
      await pool.query(
        `INSERT INTO homepage_layouts (id, name, slug, description, preview_image, is_active, menu_config, blocks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          preset.id,
          preset.name,
          preset.slug,
          preset.description,
          preset.previewImage,
          preset.isActive,
          JSON.stringify(preset.menuConfig),
          JSON.stringify(preset.blocks),
        ]
      );
      console.log(`✓ Seeded layout "${preset.name}"`);
    } else {
      console.log(`- Layout "${preset.name}" already exists. Updating block definitions...`);
      await pool.query(
        `UPDATE homepage_layouts SET name = ?, description = ?, preview_image = ?, menu_config = ?, blocks = ?
         WHERE slug = ?`,
        [
          preset.name,
          preset.description,
          preset.previewImage,
          JSON.stringify(preset.menuConfig),
          JSON.stringify(preset.blocks),
          preset.slug,
        ]
      );
      console.log(`✓ Updated layout "${preset.name}"`);
    }
  }

  // Ensure exactly one layout is active
  const [activeRows] = await pool.query('SELECT id, name FROM homepage_layouts WHERE is_active = true');
  if ((activeRows as any[]).length === 0) {
    console.log('Activating Royal Connoisseur as default active layout...');
    await pool.query('UPDATE homepage_layouts SET is_active = true WHERE slug = "royal-connoisseur"');
  }

  const [allRows] = await pool.query('SELECT id, name, slug, is_active FROM homepage_layouts');
  console.log('\n📊 Live Homepage Layouts in MySQL:');
  console.table(allRows);

  await pool.end();
  console.log('✅ Phase 1 Database Migration & Seeding Completed Successfully!');
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
