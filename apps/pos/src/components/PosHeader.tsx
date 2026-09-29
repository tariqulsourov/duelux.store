'use client';

import React from 'react';
import { Store, ShieldCheck, Tag, CircleDollarSign, Lock, Maximize, Smartphone } from 'lucide-react';

interface PosHeaderProps {
  outletName: string;
  registerCode: string;
  cashierName: string;
  onOpenLabelModal: () => void;
  onOpenShiftModal: () => void;
  onLockTerminal: () => void;
  isScannerActive?: boolean;
}

export function PosHeader({
  outletName,
  registerCode,
  cashierName,
  onOpenLabelModal,
  onOpenShiftModal,
  onLockTerminal,
  isScannerActive = true,
}: PosHeaderProps) {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Brand & Outlet Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-black text-white shadow-md shadow-brand-500/20">
            DX
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-gray-900 leading-none">
              DUELUX POS
            </h1>
            <span className="text-[11px] font-semibold text-brand-700 tracking-wider">
              RETAIL ENGINE v1.0
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
          <Store className="h-3.5 w-3.5 text-gray-500" />
          <span>{outletName}</span>
          <span className="rounded bg-gray-200 px-1.5 py-0.5 font-bold text-gray-800">
            {registerCode}
          </span>
        </div>
      </div>

      {/* Center Status: Hardware Scanner Listener Active */}
      <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>USB Scanner Interceptor: ACTIVE</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {/* Thermal Barcode Labels */}
        <button
          type="button"
          onClick={onOpenLabelModal}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          title="Print Thermal Barcode Stickers"
        >
          <Tag className="h-4 w-4 text-gray-600" />
          <span className="hidden sm:inline">Labels</span>
        </button>

        {/* Shift Drawer & Cash Reconciliation */}
        <button
          type="button"
          onClick={onOpenShiftModal}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          title="Register Shift & Cash Drawer"
        >
          <CircleDollarSign className="h-4 w-4 text-emerald-600" />
          <span className="hidden sm:inline">Shift</span>
        </button>

        <div className="h-6 w-px bg-gray-200" />

        {/* Cashier Badge */}
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          <span className="font-semibold text-gray-800">{cashierName}</span>
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
          title="Toggle Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </button>

        {/* Lock / Switch PIN */}
        <button
          type="button"
          onClick={onLockTerminal}
          className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
          title="Lock Terminal"
        >
          <Lock className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
