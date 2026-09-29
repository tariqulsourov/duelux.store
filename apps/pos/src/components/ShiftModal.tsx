'use client';

import React, { useState } from 'react';
import { X, CircleDollarSign, ArrowUpRight, ArrowDownLeft, Lock } from 'lucide-react';
import Decimal from 'decimal.js';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData: {
    id: string;
    openedAt: string;
    openingFloat: number;
    cashSales: number;
    cardSales: number;
    mobileWalletSales: number;
    expectedCash: number;
  };
  onDrawerEvent: (type: 'CASH_IN' | 'CASH_OUT', amount: number, reason: string) => Promise<void>;
  onCloseShift: (countedCash: number, notes?: string) => Promise<{ variance: string }>;
}

export function ShiftModal({
  isOpen,
  onClose,
  shiftData,
  onDrawerEvent,
  onCloseShift,
}: ShiftModalProps) {
  const [activeAction, setActiveAction] = useState<'VIEW' | 'CASH_IN' | 'CASH_OUT' | 'CLOSE_SHIFT'>('VIEW');
  const [adjAmount, setAdjAmount] = useState<string>('');
  const [adjReason, setAdjReason] = useState<string>('');
  const [countedCash, setCountedCash] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const countedNum = new Decimal(countedCash || 0);
  const expectedNum = new Decimal(shiftData.expectedCash || 0);
  const variance = countedNum.minus(expectedNum);

  const handleAdjustSubmit = async () => {
    if (!adjAmount || Number(adjAmount) <= 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onDrawerEvent(
        activeAction as 'CASH_IN' | 'CASH_OUT',
        Number(adjAmount),
        adjReason || 'Cash drawer adjustment'
      );
      setAdjAmount('');
      setAdjReason('');
      setActiveAction('VIEW');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShiftSubmit = async () => {
    if (!countedCash || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const summary = await onCloseShift(Number(countedCash), closeNotes);
      alert(`Shift closed successfully! Variance: ৳${summary.variance}`);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-black text-gray-900">Shift & Cash Drawer</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeAction === 'VIEW' && (
          <div className="py-4 space-y-4">
            {/* Shift Financial Overview Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                <span className="text-[11px] font-bold uppercase text-gray-400">Opening Float</span>
                <div className="text-base font-extrabold text-gray-800">
                  ৳{shiftData.openingFloat.toFixed(2)}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-100">
                <span className="text-[11px] font-bold uppercase text-emerald-700">Cash Sales</span>
                <div className="text-base font-extrabold text-emerald-900">
                  +৳{shiftData.cashSales.toFixed(2)}
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-100">
                <span className="text-[11px] font-bold uppercase text-blue-700">Card Sales</span>
                <div className="text-base font-extrabold text-blue-900">
                  ৳{shiftData.cardSales.toFixed(2)}
                </div>
              </div>

              <div className="rounded-xl bg-pink-50/60 p-3 border border-pink-100">
                <span className="text-[11px] font-bold uppercase text-pink-700">Mobile Wallet</span>
                <div className="text-base font-extrabold text-pink-900">
                  ৳{shiftData.mobileWalletSales.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Expected Cash in Drawer */}
            <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/30 p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Expected Cash in Drawer
              </span>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                ৳{shiftData.expectedCash.toFixed(2)}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAction('CASH_IN')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                <span>Cash In</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction('CASH_OUT')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                <ArrowUpRight className="h-4 w-4 text-amber-600" />
                <span>Cash Out</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction('CLOSE_SHIFT')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-3 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-600/20 transition"
              >
                <Lock className="h-4 w-4" />
                <span>Close Shift</span>
              </button>
            </div>
          </div>
        )}

        {(activeAction === 'CASH_IN' || activeAction === 'CASH_OUT') && (
          <div className="py-4 space-y-4">
            <h4 className="text-sm font-bold text-gray-900">
              {activeAction === 'CASH_IN' ? 'Drawer Cash-In (Deposit Float)' : 'Drawer Cash-Out (Safe Drop / Payout)'}
            </h4>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Amount (৳)
              </label>
              <input
                type="number"
                step="any"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200 p-3 text-lg font-bold focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Reason / Memo
              </label>
              <input
                type="text"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                placeholder="e.g. Midday safe drop"
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAction('VIEW')}
                className="flex-1 rounded-xl border py-3 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdjustSubmit}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-gray-900 py-3 text-xs font-bold text-white hover:bg-black"
              >
                {isSubmitting ? 'Recording...' : 'Record Adjustment'}
              </button>
            </div>
          </div>
        )}

        {activeAction === 'CLOSE_SHIFT' && (
          <div className="py-4 space-y-4">
            <h4 className="text-sm font-bold text-red-600">
              End-of-Shift Reconciliation (Z-Report)
            </h4>

            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
              Expected in drawer: <strong className="text-gray-900">৳{shiftData.expectedCash.toFixed(2)}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Counted Cash in Drawer (৳)
              </label>
              <input
                type="number"
                step="any"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                placeholder="Enter physical cash counted..."
                className="w-full rounded-xl border border-gray-200 p-3 text-lg font-bold focus:border-brand-500 focus:outline-none"
              />
            </div>

            {countedCash && (
              <div
                className={`rounded-xl p-3 text-xs font-bold ${
                  variance.equals(0)
                    ? 'bg-emerald-50 text-emerald-800'
                    : variance.greaterThan(0)
                    ? 'bg-blue-50 text-blue-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                Variance: {variance.greaterThanOrEqualTo(0) ? '+' : ''}৳{variance.toFixed(2)}
                {variance.equals(0) ? ' (Balanced)' : variance.greaterThan(0) ? ' (Surplus)' : ' (Shortage)'}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Closing Notes
              </label>
              <input
                type="text"
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="Optional closing notes"
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAction('VIEW')}
                className="flex-1 rounded-xl border py-3 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCloseShiftSubmit}
                disabled={!countedCash || isSubmitting}
                className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Closing...' : 'Close & Lock Shift'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
