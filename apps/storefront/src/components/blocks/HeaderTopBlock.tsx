import React from 'react';
import Link from 'next/link';
import { Sparkles, PhoneCall, ArrowRight } from 'lucide-react';

interface HeaderTopBlockProps {
  settings: {
    message?: string;
    actionText?: string;
    actionLink?: string;
    theme?: 'gold_black' | 'dark_minimal' | 'emerald_brand' | 'dark_red';
    showHotline?: boolean;
    hotline?: string;
  };
}

export function HeaderTopBlock({ settings }: HeaderTopBlockProps) {
  const {
    message = '✨ Complimentary Express Delivery in Dhaka on Orders Over ৳5,000',
    actionText,
    actionLink = '#products',
    theme = 'gold_black',
    showHotline = true,
    hotline = '+880 1700-000000',
  } = settings || {};

  const themeClasses: Record<string, { bg: string; text: string; accent: string; badge: string }> = {
    gold_black: {
      bg: 'bg-black border-b border-amber-900/40 text-amber-100',
      text: 'text-amber-100/90',
      accent: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    dark_minimal: {
      bg: 'bg-slate-950 border-b border-slate-800 text-slate-200',
      text: 'text-slate-300',
      accent: 'text-white',
      badge: 'bg-white/10 text-white border-white/20',
    },
    emerald_brand: {
      bg: 'bg-emerald-950 border-b border-emerald-900 text-emerald-100',
      text: 'text-emerald-100/90',
      accent: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    dark_red: {
      bg: 'bg-red-950 border-b border-red-900 text-red-100',
      text: 'text-red-100/90',
      accent: 'text-red-400',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.gold_black;

  return (
    <div className={`w-full py-2 px-4 text-xs font-semibold tracking-wide transition-colors ${currentTheme.bg}`}>
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        {/* Main Announcement Message */}
        <div className="flex items-center gap-2 mx-auto lg:mx-0">
          <Sparkles className={`h-3.5 w-3.5 ${currentTheme.accent} shrink-0 animate-pulse`} />
          <span className={currentTheme.text}>{message}</span>
          {actionText && (
            <Link
              href={actionLink}
              className={`inline-flex items-center gap-1 ml-2 rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider transition hover:brightness-125 ${currentTheme.badge}`}
            >
              <span>{actionText}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Hotline / Customer Care */}
        {showHotline && hotline && (
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-gray-300 hover:text-white transition">
            <PhoneCall className={`h-3 w-3 ${currentTheme.accent}`} />
            <span>Hotline: {hotline}</span>
          </div>
        )}
      </div>
    </div>
  );
}
