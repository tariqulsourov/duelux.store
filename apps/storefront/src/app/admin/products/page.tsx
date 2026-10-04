'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Search,
  Barcode,
  Sparkles,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Layers,
  Tag,
  ArrowRight,
  Boxes,
  X,
  Image as ImageIcon,
  Star,
  Globe,
  Weight,
  AlignLeft,
  FileText,
  Check,
  Plus,
  Eye,
  EyeOff,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
} from 'lucide-react';
import { BarcodeUtil } from '@duelux/shared';
import { useLanguage } from '../../../context/LanguageContext';

interface VariantInput {
  title: string;
  sku: string;
  barcode: string;
  sellingPrice: string;
  costPrice: string;
  compareAtPrice: string;
  initialStock: string;
  outletId: string;
  imageUrl?: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  tags?: string[] | null;
  weightVolume?: string | null;
  rating?: string | null;
  reviewsCount?: string | null;
  featuredReview?: string | null;
  madeInRegion?: string | null;
  imageUrl?: string | null;
  galleryImages?: string[] | null;
  publishStatus?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | string;
  isActive: boolean;
  brand?: { name: string };
  category?: { name: string };
  variants: {
    id: string;
    sku: string;
    barcode: string;
    title: string;
    sellingPrice: string;
    costPrice: string;
    imageUrl?: string | null;
    inventoryLevels?: {
      outletId: string;
      onHandQty: string;
      reservedQty: string;
    }[];
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Outlet {
  id: string;
  code: string;
  name: string;
  isWarehouse: boolean;
}

// Preset Luxury Demo Imagery for 1-Click Fast Creation
const LUXURY_IMAGE_PRESETS = [
  {
    name: 'Royal Silk Panjabi',
    main: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'Bridal Sherwani',
    main: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'Royal Oxford Shirt',
    main: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'Handcrafted Kurta',
    main: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

const POPULAR_TAGS = [
  'Royal Panjabi',
  'Festive 2026',
  'Pure Silk',
  'Eid Collection',
  'Bespoke Wedding',
  'Egyptian Cotton',
  'Handcrafted',
  'Executive Formal',
];

const POPULAR_REGIONS = [
  'Dhaka Atelier, Bangladesh',
  'Tangail Handloom, Bangladesh',
  'Rajshahi Silk Heritage, Bangladesh',
  'Narayanganj Textile, Bangladesh',
  'Chattogram, Bangladesh',
  'Imported Fabric / Bespoke Tailored',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'BASIC' | 'DESCRIPTIONS' | 'MEDIA' | 'TAGS_REVIEWS' | 'VARIANTS'>('BASIC');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { t, language } = useLanguage();

  // Form state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [publishStatus, setPublishStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('PUBLISHED');
  const [madeInRegion, setMadeInRegion] = useState('Dhaka Atelier, Bangladesh');
  const [weightVolume, setWeightVolume] = useState('450g');

  // Descriptions (Rich Text)
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [previewDescription, setPreviewDescription] = useState(false);

  // Media
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>(['Royal Panjabi', 'Festive 2026', 'Pure Silk']);
  const [tagInput, setTagInput] = useState('');

  // Reviews
  const [rating, setRating] = useState('5.00');
  const [reviewsCount, setReviewsCount] = useState('18');
  const [featuredReview, setFeaturedReview] = useState(
    'The pure mulberry silk drape and intricate embroidery are fit for royalty. Exceptional master tailoring.'
  );

  // Variants state
  const [variants, setVariants] = useState<VariantInput[]>([
    {
      title: 'Standard',
      sku: '',
      barcode: '',
      sellingPrice: '3850',
      costPrice: '1900',
      compareAtPrice: '4500',
      initialStock: '15',
      outletId: '',
    },
  ]);

  const shortDescRef = useRef<HTMLTextAreaElement>(null);
  const detailedDescRef = useRef<HTMLTextAreaElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, brandRes, outletRes] = await Promise.all([
        fetch('http://localhost:4000/api/v1/catalog/products?all=true'),
        fetch('http://localhost:4000/api/v1/catalog/categories'),
        fetch('http://localhost:4000/api/v1/catalog/brands'),
        fetch('http://localhost:4000/api/v1/outlets'),
      ]);

      if (prodRes.ok) {
        const json = await prodRes.json();
        if (json.success) setProducts(json.data);
      }
      if (catRes.ok) {
        const json = await catRes.json();
        if (json.success) {
          setCategories(json.data);
          if (json.data.length > 0 && !categoryId) setCategoryId(json.data[0].id);
        }
      }
      if (brandRes.ok) {
        const json = await brandRes.json();
        if (json.success) {
          setBrands(json.data);
          if (json.data.length > 0 && !brandId) setBrandId(json.data[0].id);
        }
      }
      if (outletRes.ok) {
        const json = await outletRes.json();
        if (json.success) {
          setOutlets(json.data);
          if (json.data.length > 0) {
            setVariants((prev) =>
              prev.map((v) => ({ ...v, outletId: v.outletId || json.data[0].id }))
            );
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setNotification({ type: 'error', message: 'Failed to connect to API server' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateBarcodeForVariant = (index: number) => {
    try {
      const randNum = Math.floor(100000000 + Math.random() * 900000000);
      const generated = BarcodeUtil.generateInternalEan13(randNum);
      const updated = [...variants];
      updated[index].barcode = generated;
      setVariants(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const autoGenerateSkuForVariant = (index: number) => {
    const cleanTitle = title.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'PROD';
    const variantTag = variants[index].title.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'VAR';
    const rand = Math.floor(100 + Math.random() * 900);
    const sku = `DX-${cleanTitle}-${variantTag}-${rand}`;
    const updated = [...variants];
    updated[index].sku = sku;
    setVariants(updated);
  };

  const addVariantRow = () => {
    const defaultOutlet = outlets[0]?.id || '';
    setVariants([
      ...variants,
      {
        title: '',
        sku: '',
        barcode: '',
        sellingPrice: variants[0]?.sellingPrice || '3850',
        costPrice: variants[0]?.costPrice || '1900',
        compareAtPrice: '',
        initialStock: '10',
        outletId: defaultOutlet,
      },
    ]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantField = (index: number, field: keyof VariantInput, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Helper for formatting text
  const insertFormatting = (
    textareaRef: React.RefObject<HTMLTextAreaElement | null>,
    setTextState: React.Dispatch<React.SetStateAction<string>>,
    prefix: string,
    suffix: string = ''
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selected = currentVal.substring(start, end) || 'text';

    const newVal = currentVal.substring(0, start) + prefix + selected + suffix + currentVal.substring(end);
    setTextState(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const addTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags([...tags, trimmed]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const addGalleryImage = () => {
    if (!newGalleryInput.trim()) return;
    if (!galleryImages.includes(newGalleryInput.trim())) {
      setGalleryImages([...galleryImages, newGalleryInput.trim()]);
    }
    setNewGalleryInput('');
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: (typeof LUXURY_IMAGE_PRESETS)[0]) => {
    setImageUrl(preset.main);
    setGalleryImages(preset.gallery);
    if (!title) {
      setTitle(preset.name);
    }
  };

  const handleOpenModal = () => {
    setTitle('');
    setShortDescription('Handcrafted luxury menswear tailored from pure natural mulberry silk and long-staple Egyptian cotton.');
    setDescription(
      '### Sartorial Elegance\n\nCrafted with obsessive precision by master artisans, this garment features authentic hand-embroidered detailing, reinforced French seams, and a tailored silhouette that delivers timeless distinction.\n\n- **Fabric**: 100% Pure Mulberry Silk / Egyptian Giza Cotton\n- **Fit**: Bespoke Classic Contemporary Cut\n- **Craftsmanship**: Traditional Hand-Stitched Embellishments\n- **Care**: Dry Clean Only'
    );
    setTags(['Royal Panjabi', 'Festive 2026', 'Pure Silk']);
    setWeightVolume('450g');
    setMadeInRegion('Dhaka Atelier, Bangladesh');
    setImageUrl('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80');
    setGalleryImages([
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    ]);
    setPublishStatus('PUBLISHED');
    setRating('5.00');
    setReviewsCount('18');
    setFeaturedReview('The pure mulberry silk drape and intricate embroidery are fit for royalty. Truly bespoke quality.');
    setModalTab('BASIC');
    setPreviewDescription(false);

    const defaultOutlet = outlets[0]?.id || '';
    setVariants([
      {
        title: 'Size 40 / Standard',
        sku: '',
        barcode: '',
        sellingPrice: '3850',
        costPrice: '1900',
        compareAtPrice: '4500',
        initialStock: '15',
        outletId: defaultOutlet,
      },
    ]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setNotification({ type: 'error', message: 'Product title is required' });
      setModalTab('BASIC');
      return;
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.sku.trim()) {
        setNotification({ type: 'error', message: `Variant #${i + 1} (${v.title || 'Untitled'}) requires a SKU` });
        setModalTab('VARIANTS');
        return;
      }
      if (!v.barcode.trim()) {
        setNotification({ type: 'error', message: `Variant #${i + 1} (${v.title || 'Untitled'}) requires an EAN-13 barcode` });
        setModalTab('VARIANTS');
        return;
      }
      if (!v.sellingPrice || Number(v.sellingPrice) <= 0) {
        setNotification({ type: 'error', message: `Variant #${i + 1} requires a valid selling price` });
        setModalTab('VARIANTS');
        return;
      }
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const slug =
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
        '-' +
        Math.floor(1000 + Math.random() * 9000);

      const payload = {
        title,
        slug,
        shortDescription: shortDescription.trim() || null,
        description: description.trim() || null,
        categoryId: categoryId || null,
        brandId: brandId || null,
        tags,
        weightVolume: weightVolume.trim() || null,
        rating: Number(rating) || 5.0,
        reviewsCount: reviewsCount || '0',
        featuredReview: featuredReview.trim() || null,
        madeInRegion: madeInRegion.trim() || 'Bangladesh',
        imageUrl: imageUrl.trim() || null,
        galleryImages,
        publishStatus,
        taxRatePercent: '0.00',
        variants: variants.map((v) => ({
          title: v.title,
          sku: v.sku.trim(),
          barcode: v.barcode.trim(),
          sellingPrice: Number(v.sellingPrice),
          costPrice: Number(v.costPrice || 0),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          outletId: v.outletId || outlets[0]?.id,
          initialStock: Number(v.initialStock || 0),
          imageUrl: v.imageUrl || imageUrl.trim() || null,
        })),
      };

      const res = await fetch('http://localhost:4000/api/v1/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create product');
      }

      setNotification({
        type: 'success',
        message: `Product "${title}" (${publishStatus}) created successfully with extended attributes & stock!`,
      });
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (statusFilter !== 'ALL') {
      const currentStatus = (p.publishStatus || (p.isActive ? 'PUBLISHED' : 'DRAFT')).toUpperCase();
      if (currentStatus !== statusFilter) return false;
    }

    const q = searchTerm.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(q);
    const skuMatch = p.variants?.some((v) => v.sku.toLowerCase().includes(q) || v.barcode.includes(q));
    const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q));
    const regionMatch = p.madeInRegion?.toLowerCase().includes(q);

    return titleMatch || skuMatch || tagMatch || regionMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-lg border ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-bold"
          >
            {t('cancel')}
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-950/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            {t('catalog_title')}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {t('catalog_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
            title={t('refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('create_product')}</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center gap-3 transition-colors">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {st === 'ALL'
                ? t('filter_all')
                : st === 'PUBLISHED'
                ? t('status_published')
                : st === 'DRAFT'
                ? t('status_draft')
                : t('status_archived')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('catalog_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2 whitespace-nowrap">
          {filteredProducts.length} of {products.length} {t('items')}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden transition-colors">
        {loading ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600 dark:text-brand-400" />
            {t('loading')}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">
            No products matching your search. Click "{t('create_product')}" to add one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">{t('th_product')}</th>
                  <th className="py-3.5 px-4">{t('publish_status_field')}</th>
                  <th className="py-3.5 px-4">{t('th_brand_category')}</th>
                  <th className="py-3.5 px-4">{t('th_variants')}</th>
                  <th className="py-3.5 px-4">{t('th_selling_price')}</th>
                  <th className="py-3.5 px-4">{t('th_total_stock')}</th>
                  <th className="py-3.5 px-4 text-right">{t('th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                {filteredProducts.map((p) => {
                  const totalOnHand = p.variants?.reduce((acc, v) => {
                    const variantTotal =
                      v.inventoryLevels?.reduce((sum, lvl) => sum + Number(lvl.onHandQty || 0), 0) || 0;
                    return acc + variantTotal;
                  }, 0) || 0;

                  const pStatus = (p.publishStatus || (p.isActive ? 'PUBLISHED' : 'DRAFT')).toUpperCase();

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                      {/* Title, Thumbnail & Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              /{p.slug}
                            </div>
                            {/* Tags & Origin */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {p.madeInRegion && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded">
                                  <Globe className="w-2.5 h-2.5" />
                                  {p.madeInRegion}
                                </span>
                              )}
                              {p.tags?.slice(0, 2).map((tg, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-1.5 py-0.5 rounded font-medium border border-brand-200 dark:border-brand-500/20"
                                >
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Publish Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            pStatus === 'PUBLISHED'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                              : pStatus === 'DRAFT'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              pStatus === 'PUBLISHED'
                                ? 'bg-emerald-500'
                                : pStatus === 'DRAFT'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {pStatus === 'PUBLISHED'
                            ? t('status_published')
                            : pStatus === 'DRAFT'
                            ? t('status_draft')
                            : t('status_archived')}
                        </span>
                      </td>

                      {/* Brand & Category */}
                      <td className="py-4 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {p.brand?.name || 'Duelux'}
                        </div>
                        <div className="text-[11px] text-brand-600 dark:text-brand-400">
                          {p.category?.name || 'General'}
                        </div>
                        {p.weightVolume && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Weight className="w-2.5 h-2.5" />
                            {p.weightVolume}
                          </div>
                        )}
                      </td>

                      {/* Variants list (Constants from input) */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {p.variants?.map((v) => (
                            <div key={v.id} className="flex items-center gap-2">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                                {v.title}
                              </span>
                              <span className="font-mono text-slate-600 dark:text-slate-400 text-[10px]">
                                SKU: {v.sku}
                              </span>
                              <span className="font-mono text-indigo-700 dark:text-indigo-400 text-[10px] bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                                EAN: {v.barcode}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {p.variants?.length === 1 ? (
                          `৳${Number(p.variants[0].sellingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        ) : p.variants?.length > 1 ? (
                          `৳${Number(p.variants[0]?.sellingPrice || 0).toFixed(0)} - ৳${Number(p.variants[p.variants.length - 1]?.sellingPrice || 0).toFixed(0)}`
                        ) : (
                          '৳0.00'
                        )}
                      </td>

                      {/* Stock Count */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            totalOnHand > 5
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                              : totalOnHand > 0
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                          }`}
                        >
                          <Boxes className="w-3 h-3" />
                          {totalOnHand.toFixed(0)} {t('in_stock')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold transition"
                        >
                          <span>{t('btn_storefront')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* "Create New Product" Wizard Modal with All Extended Attributes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  {t('create_product')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete product catalog specification with rich descriptions, gallery media, tags, and barcode generator.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalTab('BASIC')}
                className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
                  modalTab === 'BASIC'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📌 1. Basic & Details
              </button>
              <button
                type="button"
                onClick={() => setModalTab('DESCRIPTIONS')}
                className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
                  modalTab === 'DESCRIPTIONS'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ✍️ 2. Descriptions (Rich Text)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('MEDIA')}
                className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
                  modalTab === 'MEDIA'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🖼️ 3. Images & Gallery ({galleryImages.length + (imageUrl ? 1 : 0)})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('TAGS_REVIEWS')}
                className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
                  modalTab === 'TAGS_REVIEWS'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏷️ 4. Tags & Reviews ({tags.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('VARIANTS')}
                className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
                  modalTab === 'VARIANTS'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📦 5. Variants, Barcode & Stock ({variants.length})
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: BASIC INFORMATION */}
              {modalTab === 'BASIC' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Title */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('product_title_field')} *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Silk Embroidered Panjabi"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 font-semibold"
                      />
                    </div>

                    {/* Publish Status Toggle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('publish_status_field')} *
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setPublishStatus('PUBLISHED')}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                            publishStatus === 'PUBLISHED'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          🟢 {t('status_published')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPublishStatus('DRAFT')}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                            publishStatus === 'DRAFT'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          🟡 {t('status_draft')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPublishStatus('ARCHIVED')}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                            publishStatus === 'ARCHIVED'
                              ? 'bg-slate-700 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          ⚪ {t('status_archived')}
                        </button>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('category_field')}
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('brand_field')}
                      </label>
                      <select
                        value={brandId}
                        onChange={(e) => setBrandId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      >
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Made In Region */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-brand-600" />
                        {t('made_in_region_field')}
                      </label>
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Dhaka Atelier, Bangladesh"
                          value={madeInRegion}
                          onChange={(e) => setMadeInRegion(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_REGIONS.map((reg, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setMadeInRegion(reg)}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                            >
                              {reg}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Weight / Volume */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Weight className="w-3.5 h-3.5 text-indigo-600" />
                        {t('weight_volume_field')}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 450g or 0.85 kg"
                        value={weightVolume}
                        onChange={(e) => setWeightVolume(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                      <div className="flex gap-1.5 mt-1.5">
                        {['250g', '450g', '850g', '1.2kg'].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setWeightVolume(w)}
                            className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalTab('DESCRIPTIONS')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                    >
                      <span>Continue to Descriptions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: RICH DESCRIPTIONS */}
              {modalTab === 'DESCRIPTIONS' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Short Description (Rich Text) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <AlignLeft className="w-3.5 h-3.5 text-brand-600" />
                        {t('short_description_field')}
                      </label>
                      <span className="text-[11px] text-slate-400">Used for product cards & search previews</span>
                    </div>

                    {/* Rich text formatting bar for Short Description */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-xl text-xs">
                      <button
                        type="button"
                        onClick={() => insertFormatting(shortDescRef, setShortDescription, '**', '**')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(shortDescRef, setShortDescription, '*', '*')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(shortDescRef, setShortDescription, '\n- ')}
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        title="Bullet List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      ref={shortDescRef}
                      rows={3}
                      placeholder="Brief punchy summary of fabric, occasion, and signature highlights..."
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-b-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 font-sans"
                    />
                  </div>

                  {/* Detailed Description (Rich Text) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        {t('detailed_description_field')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setPreviewDescription(!previewDescription)}
                        className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        {previewDescription ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{previewDescription ? 'Back to Editor' : 'Live Preview'}</span>
                      </button>
                    </div>

                    {!previewDescription ? (
                      <>
                        {/* Rich text formatting bar */}
                        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-xl text-xs">
                          <button
                            type="button"
                            onClick={() => insertFormatting(detailedDescRef, setDescription, '## ')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            title="Heading 2"
                          >
                            <Heading2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting(detailedDescRef, setDescription, '**', '**')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                            title="Bold"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting(detailedDescRef, setDescription, '*', '*')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 italic"
                            title="Italic"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting(detailedDescRef, setDescription, '\n- ')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            title="Bullet List"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting(detailedDescRef, setDescription, '\n1. ')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            title="Numbered List"
                          >
                            <ListOrdered className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting(detailedDescRef, setDescription, '\n> ')}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            title="Blockquote"
                          >
                            <Quote className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          ref={detailedDescRef}
                          rows={7}
                          placeholder="Comprehensive fabric composition, craftsmanship techniques, styling advice, and care instructions..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-b-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 font-mono"
                        />
                      </>
                    ) : (
                      <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 prose dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                        {description || '(No description written yet)'}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setModalTab('BASIC')}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('MEDIA')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                    >
                      <span>Continue to Images</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: IMAGES & GALLERY */}
              {modalTab === 'MEDIA' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Luxury Preset Shortcuts */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      1-Click Fast Photo Presets (For Instant Testing)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {LUXURY_IMAGE_PRESETS.map((prs, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyPreset(prs)}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-slate-800 transition"
                        >
                          + {prs.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                      {t('featured_image_field')}
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input
                          type="url"
                          placeholder="https://example.com/photos/luxury-panjabi.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="Primary Thumbnail"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      {t('gallery_images_field')} ({galleryImages.length})
                    </label>

                    {/* Add Image Input */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Add another gallery photo URL..."
                        value={newGalleryInput}
                        onChange={(e) => setNewGalleryInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addGalleryImage}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Gallery Thumbnails List */}
                    {galleryImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {galleryImages.map((img, i) => (
                          <div
                            key={i}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square bg-slate-100 dark:bg-slate-900"
                          >
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(i)}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setModalTab('DESCRIPTIONS')}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('TAGS_REVIEWS')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                    >
                      <span>Continue to Tags & Reviews</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TAGS & REVIEWS */}
              {modalTab === 'TAGS_REVIEWS' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Tags Section */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-600" />
                      {t('tags_field')}
                    </label>

                    {/* Tag input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type tag and press Add (e.g. Royal Panjabi, Silk, Eid Collection)..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(tagInput);
                          }
                        }}
                        className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => addTag(tagInput)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Tag</span>
                      </button>
                    </div>

                    {/* Active Tags Chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tags.map((tg, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20"
                        >
                          #{tg}
                          <button
                            type="button"
                            onClick={() => removeTag(tg)}
                            className="hover:text-rose-600 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Preset Tag Suggestions */}
                    <div className="pt-2">
                      <span className="text-[11px] text-slate-400 block mb-1">Click to add popular tags:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_TAGS.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => addTag(sug)}
                            className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Customer Review & Rating */}
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {t('review_rating_field')}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Star Rating (1.00 - 5.00)
                        </label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        >
                          <option value="5.00">⭐⭐⭐⭐⭐ 5.00 (Flawless Royal)</option>
                          <option value="4.90">⭐⭐⭐⭐⭐ 4.90 (Superb)</option>
                          <option value="4.80">⭐⭐⭐⭐⭐ 4.80 (Excellent)</option>
                          <option value="4.50">⭐⭐⭐⭐ 4.50 (Very Good)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Reviews Count Display
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 18 or 36 verified reviews"
                          value={reviewsCount}
                          onChange={(e) => setReviewsCount(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          {t('featured_review_field')}
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Featured buyer review quote shown on product highlight..."
                          value={featuredReview}
                          onChange={(e) => setFeaturedReview(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setModalTab('MEDIA')}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('VARIANTS')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                    >
                      <span>Continue to Variants & Stock</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: VARIANTS, BARCODES & STOCK */}
              {modalTab === 'VARIANTS' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {t('th_variants')} ({variants.length})
                    </div>

                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>+ Variant</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {variants.map((v, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                            Variant #{idx + 1}
                          </span>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariantRow(idx)}
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                              title="Remove Variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                          {/* Variant Title */}
                          <div className="md:col-span-1">
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Size 40 / Navy"
                              value={v.title}
                              onChange={(e) => updateVariantField(idx, 'title', e.target.value)}
                              required
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* SKU */}
                          <div className="md:col-span-1">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                SKU
                              </label>
                              <button
                                type="button"
                                onClick={() => autoGenerateSkuForVariant(idx)}
                                className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                {t('auto_sku')}
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. DX-PAN-01"
                              value={v.sku}
                              onChange={(e) => updateVariantField(idx, 'sku', e.target.value)}
                              required
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono"
                            />
                          </div>

                          {/* EAN-13 Barcode */}
                          <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                EAN-13 Barcode
                              </label>
                              <button
                                type="button"
                                onClick={() => generateBarcodeForVariant(idx)}
                                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                              >
                                <Barcode className="w-2.5 h-2.5" />
                                {t('one_click_barcode')}
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="13-digit EAN barcode"
                              value={v.barcode}
                              onChange={(e) => updateVariantField(idx, 'barcode', e.target.value)}
                              required
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono"
                            />
                          </div>

                          {/* Selling Price */}
                          <div className="md:col-span-1">
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('selling_price_field')}
                            </label>
                            <input
                              type="number"
                              placeholder="3850"
                              value={v.sellingPrice}
                              onChange={(e) => updateVariantField(idx, 'sellingPrice', e.target.value)}
                              required
                              min="0"
                              step="0.01"
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono"
                            />
                          </div>

                          {/* Cost Price */}
                          <div className="md:col-span-1">
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('cost_price_field')}
                            </label>
                            <input
                              type="number"
                              placeholder="1900"
                              value={v.costPrice}
                              onChange={(e) => updateVariantField(idx, 'costPrice', e.target.value)}
                              min="0"
                              step="0.01"
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Stock Allocation for this variant */}
                        <div className="bg-white dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
                            <Boxes className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                            {t('initial_stock_field')}:
                          </span>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={v.initialStock}
                              onChange={(e) => updateVariantField(idx, 'initialStock', e.target.value)}
                              min="0"
                              className="w-24 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white font-mono"
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{t('units')}</span>

                            <select
                              value={v.outletId}
                              onChange={(e) => updateVariantField(idx, 'outletId', e.target.value)}
                              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                            >
                              {outlets.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name} ({o.code})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit & Action Buttons */}
              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    Status: <strong className="text-slate-900 dark:text-white">{publishStatus}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('loading')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{t('save_product_btn')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
