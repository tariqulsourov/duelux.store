import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { PlaceholderImage } from './PlaceholderImage';

interface StoreLocatorBlockProps {
  settings: {
    badgeText?: string;
    title?: string;
    subtitle?: string;
    address?: string;
    hours?: string;
    phone?: string;
    buttonText?: string;
    imageUrl?: string | null;
  };
}

export function StoreLocatorBlock({ settings }: StoreLocatorBlockProps) {
  const {
    badgeText = 'Flagship Atelier',
    title = 'VISIT OUR FLAGSHIP BOUTIQUE',
    subtitle = 'Experience private styling, handloom swatches, and bespoke collar tailoring.',
    address = 'House 42, Road 11, Dhanmondi, Dhaka 1209',
    hours = 'Open Daily: 10:00 AM – 10:00 PM',
    phone = '+880 1700-000000',
    buttonText = 'Get Google Maps Directions',
    imageUrl,
  } = settings || {};

  return (
    <section id="locator" className="py-20 bg-black text-white border-b border-amber-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Info Card (col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
              {badgeText}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xl">
              {subtitle}
            </p>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Address
                  </h4>
                  <p className="text-sm font-black text-white mt-0.5">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Visiting Hours
                  </h4>
                  <p className="text-sm font-black text-white mt-0.5">{hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Concierge Hotline
                  </h4>
                  <p className="text-sm font-black text-white mt-0.5">{phone}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-gray-100 transition shadow-lg"
              >
                <Navigation className="h-4 w-4 text-luxury-900" />
                <span>{buttonText}</span>
              </a>
            </div>
          </div>

          {/* Showroom Photo Frame (col-span-6) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border-2 border-white/10 aspect-[4/3] bg-luxury-950 shadow-2xl">
              <PlaceholderImage
                src={imageUrl}
                alt={title}
                ratio="portrait"
                suggestedSize="1000 × 750 px Showroom Photo"
                label="Flagship Showroom Exterior"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
