import React from 'react';
import { Store, ShieldCheck, Tag, CircleDollarSign, Lock, Maximize } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

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
  const { t } = useLanguage();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 shadow-sm transition-colors">
      {/* Brand & Outlet Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-black text-white shadow-md shadow-brand-500/20">
            DX
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
              {t('brand_name')} POS
            </h1>
            <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-400 tracking-wider">
              {t('pos_terminal_title')}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800" />

        <div className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300">
          <Store className="h-3.5 w-3.5 text-gray-500 dark:text-slate-400" />
          <span>{outletName}</span>
          <span className="rounded bg-gray-200 dark:bg-slate-700 px-1.5 py-0.5 font-bold text-gray-800 dark:text-slate-100">
            {registerCode}
          </span>
        </div>
      </div>

      {/* Center Status: Hardware Scanner Listener Active */}
      <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>USB Scanner Interceptor: ACTIVE</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <LanguageToggle className="border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800" />

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Thermal Barcode Labels */}
        <button
          type="button"
          onClick={onOpenLabelModal}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          title="Print Thermal Barcode Stickers"
        >
          <Tag className="h-4 w-4 text-gray-600 dark:text-slate-400" />
          <span className="hidden sm:inline">Labels</span>
        </button>

        {/* Shift Drawer & Cash Reconciliation */}
        <button
          type="button"
          onClick={onOpenShiftModal}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          title="Register Shift & Cash Drawer"
        >
          <CircleDollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">{t('pos_cash_drawer')}</span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800" />

        {/* Cashier Badge */}
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-slate-800 px-3 py-1.5 text-xs">
          <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span className="font-semibold text-gray-800 dark:text-slate-200">{cashierName}</span>
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-lg p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition"
          title="Toggle Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </button>

        {/* Lock / Switch PIN */}
        <button
          type="button"
          onClick={onLockTerminal}
          className="rounded-lg bg-gray-100 dark:bg-slate-800 p-2 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-600 dark:hover:text-red-400 transition"
          title="Lock Terminal"
        >
          <Lock className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

