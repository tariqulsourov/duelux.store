'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Store,
  Globe,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  X,
  MapPin,
  User,
  Package,
} from 'lucide-react';

interface OrderItem {
  id: string;
  sku: string;
  productTitle: string;
  variantTitle: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
}

interface OrderPayment {
  id: string;
  tenderType: string;
  amount: string;
  transactionRef?: string;
}

interface CourierConsignment {
  id: string;
  courierName: string;
  trackingNumber: string;
  status: string;
  codAmountToCollect: string;
}

interface Order {
  id: string;
  orderNumber: string;
  channel: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  discountTotal: string;
  shippingCharge: string;
  grandTotal: string;
  paidAmount: string;
  changeGiven: string;
  notes?: string;
  createdAt: string;
  customer?: {
    fullName: string;
    phone: string;
    email: string;
  };
  outlet?: {
    code: string;
    name: string;
  };
  items?: OrderItem[];
  payments?: OrderPayment[];
  courierConsignment?: CourierConsignment;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'POS' | 'WEB'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/v1/admin/orders');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setOrders(json.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    if (channelFilter === 'POS' && ord.channel !== 'POS_IN_STORE') return false;
    if (channelFilter === 'WEB' && ord.channel !== 'ECOMMERCE_WEB') return false;

    const q = searchTerm.toLowerCase();
    const matchNumber = ord.orderNumber.toLowerCase().includes(q);
    const matchCustomer = ord.customer?.fullName?.toLowerCase().includes(q) || ord.customer?.phone?.includes(q);
    const matchTracking = ord.courierConsignment?.trackingNumber?.toLowerCase().includes(q);

    return matchNumber || matchCustomer || matchTracking;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-brand-400" />
            Omnichannel Orders Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of all in-store POS receipts and digital web store orders.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
        {/* Channel Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setChannelFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              channelFilter === 'ALL'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Channels ({orders.length})
          </button>
          <button
            onClick={() => setChannelFilter('POS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              channelFilter === 'POS'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            In-Store POS
          </button>
          <button
            onClick={() => setChannelFilter('WEB')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              channelFilter === 'WEB'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            Online Web
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Phone, or Courier Tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950/70 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-400" />
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No orders found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Channel & Outlet</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4 text-right">Total (৳)</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Courier / Delivery</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredOrders.map((ord) => {
                  const isPos = ord.channel === 'POS_IN_STORE';
                  const primaryPayment = ord.payments?.[0];

                  return (
                    <tr key={ord.id} className="hover:bg-slate-900/50 transition">
                      {/* Order # and Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white text-xs">{ord.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(ord.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Channel & Outlet */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isPos ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Store className="w-3 h-3" />
                              POS In-Store
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              <Globe className="w-3 h-3" />
                              Web Storefront
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ord.outlet?.name || 'Main Location'}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">
                          {ord.customer?.fullName || 'Walk-in Cash Customer'}
                        </div>
                        {ord.customer?.phone && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {ord.customer.phone}
                          </div>
                        )}
                      </td>

                      {/* Items Summary */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">
                          {ord.items?.length || 0} line item(s)
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {ord.items?.map((it) => `${Number(it.quantity).toFixed(0)}x ${it.variantTitle}`).join(', ')}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                        ৳{Number(ord.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{ord.paymentStatus}</span>
                        </div>
                        {primaryPayment && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {primaryPayment.tenderType}
                          </div>
                        )}
                      </td>

                      {/* Courier */}
                      <td className="py-3.5 px-4">
                        {ord.courierConsignment ? (
                          <div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                              <Truck className="w-3.5 h-3.5" />
                              <span>{ord.courierConsignment.courierName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {ord.courierConsignment.trackingNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">In-Store Pickup / Cashier</span>
                        )}
                      </td>

                      {/* Details Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white font-mono">
                    {selectedOrder.orderNumber}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedOrder.channel === 'POS_IN_STORE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {selectedOrder.channel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-GB')}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Customer & Location Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-brand-400" />
                    Customer Information
                  </div>
                  <div className="font-bold text-white text-sm">
                    {selectedOrder.customer?.fullName || 'Walk-in Cash Customer'}
                  </div>
                  {selectedOrder.customer?.phone && (
                    <div className="text-slate-300 font-mono mt-0.5">
                      {selectedOrder.customer.phone}
                    </div>
                  )}
                  {selectedOrder.customer?.email && (
                    <div className="text-slate-400">{selectedOrder.customer.email}</div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-brand-400" />
                    Fulfillment Outlet
                  </div>
                  <div className="font-bold text-white text-sm">
                    {selectedOrder.outlet?.name || 'Dhanmondi Flagship'}
                  </div>
                  <div className="text-slate-400 font-mono mt-0.5">
                    Code: {selectedOrder.outlet?.code || 'STORE-01'}
                  </div>
                  {selectedOrder.courierConsignment && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {selectedOrder.courierConsignment.courierName}: {selectedOrder.courierConsignment.trackingNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3 h-3 text-brand-400" />
                  Order Items
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60 bg-slate-900/30">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{item.productTitle}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Variant: {item.variantTitle}</span>
                          <span className="font-mono">SKU: {item.sku}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-white">
                          ৳{Number(item.totalPrice).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {Number(item.quantity).toFixed(0)} × ৳{Number(item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>৳{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {Number(selectedOrder.shippingCharge) > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping Fee</span>
                    <span>+৳{Number(selectedOrder.shippingCharge).toFixed(2)}</span>
                  </div>
                )}
                {Number(selectedOrder.discountTotal) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-৳{Number(selectedOrder.discountTotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Tax (Skipped / 0.00% Policy)</span>
                  <span>৳0.00</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-white font-bold text-sm">
                  <span>Grand Total</span>
                  <span className="text-brand-400">৳{Number(selectedOrder.grandTotal).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Tender Details */}
              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Payment Tender Breakdown
                  </div>
                  <div className="space-y-1.5">
                    {selectedOrder.payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                      >
                        <span className="text-slate-300 font-semibold">{p.tenderType}</span>
                        <span className="text-emerald-400 font-bold">
                          ৳{Number(p.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
