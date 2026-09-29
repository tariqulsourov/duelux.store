'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, totalCount } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-800" />
              <h2 className="text-lg font-black text-gray-900">Your Bag ({totalCount})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                <ShoppingBag className="mb-3 h-12 w-12 text-gray-300 stroke-[1.5]" />
                <p className="text-base font-bold text-gray-700">Your shopping bag is empty</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
                  Explore our luxury collection and discover bespoke apparel.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
                >
                  <div className="flex-1 pr-3">
                    <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
                      {item.productTitle}
                    </h3>
                    <div className="text-xs font-semibold text-gray-500 mt-0.5">
                      {item.variantTitle} • <span className="font-mono">{item.sku}</span>
                    </div>
                    <div className="text-sm font-extrabold text-luxury-900 mt-2">
                      ৳{item.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="h-6 w-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="h-6 w-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 p-6">
              <div className="flex justify-between items-baseline mb-4 text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-xl font-black text-gray-900">৳{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Shipping and zone taxes calculated at checkout.
              </p>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-luxury-900 py-4 text-base font-extrabold text-white shadow-lg shadow-black/10 hover:bg-black transition"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
