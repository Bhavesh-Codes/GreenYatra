'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Building2,
  Route,
  Accessibility,
  Coins,
  ClipboardCheck,
  Activity,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

export default function AudienceSplitSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5DED3]">
      {/* Section Header */}
      <div className="max-w-2xl mx-auto text-center space-y-2 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DED3] text-[#5A6B5F] text-xs font-mono">
          <Building2 className="w-3.5 h-3.5 text-[#2D6A4F]" aria-hidden="true" />
          <span>Platform Architecture</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-[#131F17] tracking-tight">
          Two sides. One live standard.
        </h2>

        <p className="text-sm sm:text-base text-[#5A6B5F]">
          A unified ecosystem connecting conscious travelers with high-efficiency hotels.
        </p>
      </div>

      {/* Dual Audience Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* B2C: Traveler Platform */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] p-7 sm:p-8 flex flex-col justify-between space-y-7 shadow-xs">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5DED3] pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#EAF3ED] px-2.5 py-1 rounded border border-[#C2DEC9]">
                  B2C &bull; Traveler App
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#131F17] mt-2">
                  Plan, verify, and earn perks
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] border border-[#C2DEC9] flex items-center justify-center text-[#2D6A4F] shrink-0">
                <Compass className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>

            {/* Visual Feature Tiles */}
            <div className="space-y-3.5">
              {/* Tile 1 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DED3] hover:border-[#C2DEC9] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5DED3] flex items-center justify-center text-[#2D6A4F] shrink-0 mt-0.5 shadow-2xs">
                  <Route className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#131F17]">
                    Multi-Modal Route Planner
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5A6B5F] mt-0.5 leading-relaxed">
                    Compare real distance, fares, and certified Climatiq CO₂e across rail, bus, EV, and flights.
                  </p>
                </div>
              </div>

              {/* Tile 2 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DED3] hover:border-[#C2DEC9] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5DED3] flex items-center justify-center text-[#2D6A4F] shrink-0 mt-0.5 shadow-2xs">
                  <Accessibility className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#131F17]">
                    Universal Accessibility Filters
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5A6B5F] mt-0.5 leading-relaxed">
                    Verified filters for step-free access, wheelchair rooms, and sensory accommodations.
                  </p>
                </div>
              </div>

              {/* Tile 3 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DED3] hover:border-[#C2DEC9] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5DED3] flex items-center justify-center text-[#D97706] shrink-0 mt-0.5 shadow-2xs">
                  <Coins className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#131F17]">
                    In-Stay Eco-Points Wallet
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5A6B5F] mt-0.5 leading-relaxed">
                    Skip daily housekeeping or hold AC at 24&deg;C to earn instant QR vouchers for dining and late checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/traveler"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#2D6A4F] hover:bg-[#245838] text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>Launch Traveler App</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* B2B: Hotel Enterprise OS */}
        <div className="bg-[#131F17] text-white rounded-2xl border border-[#25382B] p-7 sm:p-8 flex flex-col justify-between space-y-7 shadow-xs">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#25382B] pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C2DEC9] bg-[#1A281E] px-2.5 py-1 rounded border border-[#25382B]">
                  B2B &bull; Hotel Enterprise ESG OS
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#FAF7F2] mt-2">
                  Audit, optimize, and monetize
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#1A281E] border border-[#25382B] flex items-center justify-center text-[#2D6A4F] shrink-0">
                <Building2 className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>

            {/* Visual Feature Tiles */}
            <div className="space-y-3.5">
              {/* Tile 1 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-[#1A281E] border border-[#25382B] hover:border-[#2D6A4F]/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#223528] border border-[#25382B] flex items-center justify-center text-[#C2DEC9] shrink-0 mt-0.5 shadow-2xs">
                  <ClipboardCheck className="w-5 h-5 text-[#2D6A4F]" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#FAF7F2]">
                    15-Minute Baseline ESG Audit
                  </h4>
                  <p className="text-xs sm:text-sm text-[#9BB1A3] mt-0.5 leading-relaxed">
                    Evaluate HVAC efficiency, solar %, greywater, and accessibility to generate your starting Green Score.
                  </p>
                </div>
              </div>

              {/* Tile 2 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-[#1A281E] border border-[#25382B] hover:border-[#2D6A4F]/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#223528] border border-[#25382B] flex items-center justify-center text-[#C2DEC9] shrink-0 mt-0.5 shadow-2xs">
                  <Activity className="w-5 h-5 text-[#2D6A4F]" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#FAF7F2]">
                    90-Day Telemetry &amp; Anomaly Alerts
                  </h4>
                  <p className="text-xs sm:text-sm text-[#9BB1A3] mt-0.5 leading-relaxed">
                    Automated tracking of power (kWh), water (liters), and waste flags chiller leaks before monthly bills arrive.
                  </p>
                </div>
              </div>

              {/* Tile 3 */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-[#1A281E] border border-[#25382B] hover:border-[#2D6A4F]/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#223528] border border-[#25382B] flex items-center justify-center text-[#D97706] shrink-0 mt-0.5 shadow-2xs">
                  <TrendingUp className="w-5 h-5 text-[#D97706]" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#FAF7F2]">
                    Profitable Loyalty (+254% Net ROI)
                  </h4>
                  <p className="text-xs sm:text-sm text-[#9BB1A3] mt-0.5 leading-relaxed">
                    Guest conservation generates ₹428K/mo in net utility savings after paying out all reward perks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/hotel/onboard"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#FAF7F2] hover:bg-white text-[#131F17] text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>Onboard Property or Sign In</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
