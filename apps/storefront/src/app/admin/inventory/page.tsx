'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  X,
  Store,
  Warehouse,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface InventoryItem {
  level: {
    id: string;
    variantId: string;
    outletId: string;
    onHandQty: string;
    reservedQty: string;
    safetyStockBuffer: string;
    updatedAt: string;
  };
  variant: {
    id: string;
    productId: string;
    sku: string;
    barcode: string;
    title: string;
    sellingPrice: string;
  };
  product: {
    id: string;
    title: string;
    slug: string;
  };
  outlet: {
    id: string;
    code: string;
    name: string;
    isWarehouse: boolean;
  };
}

interface Outlet {
  id: string;
  code: string;
  name: string;
  isWarehouse: boolean;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutletId, setSelectedOutletId] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Receive GRN form state
  const [receiveVariantId, setReceiveVariantId] = useState('');
  const [receiveOutletId, setReceiveOutletId] = useState('');
  const [receiveQty, setReceiveQty] = useState('');
  const [receivePoRef, setReceivePoRef] = useState('');
  const [receiveNotes, setReceiveNotes] = useState('');

  // Stock Adjust form state
  const [adjustVariantId, setAdjustVariantId] = useState('');
  const [adjustOutletId, setAdjustOutletId] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('CYCLE_COUNT_ADJUST');
  const [adjustNotes, setAdjustNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, outRes] = await Promise.all([
        fetch('http://localhost:4000/api/v1/inventory/levels'),
        fetch('http://localhost:4000/api/v1/outlets'),
      ]);

      if (invRes.ok) {
        const json = await invRes.json();
        if (json.success) setItems(json.data);
      }
      if (outRes.ok) {
        const json = await outRes.json();
        if (json.success) setOutlets(json.data);
      }
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to load inventory levels' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReceiveModal = (item?: InventoryItem) => {
    if (item) {
      setReceiveVariantId(item.variant.id);
      setReceiveOutletId(item.outlet.id);
    } else if (items.length > 0) {
      setReceiveVariantId(items[0].variant.id);
      setReceiveOutletId(outlets[0]?.id || items[0].outlet.id);
    }
    setReceiveQty('20');
    setReceivePoRef(`PO-${Date.now().toString().slice(-6)}`);
    setReceiveNotes('Warehouse supplier batch receipt');
    setIsReceiveModalOpen(true);
  };

  const openAdjustModal = (item?: InventoryItem) => {
    if (item) {
      setAdjustVariantId(item.variant.id);
      setAdjustOutletId(item.outlet.id);
    } else if (items.length > 0) {
      setAdjustVariantId(items[0].variant.id);
      setAdjustOutletId(outlets[0]?.id || items[0].outlet.id);
    }
    setAdjustQty('');
    setAdjustType('CYCLE_COUNT_ADJUST');
    setAdjustNotes('Physical audit count correction');
    setIsAdjustModalOpen(true);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveVariantId || !receiveOutletId || !receiveQty || Number(receiveQty) <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid received quantity' });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch('http://localhost:4000/api/v1/inventory/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: receiveVariantId,
          outletId: receiveOutletId,
          quantity: Number(receiveQty),
          referenceId: receivePoRef,
          notes: receiveNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to receive stock');
      }

      setNotification({
        type: 'success',
        message: `Successfully received ${receiveQty} units into inventory! Updated on-hand: ${Number(data.data.onHandQty).toFixed(0)} units.`,
      });
      setIsReceiveModalOpen(false);
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(adjustQty);
    if (!adjustVariantId || !adjustOutletId || isNaN(qtyNum) || qtyNum === 0) {
      setNotification({ type: 'error', message: 'Please enter a valid non-zero adjustment quantity (+ or -)' });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch('http://localhost:4000/api/v1/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: adjustVariantId,
          outletId: adjustOutletId,
          quantity: qtyNum,
          eventType: adjustType,
          notes: adjustNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to adjust stock');
      }

      setNotification({
        type: 'success',
        message: `Stock adjusted by ${qtyNum > 0 ? '+' : ''}${qtyNum}. New on-hand: ${Number(data.data.onHandQty).toFixed(0)} units.`,
      });
      setIsAdjustModalOpen(false);
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    // Outlet filter
    if (selectedOutletId !== 'all' && item.outlet.id !== selectedOutletId) {
      return false;
    }

    const onHand = Number(item.level.onHandQty);
    const buffer = Number(item.level.safetyStockBuffer);

    // Stock status filter
    if (filterStockStatus === 'low' && onHand > buffer) return false;
    if (filterStockStatus === 'out' && onHand > 0) return false;

    // Search query
    const q = searchTerm.toLowerCase();
    const matchesProduct = item.product.title.toLowerCase().includes(q);
    const matchesVariant = item.variant.title.toLowerCase().includes(q);
    const matchesSku = item.variant.sku.toLowerCase().includes(q);
    const matchesBarcode = item.variant.barcode.includes(q);

    return matchesProduct || matchesVariant || matchesSku || matchesBarcode;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
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

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-400" />
            Stock & Inventory Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time atomic stock balances with live Goods Received Notes (GRN) and audit adjustments.
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
            onClick={() => openAdjustModal()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span>Adjust / Correct</span>
          </button>

          <button
            onClick={() => openReceiveModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Receive Goods (GRN)</span>
          </button>
        </div>
      </div>

      {/* Outlet Selector Tabs & Search */}
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
        {/* Outlet Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedOutletId('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedOutletId === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <span>All Locations</span>
          </button>

          {outlets.map((o) => {
            const isWarehouse = o.isWarehouse;
            const Icon = isWarehouse ? Warehouse : Store;
            const isSelected = selectedOutletId === o.id;

            return (
              <button
                key={o.id}
                onClick={() => setSelectedOutletId(o.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{o.name}</span>
                <span className="text-[10px] font-mono opacity-60">({o.code})</span>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800/60">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterStockStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStockStatus === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Stock
            </button>
            <button
              onClick={() => setFilterStockStatus('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                filterStockStatus === 'low'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Low Stock Alert
            </button>
            <button
              onClick={() => setFilterStockStatus('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStockStatus === 'out'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-950/70 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-400" />
            Loading live stock balances...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No inventory records found. Click "Receive Goods (GRN)" to stock an item!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Item & Variant</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">On-Hand</th>
                  <th className="py-3.5 px-4 text-center">Reserved</th>
                  <th className="py-3.5 px-4 text-center">Buffer</th>
                  <th className="py-3.5 px-4 text-center">Net Available</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredItems.map((item) => {
                  const onHand = Number(item.level.onHandQty);
                  const reserved = Number(item.level.reservedQty);
                  const buffer = Number(item.level.safetyStockBuffer);
                  const netAvailable = Math.max(0, onHand - reserved - buffer);
                  const isLow = onHand <= buffer;
                  const isDepleted = onHand <= 0;

                  return (
                    <tr key={item.level.id} className="hover:bg-slate-900/50 transition">
                      {/* Product & Variant */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{item.product.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-semibold">
                            {item.variant.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.variant.sku}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-400">
                            {item.variant.barcode}
                          </span>
                        </div>
                      </td>

                      {/* Outlet */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          {item.outlet.isWarehouse ? (
                            <Warehouse className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <Store className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span>{item.outlet.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.outlet.code}
                        </div>
                      </td>

                      {/* On Hand */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-white text-sm">
                        {onHand.toFixed(0)}
                      </td>

                      {/* Reserved */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                        {reserved.toFixed(0)}
                      </td>

                      {/* Buffer */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                        {buffer.toFixed(0)}
                      </td>

                      {/* Net Available */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-brand-400 text-sm">
                        {netAvailable.toFixed(0)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isDepleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Healthy
                          </span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openReceiveModal(item)}
                          className="px-2.5 py-1 rounded bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-[11px] font-semibold transition"
                        >
                          + Receive
                        </button>
                        <button
                          onClick={() => openAdjustModal(item)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold transition"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receive Stock (Goods Received Note / GRN) Modal */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-brand-400" />
                  Receive Goods / Inbound Stock (GRN)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record new delivery arrivals into the atomic inventory ledger.
                </p>
              </div>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Variant *
                </label>
                <select
                  value={receiveVariantId}
                  onChange={(e) => setReceiveVariantId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  {items.map((i) => (
                    <option key={i.variant.id} value={i.variant.id}>
                      {i.product.title} - {i.variant.title} (SKU: {i.variant.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Receiving Outlet / Warehouse *
                </label>
                <select
                  value={receiveOutletId}
                  onChange={(e) => setReceiveOutletId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Received Quantity (Units) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 50"
                    value={receiveQty}
                    onChange={(e) => setReceiveQty(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    PO / GRN Reference #
                  </label>
                  <input
                    type="text"
                    placeholder="PO-2026-001"
                    value={receivePoRef}
                    onChange={(e) => setReceivePoRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supplier / Inspection Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Factory shipment batch verified"
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
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
                      <span>Recording GRN...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Post Goods Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                  Stock Audit Correction / Adjustment
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record cycle count variances, damage write-offs, or audit changes.
                </p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Variant *
                </label>
                <select
                  value={adjustVariantId}
                  onChange={(e) => setAdjustVariantId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  {items.map((i) => (
                    <option key={i.variant.id} value={i.variant.id}>
                      {i.product.title} - {i.variant.title} (SKU: {i.variant.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Outlet *
                </label>
                <select
                  value={adjustOutletId}
                  onChange={(e) => setAdjustOutletId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Change Qty (+ to add, - to deduct) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. +5 or -2"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Adjustment Reason *
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="CYCLE_COUNT_ADJUST">Cycle Count Correction</option>
                    <option value="DAMAGED_WRITE_OFF">Damaged Stock Write-off</option>
                    <option value="RETURN_RESTOCK">Customer Return Restock</option>
                    <option value="THEFT_OR_LOSS">Theft / Shrinkage Loss</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Audit Notes / Reason Explanation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Found 2 extra units during monthly rack verification"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Adjusting Stock...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Execute Adjustment</span>
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
