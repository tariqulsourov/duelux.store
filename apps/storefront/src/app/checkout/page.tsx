'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { Truck, ShieldCheck, CreditCard, Banknote, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  // Delivery zones from backend
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'CARD'>('COD');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/storefront/delivery-zones`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setDeliveryZones(json.data);
          setSelectedZone(json.data[0] || null);
        }
      })
      .catch((err) => console.error('Failed to load delivery zones:', err));
  }, []);

  const shippingCharge = selectedZone ? Number(selectedZone.baseRate) : 60;
  const grandTotal = subtotal + shippingCharge;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    if (!name || !phone || !address) {
      alert('Please complete all required customer and delivery fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Temporary Stock Reservation Lock (Prevents overselling against concurrent POS counter checkouts)
      for (const item of cart) {
        await fetch(`${API_BASE_URL}/storefront/checkout/reserve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }),
        });
      }

      // 2. Finalize E-Commerce Order
      const res = await fetch(`${API_BASE_URL}/storefront/checkout/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          shippingAddress: address,
          city,
          zoneName: selectedZone?.name || 'Standard',
          shippingCharge,
          paymentMethod,
          items: cart.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          notes: orderNotes,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Checkout submission failed');
      }

      clearCart();
      router.push(`/order-success/${json.data.orderNumber}`);
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center">
        <h2 className="text-2xl font-black text-gray-900">Your shopping bag is empty</h2>
        <p className="mt-2 text-sm text-gray-500">Add luxury items before proceeding to checkout.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 rounded-xl bg-luxury-900 px-6 py-3 font-bold text-white hover:bg-black transition"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Digital Checkout</h1>
        <p className="text-xs font-semibold text-gray-500 mt-1">
          Atomic inventory reservation backed by the Dhanmondi Central Warehouse.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Form: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer Contact */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-gray-900 mb-4">1. Customer Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariqul Islam"
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm font-medium focus:border-luxury-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Phone Number (CRM Key) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01700000000"
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm font-medium focus:border-luxury-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Email Address (For Invoicing)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm font-medium focus:border-luxury-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery Matrix */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-gray-900 mb-4">2. Shipping Destination & Delivery Matrix</h3>

            {/* Delivery Zone Options */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                Select Geographical Delivery Zone
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {deliveryZones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZone(z)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedZone?.id === z.id
                        ? 'border-luxury-900 bg-luxury-900 text-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
                    }`}
                  >
                    <div className="text-xs font-black">{z.name}</div>
                    <div className="text-lg font-extrabold mt-1">৳{Number(z.baseRate).toFixed(2)}</div>
                    <div className="text-[11px] opacity-75 mt-0.5">{z.estimatedDays} business days</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Road, Area details..."
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm font-medium focus:border-luxury-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Order Notes / Special Delivery Instructions
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Please call before arriving"
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm font-medium focus:border-luxury-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-gray-900 mb-4">3. Payment Gateway Option</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Banknote className="h-6 w-6 text-brand-600 mb-1.5" />
                <span className="text-xs font-black">Cash on Delivery</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Pay upon inspection</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BKASH')}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                  paymentMethod === 'BKASH'
                    ? 'border-pink-600 bg-pink-50 text-pink-900 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Smartphone className="h-6 w-6 text-pink-600 mb-1.5" />
                <span className="text-xs font-black">bKash / Nagad</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Instant Mobile Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                  paymentMethod === 'CARD'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <CreditCard className="h-6 w-6 text-blue-600 mb-1.5" />
                <span className="text-xs font-black">Credit / Debit Card</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Visa, Mastercard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary: Order Totals & Lock Action */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-gray-900 border-b pb-4">Order Summary</h3>

            {/* Line items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.variantId} className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{item.productTitle}</span>
                    <span className="text-gray-500 block">{item.variantTitle} × {item.quantity}</span>
                  </div>
                  <span className="font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge ({selectedZone?.name || 'Standard'})</span>
                <span className="font-bold text-gray-900">৳{shippingCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-200 pt-3 text-lg font-black text-gray-900">
                <span>Total Due</span>
                <span className="text-2xl text-brand-700">৳{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 text-[11px] text-gray-500 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
              <span>Stock will be atomically reserved in database upon order confirmation.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-luxury-900 py-4 text-base font-extrabold text-white shadow-xl shadow-luxury-900/10 hover:bg-black transition active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Reserving Stock & Placing Order...' : 'CONFIRM ORDER'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
