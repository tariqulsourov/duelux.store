'use client';

import React, { useState, useEffect } from 'react';
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
  Store,
  Layers,
  Tag,
  ArrowRight,
  Boxes,
  X,
} from 'lucide-react';
import { BarcodeUtil } from '@duelux/shared';

interface VariantInput {
  title: string;
  sku: string;
  barcode: string;
  sellingPrice: string;
  costPrice: string;
  compareAtPrice: string;
  initialStock: string;
  outletId: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [variants, setVariants] = useState<VariantInput[]>([
    {
      title: 'Standard',
      sku: '',
      barcode: '',
      sellingPrice: '',
      costPrice: '',
      compareAtPrice: '',
      initialStock: '10',
      outletId: '',
    },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, brandRes, outletRes] = await Promise.all([
        fetch('http://localhost:4000/api/v1/catalog/products'),
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
          // Set default outlet for variant initial stock
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
        sellingPrice: variants[0]?.sellingPrice || '',
        costPrice: variants[0]?.costPrice || '',
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

  const handleOpenModal = () => {
    setTitle('');
    setDescription('');
    const defaultOutlet = outlets[0]?.id || '';
    setVariants([
      {
        title: 'Standard',
        sku: '',
        barcode: '',
        sellingPrice: '',
        costPrice: '',
        compareAtPrice: '',
        initialStock: '10',
        outletId: defaultOutlet,
      },
    ]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setNotification({ type: 'error', message: 'Product title is required' });
      return;
    }

    // Ensure all variants have SKU and Barcode
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.sku.trim()) {
        setNotification({ type: 'error', message: `Variant #${i + 1} (${v.title || 'Untitled'}) requires a SKU` });
        return;
      }
      if (!v.barcode.trim()) {
        setNotification({ type: 'error', message: `Variant #${i + 1} (${v.title || 'Untitled'}) requires an EAN-13 barcode` });
        return;
      }
      if (!v.sellingPrice || Number(v.sellingPrice) <= 0) {
        setNotification({ type: 'error', message: `Variant #${i + 1} requires a valid selling price` });
        return;
      }
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      const payload = {
        title,
        slug,
        description,
        categoryId: categoryId || null,
        brandId: brandId || null,
        taxRatePercent: '0.00', // Tax explicitly skipped per policy
        variants: variants.map((v) => ({
          title: v.title,
          sku: v.sku.trim(),
          barcode: v.barcode.trim(),
          sellingPrice: Number(v.sellingPrice),
          costPrice: Number(v.costPrice || 0),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          outletId: v.outletId || outlets[0]?.id,
          initialStock: Number(v.initialStock || 0),
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

      setNotification({ type: 'success', message: `Product "${title}" created successfully with initial stock!` });
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(q);
    const skuMatch = p.variants.some((v) => v.sku.toLowerCase().includes(q) || v.barcode.includes(q));
    return titleMatch || skuMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-lg border ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/80 border-rose-800 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-400" />
            Products & Variants Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage omnichannel styles, generate verified EAN-13 barcodes, and allocate initial stock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title, SKU, or EAN-13 barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium px-2">
          {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950/70 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-400" />
            Loading catalog from database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No products matching your search. Click "Create New Product" to add one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Brand / Category</th>
                  <th className="py-3.5 px-4">Variants (SKU & Barcode)</th>
                  <th className="py-3.5 px-4">Selling Price (৳)</th>
                  <th className="py-3.5 px-4">Total Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredProducts.map((p) => {
                  const totalOnHand = p.variants.reduce((acc, v) => {
                    const variantTotal = v.inventoryLevels?.reduce((sum, lvl) => sum + Number(lvl.onHandQty || 0), 0) || 0;
                    return acc + variantTotal;
                  }, 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition">
                      {/* Title & Slug */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{p.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">/{p.slug}</div>
                      </td>

                      {/* Brand & Category */}
                      <td className="py-4 px-4">
                        <div className="text-slate-300 font-medium">{p.brand?.name || 'Duelux'}</div>
                        <div className="text-[11px] text-brand-400">{p.category?.name || 'General'}</div>
                      </td>

                      {/* Variants list */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {p.variants.map((v) => (
                            <div key={v.id} className="flex items-center gap-2">
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                                {v.title}
                              </span>
                              <span className="font-mono text-slate-400 text-[10px]">
                                SKU: {v.sku}
                              </span>
                              <span className="font-mono text-indigo-400 text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                EAN: {v.barcode}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {p.variants.length === 1 ? (
                          `৳${Number(p.variants[0].sellingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        ) : (
                          `৳${Number(p.variants[0]?.sellingPrice || 0).toFixed(0)} - ৳${Number(p.variants[p.variants.length - 1]?.sellingPrice || 0).toFixed(0)}`
                        )}
                      </td>

                      {/* Stock Count */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            totalOnHand > 5
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : totalOnHand > 0
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <Boxes className="w-3 h-3" />
                          {totalOnHand.toFixed(0)} in stock
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] transition"
                        >
                          <span>Storefront</span>
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

      {/* "Create New Product" Wizard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-400" />
                  Add New Product & Variants
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  1-Click Barcode generation with immediate stock allocation. Tax fields are omitted.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* General Information */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-brand-400" />
                  Product Information
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Silk Embroidered Panjabi"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Brand
                    </label>
                    <select
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tax Policy
                    </label>
                    <div className="px-3 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400">
                      Skipped (0.00% Tax-Free Mode)
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Product fabric, craftsmanship, styling and care details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Product Variants & Barcodes ({variants.length})
                  </div>

                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-brand-400" />
                    <span>Add Another Variant</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          Variant #{idx + 1}
                        </span>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title="Remove Variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                        {/* Variant Title */}
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Variant Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Size 40 / Navy"
                            value={v.title}
                            onChange={(e) => updateVariantField(idx, 'title', e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          />
                        </div>

                        {/* SKU */}
                        <div className="md:col-span-1">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-400">SKU</label>
                            <button
                              type="button"
                              onClick={() => autoGenerateSkuForVariant(idx)}
                              className="text-[10px] text-brand-400 hover:underline flex items-center gap-0.5"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              Auto
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. DX-PAN-01"
                            value={v.sku}
                            onChange={(e) => updateVariantField(idx, 'sku', e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                          />
                        </div>

                        {/* EAN-13 Barcode */}
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-400">EAN-13 Barcode</label>
                            <button
                              type="button"
                              onClick={() => generateBarcodeForVariant(idx)}
                              className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              <Barcode className="w-2.5 h-2.5" />
                              ⚡ 1-Click Generate
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="13-digit EAN barcode"
                            value={v.barcode}
                            onChange={(e) => updateVariantField(idx, 'barcode', e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                          />
                        </div>

                        {/* Selling Price */}
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Selling Price (৳)
                          </label>
                          <input
                            type="number"
                            placeholder="2850"
                            value={v.sellingPrice}
                            onChange={(e) => updateVariantField(idx, 'sellingPrice', e.target.value)}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                          />
                        </div>

                        {/* Cost Price */}
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Cost Price (৳)
                          </label>
                          <input
                            type="number"
                            placeholder="1400"
                            value={v.costPrice}
                            onChange={(e) => updateVariantField(idx, 'costPrice', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Stock Allocation for this variant */}
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
                          <Boxes className="w-3.5 h-3.5 text-amber-400" />
                          Initial Stock Allocation:
                        </span>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={v.initialStock}
                            onChange={(e) => updateVariantField(idx, 'initialStock', e.target.value)}
                            min="0"
                            className="w-24 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                          />
                          <span className="text-xs text-slate-400">units into</span>

                          <select
                            value={v.outletId}
                            onChange={(e) => updateVariantField(idx, 'outletId', e.target.value)}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
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

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Save & Publish Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
