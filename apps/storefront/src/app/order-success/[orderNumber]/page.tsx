import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Truck, ShieldCheck, ArrowRight, Store } from 'lucide-react';

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      {/* Success Badge */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 shadow-xl shadow-brand-500/10 border border-brand-200">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <span className="text-xs font-black uppercase tracking-widest text-brand-600">
        Order Confirmed
      </span>

      <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">
        Thank You for Your Order!
      </h1>

      <p className="mt-3 text-sm text-gray-600 leading-relaxed">
        Your order <strong className="text-gray-900 font-mono">{orderNumber}</strong> has been received and allocated in our centralized warehouse.
      </p>

      {/* Courier & Tracking Card */}
      <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-luxury-900" />
            <h3 className="text-sm font-black text-gray-900">Courier Consignment Active</h3>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
            Steadfast Courier
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block font-semibold">Order Reference:</span>
            <span className="font-bold text-gray-800 font-mono text-sm">{orderNumber}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-semibold">Courier Tracking Status:</span>
            <span className="font-bold text-emerald-700">Booked & Awaiting Dispatch</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 p-3.5 text-xs text-gray-600 flex items-start gap-2.5 border border-gray-100">
          <Store className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <span>
            <strong>Omnichannel Guarantee:</strong> Need an immediate size exchange? Show this order reference at our Dhanmondi Flagship Store counter for instant walk-in replacement!
          </span>
        </div>
      </div>

      {/* Next Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-luxury-900 px-8 py-4 text-sm font-extrabold text-white shadow-lg shadow-black/10 hover:bg-black transition"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
