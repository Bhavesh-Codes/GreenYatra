'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function FinalCtaSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5DED3]">
      {/* Section Header */}
      <div className="max-w-2xl mx-auto text-center space-y-2.5 mb-10">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#131F17] tracking-tight">
          Choose your side of the ecosystem.
        </h2>
        <p className="text-sm text-[#5A6B5F] leading-relaxed">
          Immediate, auditable tools for conscious travelers and sustainability-minded operators.
        </p>
      </div>

      {/* Dual CTA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* Card 1: Traveler Path */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2D6A4F] bg-[#EAF3ED] px-2.5 py-0.5 rounded border border-[#C2DEC9]">
                Travelers
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#131F17]">
              Plan a lower-carbon journey
            </h3>

            <p className="text-xs sm:text-sm text-[#5A6B5F] leading-relaxed">
              Compare real emissions across viable transit modes and book accessible stays ranked by verified Green Score.
            </p>

            <ul className="space-y-2 text-xs text-[#131F17] pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" aria-hidden="true" />
                <span>Certified Climatiq GHG factors &amp; step-free accessibility filters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" aria-hidden="true" />
                <span>In-stay Eco-Points redeemable for dining &amp; late checkout</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#E5DED3]">
            <Link
              href="/traveler"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#245838] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Launch Trip Planner</span>
            </Link>
            <div className="text-center">
              <Link
                href="/auth/traveler"
                className="text-[11px] text-[#5A6B5F] hover:text-[#131F17] underline underline-offset-4"
              >
                Sign in to traveler account
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Hotel Operator Path */}
        <div className="bg-[#131F17] text-white rounded-2xl border border-[#25382B] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C2DEC9] bg-[#1A281E] px-2.5 py-0.5 rounded border border-[#25382B]">
                Hotel Operators
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#FAF7F2]">
              Onboard your property
            </h3>

            <p className="text-xs sm:text-sm text-[#9BB1A3] leading-relaxed">
              Complete the 15-minute baseline audit to receive your Green Score, track utility telemetry, and earn direct booking lift.
            </p>

            <ul className="space-y-2 text-xs text-[#EAF3ED] pt-1">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" aria-hidden="true" />
                <span>Audited 0&ndash;100 index visible in traveler search</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" aria-hidden="true" />
                <span>+254% net ROI from guest energy &amp; laundry conservation</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#25382B]">
            <Link
              href="/hotel/onboard"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FAF7F2] hover:bg-white text-[#131F17] text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Building2 className="w-4 h-4 text-[#2D6A4F]" aria-hidden="true" />
              <span>Begin Hotel Onboarding</span>
            </Link>
            <div className="text-center">
              <Link
                href="/auth/hotel"
                className="text-[11px] text-[#9BB1A3] hover:text-white underline underline-offset-4"
              >
                Access Operator Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
