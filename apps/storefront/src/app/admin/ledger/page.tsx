'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight,
  Store,
  Warehouse,
  ShoppingBag,
  Boxes,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  variantId: string;
  outletId: string;
  changeQty: string;
  resultingOnHand: string;
  eventType: string;
  referenceType: string;
  referenceId: string;
  notes: string;
  createdAt: string;
  variantTitle: string;
  sku: string;
  productTitle: string;
  outletName: string;
}

export default function AdminLedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/v1/admin/ledger');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setEntries(json.data);
      }
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredEntries = entries.filter((item) => {
    if (eventTypeFilter !== 'ALL' && item.eventType !== eventTypeFilter) return false;

    const q = searchTerm.toLowerCase();
    const matchProduct = item.productTitle?.toLowerCase().includes(q);
    const matchSku = item.sku?.toLowerCase().includes(q);
    const matchRef = item.referenceId?.toLowerCase().includes(q);
    const matchOutlet = item.outletName?.toLowerCase().includes(q);

    return matchProduct || matchSku || matchRef || matchOutlet;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'PURCHASE_RECEIPT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Boxes className="w-3 h-3" />
            Purchase Receipt (GRN)
          </span>
        );
      case 'POS_SALE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Store className="w-3 h-3" />
            POS Cashier Sale
          </span>
        );
      case 'ONLINE_SALE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShoppingBag className="w-3 h-3" />
            Web Storefront Sale
          </span>
        );
      case 'CYCLE_COUNT_ADJUST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RefreshCw className="w-3 h-3" />
            Cycle Count Adjustment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-brand-400" />
            Immutable Stock Audit Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-proof record of every single unit increase, deduction, sale, and adjustment across Bangladesh.
          </p>
        </div>

        <button
          onClick={fetchLedger}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setEventTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              eventTypeFilter === 'ALL'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Events ({entries.length})
          </button>
          <button
            onClick={() => setEventTypeFilter('PURCHASE_RECEIPT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              eventTypeFilter === 'PURCHASE_RECEIPT'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Receipts (GRN)
          </button>
          <button
            onClick={() => setEventTypeFilter('POS_SALE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              eventTypeFilter === 'POS_SALE'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            POS Sales
          </button>
          <button
            onClick={() => setEventTypeFilter('ONLINE_SALE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              eventTypeFilter === 'ONLINE_SALE'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Online Sales
          </button>
          <button
            onClick={() => setEventTypeFilter('CYCLE_COUNT_ADJUST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              eventTypeFilter === 'CYCLE_COUNT_ADJUST'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Adjustments
          </button>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Product, SKU, Reference #, or Outlet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Ledger Feed Table */}
      <div className="bg-slate-950/70 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-400" />
            Loading stock audit trail...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No audit records matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">Quantity Change</th>
                  <th className="py-3.5 px-4 text-right">Resulting Balance</th>
                  <th className="py-3.5 px-4">Reference & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredEntries.map((row) => {
                  const changeNum = Number(row.changeQty);
                  const isPositive = changeNum > 0;

                  return (
                    <tr key={row.id} className="hover:bg-slate-900/50 transition">
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      {/* Event Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getEventBadge(row.eventType)}
                      </td>

                      {/* Product Title & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{row.productTitle}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{row.variantTitle}</span>
                          <span>•</span>
                          <span className="font-mono text-indigo-400">{row.sku}</span>
                        </div>
                      </td>

                      {/* Outlet */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                        {row.outletName}
                      </td>

                      {/* Quantity Change */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {isPositive ? `+${changeNum.toFixed(0)}` : changeNum.toFixed(0)}
                        </span>
                      </td>

                      {/* Resulting Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm whitespace-nowrap">
                        {Number(row.resultingOnHand).toFixed(0)}
                      </td>

                      {/* Reference & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-300 text-[11px]">
                          {row.referenceType ? `${row.referenceType}: ` : ''}
                          <span className="text-white font-semibold">{row.referenceId || 'N/A'}</span>
                        </div>
                        {row.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[220px] mt-0.5">
                            {row.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
