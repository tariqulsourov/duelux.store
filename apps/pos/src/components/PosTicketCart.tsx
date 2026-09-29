'use client';

import React from 'react';
import { Trash2, Plus, Minus, PauseCircle, PlayCircle, ShoppingBag, Receipt, ArrowRight } from 'lucide-react';
import Decimal from 'decimal.js';

export interface CartLineItem {
  variantId: string;
  sku: string;
  productTitle: string;
  variantTitle: string;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  taxRatePercent: number;
}

interface PosTicketCartProps {
  items: CartLineItem[];
  onUpdateQty: (variantId: string, delta: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
  onParkOrder: () => void;
  onOpenParkedOrders: () => void;
  parkedOrdersCount: number;
  onProceedToPayment: () => void;
}

export function PosTicketCart({
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onParkOrder,
  onOpenParkedOrders,
  parkedOrdersCount,
  onProceedToPayment,
}: PosTicketCartProps) {
  // Financial computations with Decimal precision
  let subtotal = new Decimal(0);
  let discountTotal = new Decimal(0);
  let taxTotal = new Decimal(0);

  for (const item of items) {
    const qty = new Decimal(item.quantity);
    const price = new Decimal(item.unitPrice);
    const disc = new Decimal(item.discountAmount || 0);

    const lineBase = price.times(qty).minus(disc);
    const lineTax = lineBase.times(new Decimal(item.taxRatePercent || 0).dividedBy(100));

    subtotal = subtotal.plus(price.times(qty));
    discountTotal = discountTotal.plus(disc);
    taxTotal = taxTotal.plus(lineTax);
  }

  const grandTotal = subtotal.minus(discountTotal).plus(taxTotal);
  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="flex h-full w-[420px] flex-col border-l border-gray-200 bg-white">
      {/* Top Ticket Status & Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Active Ticket ({totalItemCount} items)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Park / Hold Order */}
          <button
            type="button"
            onClick={onParkOrder}
            disabled={items.length === 0}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
            title="Park (Hold) this ticket"
          >
            <PauseCircle className="h-3.5 w-3.5" />
            <span>Hold</span>
          </button>

          {/* Recall Parked Orders */}
          {parkedOrdersCount > 0 && (
            <button
              type="button"
              onClick={onOpenParkedOrders}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition"
              title="Recall Parked Tickets"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Recall ({parkedOrdersCount})</span>
            </button>
          )}

          {/* Clear Cart */}
          <button
            type="button"
            onClick={onClearCart}
            disabled={items.length === 0}
            className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition"
            title="Clear ticket"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
            <ShoppingBag className="mb-2 h-10 w-10 text-gray-300 stroke-[1.5]" />
            <p className="text-sm font-semibold text-gray-600">Ticket is empty</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
              Scan barcodes with your USB scanner or tap products to add
            </p>
          </div>
        ) : (
          items.map((item) => {
            const lineTotal = new Decimal(item.unitPrice)
              .times(item.quantity)
              .minus(item.discountAmount || 0);

            return (
              <div
                key={item.variantId}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3 transition hover:border-gray-200"
              >
                <div className="flex-1 pr-2">
                  <h4 className="line-clamp-1 text-xs font-bold text-gray-900">
                    {item.productTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span>{item.variantTitle}</span>
                    <span>•</span>
                    <span className="font-mono">৳{item.unitPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.variantId, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-extrabold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.variantId, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Line Total & Remove */}
                <div className="ml-3 flex items-center gap-2">
                  <span className="text-xs font-extrabold text-gray-900 min-w-[65px] text-right">
                    ৳{lineTotal.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.variantId)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Summary & Pay Action */}
      <div className="border-t border-gray-200 bg-white p-4 shadow-lg">
        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">৳{subtotal.toFixed(2)}</span>
          </div>
          {discountTotal.greaterThan(0) && (
            <div className="flex justify-between text-red-600">
              <span>Discounts</span>
              <span className="font-semibold">-৳{discountTotal.toFixed(2)}</span>
            </div>
          )}
          {taxTotal.greaterThan(0) && (
            <div className="flex justify-between">
              <span>VAT / Tax</span>
              <span className="font-semibold text-gray-800">৳{taxTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-dashed border-gray-200 pt-2 text-base font-black text-gray-900">
            <span>TOTAL</span>
            <span className="text-xl font-black text-brand-700">
              ৳{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Big Tender / Pay Action Button */}
        <button
          type="button"
          onClick={onProceedToPayment}
          disabled={items.length === 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-extrabold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
        >
          <span>CHARGE ৳{grandTotal.toFixed(2)}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
