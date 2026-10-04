'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  Store,
  Globe,
  AlertTriangle,
  Package,
  ArrowRight,
  Boxes,
  PlusCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

interface AdminStats {
  totalRevenue: string;
  totalOrdersCount: number;
  posOrdersCount: number;
  webOrdersCount: number;
  totalSkusCount: number;
  lowStockCount: number;
}

interface OrderItem {
  id: string;
  productTitle: string;
  variantTitle: string;
  quantity: string;
  totalPrice: string;
}

interface Order {
  id: string;
  orderNumber: string;
  channel: string;
  status: string;
  paymentStatus: string;
  grandTotal: string;
  createdAt: string;
  customer?: { fullName: string; phone: string };
  items?: OrderItem[];
  payments?: { tenderType: string; amount: string }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('http://localhost:4000/api/v1/admin/stats'),
        fetch('http://localhost:4000/api/v1/admin/orders'),
      ]);

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) setStats(statsJson.data);
      }

      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        if (ordersJson.success) setOrders(ordersJson.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin overview data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-700/60 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {t('admin_overview')}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {t('omnichannel_notice')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('refresh')}</span>
          </button>

          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('create_product')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('gross_sales')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            ৳{stats ? Number(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats?.totalOrdersCount || 0}</span>
            <span>{t('items')}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </div>

        {/* POS In-Store Sales */}
        <div className="bg-white dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('pos_orders_stat')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {stats?.posOrdersCount || 0}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Dhanmondi Flagship</span>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold inline-flex items-center gap-1"
            >
              POS <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
        </div>

        {/* Online Web Orders */}
        <div className="bg-white dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('web_orders_stat')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {stats?.webOrdersCount || 0}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>{t('store_title')}</span>
            <Link href="/" target="_blank" className="text-amber-600 dark:text-amber-400 hover:underline font-semibold inline-flex items-center gap-1">
              Store <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400"></div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('low_stock_alerts')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3 flex items-center gap-2">
            <span>{stats?.lowStockCount || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{t('low_stock')}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>{stats?.totalSkusCount || 0} {t('active_skus')}</span>
            <Link href="/admin/inventory" className="text-rose-600 dark:text-rose-400 hover:underline font-semibold inline-flex items-center gap-1">
              {t('actions')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-400"></div>
        </div>
      </div>


      {/* Quick Operations Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-900/60 transition group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition">
              Create New Products & Variants
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add products with 1-click automatic EAN-13 barcodes, SKU generation, and initial stock allocation.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/inventory"
          className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/60 transition group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
              Receive Goods (GRN) & Stock Adjustments
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Receive purchase shipments into Dhanmondi Flagship or Central Tejgaon Warehouse atomically.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/ledger"
          className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/60 transition group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
              View Audit Stock Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Inspect immutable audit trail of every sale, return, adjustment, and receipt in the company.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-slate-950/70 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              Recent Multi-Channel Orders
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live orders processed across Physical POS and Online Web Storefront
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-400" />
            Loading orders from MySQL...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No orders processed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Channel</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4 text-right">Total (৳)</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {orders.slice(0, 10).map((order) => {
                  const isPos = order.channel === 'POS_IN_STORE';
                  return (
                    <tr key={order.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPos
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                          }`}
                        >
                          {isPos ? (
                            <>
                              <Store className="w-3 h-3" />
                              POS In-Store
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3" />
                              Web Storefront
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">
                          {order.customer?.fullName || 'Walk-in Cash Customer'}
                        </div>
                        {order.customer?.phone && (
                          <div className="text-[10px] text-slate-400">
                            {order.customer.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 font-medium">
                          {order.items?.length || 0} item(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white font-mono">
                        ৳{Number(order.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
