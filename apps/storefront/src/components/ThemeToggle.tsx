'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm transition-all ${
        theme === 'dark'
          ? 'bg-slate-900 text-amber-400 hover:bg-slate-800 hover:text-amber-300'
          : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12 text-slate-700" />
      )}
    </button>
  );
}
