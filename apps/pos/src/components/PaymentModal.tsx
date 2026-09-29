'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Banknote, CreditCard, Smartphone, Printer } from 'lucide-react';
import Decimal from 'decimal.js';
import { ThermalPrinterDriver } from '../lib/printer';

export interface PaymentTender {
  tenderType: 'CASH' | 'CARD' | 'MOBILE_WALLET';
  amount: number;
  transactionRef?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  onCompleteCheckout: (payments: PaymentTender[]) => Promise<{ orderNumber: string; orderId: string }>;
}

export function PaymentModal({
  isOpen,
  onClose,
  grandTotal,
  onCompleteCheckout,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'CASH' | 'CARD' | 'MOBILE_WALLET'>('CASH');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  const [cardRef, setCardRef] = useState<string>('');
  const [mobileAmount, setMobileAmount] = useState<string>('');
  const [mobileRef, setMobileRef] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDue = new Decimal(grandTotal);
  const cashNum = new Decimal(cashAmount || 0);
  const cardNum = new Decimal(cardAmount || 0);
  const mobileNum = new Decimal(mobileAmount || 0);

  const totalTendered = cashNum.plus(cardNum).plus(mobileNum);
  const remainingDue = Decimal.max(0, totalDue.minus(totalTendered));
  const changeToReturn = Decimal.max(0, totalTendered.minus(totalDue));
  const isPaidInFull = totalTendered.greaterThanOrEqualTo(totalDue);

  const handleQuickCash = (val: number) => {
    setCashAmount(val.toString());
  };

  const handlePayExact = () => {
    if (activeTab === 'CASH') setCashAmount(remainingDue.toString());
    if (activeTab === 'CARD') setCardAmount(remainingDue.toString());
    if (activeTab === 'MOBILE_WALLET') setMobileAmount(remainingDue.toString());
  };

  const handleSubmit = async () => {
    if (!isPaidInFull || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payments: PaymentTender[] = [];
      if (cashNum.greaterThan(0)) {
        payments.push({ tenderType: 'CASH', amount: cashNum.toNumber() });
      }
      if (cardNum.greaterThan(0)) {
        payments.push({ tenderType: 'CARD', amount: cardNum.toNumber(), transactionRef: cardRef });
      }
      if (mobileNum.greaterThan(0)) {
        payments.push({ tenderType: 'MOBILE_WALLET', amount: mobileNum.toNumber(), transactionRef: mobileRef });
      }

      const result = await onCompleteCheckout(payments);

      // Trigger hardware cash drawer pulse if cash was part of payment
      if (cashNum.greaterThan(0)) {
        await ThermalPrinterDriver.kickDrawer();
      }

      onClose();
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-xl font-black text-gray-900">Process Tender</h3>
            <span className="text-xs text-gray-500">Split payment & tender recording</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Totals & Remaining Balance Bar */}
        <div className="my-5 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3.5 border border-gray-100">
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Total Due</span>
            <div className="text-lg font-black text-gray-900">৳{totalDue.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Tendered</span>
            <div className="text-lg font-black text-emerald-600">৳{totalTendered.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">
              {changeToReturn.greaterThan(0) ? 'Change Due' : 'Remaining'}
            </span>
            <div
              className={`text-lg font-black ${
                changeToReturn.greaterThan(0) ? 'text-amber-600' : remainingDue.greaterThan(0) ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              ৳{changeToReturn.greaterThan(0) ? changeToReturn.toFixed(2) : remainingDue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tender Type Selection Tabs */}
        <div className="flex gap-2 border-b border-gray-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('CASH')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === 'CASH'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Banknote className="h-4 w-4" />
            <span>Cash ({cashNum.greaterThan(0) ? `৳${cashNum.toFixed(2)}` : '0'})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CARD')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === 'CARD'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Card ({cardNum.greaterThan(0) ? `৳${cardNum.toFixed(2)}` : '0'})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MOBILE_WALLET')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === 'MOBILE_WALLET'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>bKash/Nagad ({mobileNum.greaterThan(0) ? `৳${mobileNum.toFixed(2)}` : '0'})</span>
          </button>
        </div>

        {/* Tab Input Area */}
        <div className="py-4">
          {activeTab === 'CASH' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Cash Amount (৳)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Enter cash received..."
                    className="flex-1 rounded-xl border border-gray-200 p-3 text-lg font-bold focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={handlePayExact}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 text-xs font-bold hover:bg-gray-100"
                  >
                    Exact Due
                  </button>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickCash(val)}
                    className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50/60 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    ৳{val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'CARD' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Card Charge Amount (৳)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    placeholder="Charge amount..."
                    className="flex-1 rounded-xl border border-gray-200 p-3 text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={handlePayExact}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 text-xs font-bold hover:bg-gray-100"
                  >
                    Exact Due
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Card Ref / Authorization Code
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. VISA-4829 or POS Auth ID"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'MOBILE_WALLET' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Mobile Wallet Amount (৳)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={mobileAmount}
                    onChange={(e) => setMobileAmount(e.target.value)}
                    placeholder="bKash / Nagad amount..."
                    className="flex-1 rounded-xl border border-gray-200 p-3 text-lg font-bold focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                  <button
                    type="button"
                    onClick={handlePayExact}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 text-xs font-bold hover:bg-gray-100"
                  >
                    Exact Due
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  value={mobileRef}
                  onChange={(e) => setMobileRef(e.target.value)}
                  placeholder="e.g. BKASH-9K2L1"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3.5 font-bold text-gray-600 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isPaidInFull || isSubmitting}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-extrabold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-50"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>{isSubmitting ? 'Finalizing Order...' : 'Complete & Print Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
