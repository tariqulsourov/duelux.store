'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-xl p-0.5 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm text-xs font-bold transition-all ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg transition-all ${
          language === 'en'
            ? 'bg-brand-600 text-white shadow-sm font-black'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2.5 py-1 rounded-lg transition-all font-bengali ${
          language === 'bn'
            ? 'bg-brand-600 text-white shadow-sm font-black'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="বাংলা ভাষায় পরিবর্তন করুন"
      >
        বাং
      </button>
    </div>
  );
}
