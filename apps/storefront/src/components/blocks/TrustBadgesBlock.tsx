import React from 'react';
import {
  Award,
  Truck,
  RefreshCw,
  ShieldCheck,
  Check,
  Sparkles,
  Clock,
  CreditCard,
} from 'lucide-react';

interface TrustBadgeItem {
  icon?: string;
  title: string;
  desc: string;
}

interface TrustBadgesBlockProps {
  settings: {
    theme?: 'dark' | 'light';
    badges?: TrustBadgeItem[];
  };
}

export function TrustBadgesBlock({ settings }: TrustBadgesBlockProps) {
  const { theme = 'dark', badges } = settings || {};

  const defaultBadges: TrustBadgeItem[] = [
    { icon: 'Award', title: '100% Authentic Handloom', desc: 'Direct from Tangail & Rajshahi master weavers' },
    { icon: 'Truck', title: 'Express Doorstep Delivery', desc: 'Inside Dhaka in 24 hours & live tracking' },
    { icon: 'RefreshCw', title: '7-Day Easy Exchange', desc: 'Hassle-free doorstep sizing exchange' },
    { icon: 'ShieldCheck', title: 'Zero Counterfeit Guarantee', desc: 'Individually serialized & certified craftsmanship' },
  ];

  const items = badges && badges.length > 0 ? badges : defaultBadges;

  const renderIcon = (iconName?: string) => {
    const props = { className: 'h-5 w-5 text-amber-500' };
    switch (iconName) {
      case 'Award':
        return <Award {...props} />;
      case 'Truck':
        return <Truck {...props} />;
      case 'RefreshCw':
        return <RefreshCw {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      case 'CreditCard':
        return <CreditCard {...props} />;
      case 'Clock':
        return <Clock {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      default:
        return <Check {...props} />;
    }
  };

  const isDark = theme === 'dark';

  return (
    <section
      className={`py-8 border-b ${
        isDark
          ? 'bg-luxury-950 border-white/10 text-white'
          : 'bg-white border-gray-100 text-gray-900'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((badge, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-amber-500/40'
                  : 'bg-luxury-50/40 border-gray-100 hover:border-gray-200'
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 border ${
                  isDark
                    ? 'bg-black/60 border-amber-500/20'
                    : 'bg-white border-gray-200 shadow-xs'
                }`}
              >
                {renderIcon(badge.icon)}
              </div>
              <div>
                <h4 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {badge.title}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
