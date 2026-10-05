import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

interface ReviewItem {
  author: string;
  role?: string;
  verified?: boolean;
  quote: string;
}

interface TestimonialsBlockProps {
  settings: {
    title?: string;
    subtitle?: string;
    ratingScore?: string;
    reviews?: ReviewItem[];
  };
}

export function TestimonialsBlock({ settings }: TestimonialsBlockProps) {
  const {
    title = "LET'S SEE WHAT PATRONS TALK ABOUT US",
    subtitle = 'Over 1,200+ Verified 5-Star Reviews across Bangladesh',
    ratingScore = '5.00',
    reviews,
  } = settings || {};

  const defaultReviews: ReviewItem[] = [
    {
      author: 'Tanvir Ahmed',
      role: 'Dhanmondi, Dhaka',
      verified: true,
      quote:
        'The fabric quality of the Bespoke Silk Panjabi is unmatched. Truly royal craftsmanship with exquisite stitch work.',
    },
    {
      author: 'Dr. K. Rahman',
      role: 'Gulshan, Dhaka',
      verified: true,
      quote:
        'Impeccable cut and finish. The doorstep exchange was seamless within 24 hours. Duelux is my go-to luxury atelier.',
    },
    {
      author: 'S. Chowdhury',
      role: 'Chattogram',
      verified: true,
      quote:
        'Exceeded all expectations. The collar firmness and mother-of-pearl buttons are Savile Row quality. Worth every taka.',
    },
  ];

  const items = reviews && reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section className="py-20 bg-luxury-950 text-white border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          {/* Star Rating Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-400 mb-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span>{ratingScore} Rated Patron Satisfaction</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-xs sm:text-sm text-gray-400">{subtitle}</p>
          )}
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((rev, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col justify-between hover:border-amber-500/30 transition shadow-xl"
            >
              <Quote className="h-8 w-8 text-amber-500/30 mb-4" />

              <p className="text-sm text-gray-200 leading-relaxed italic mb-8">
                "{rev.quote}"
              </p>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <h4 className="text-sm font-black text-white">{rev.author}</h4>
                  {rev.role && (
                    <span className="text-xs text-gray-400">{rev.role}</span>
                  )}
                </div>

                {rev.verified !== false && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
