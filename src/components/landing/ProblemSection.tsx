'use client';

import React from 'react';
import {
  ShieldAlert,
  HelpCircle,
  TrendingDown,
  Gauge,
  EyeOff,
  Coins,
  ArrowDownUp
} from 'lucide-react';

export default function ProblemSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5DED3]">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DED3] text-[#5A6B5F] text-xs font-mono">
          <ArrowDownUp className="w-3.5 h-3.5 text-[#2D6A4F]" aria-hidden="true" />
          <span>The Two-Sided Market Failure</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#131F17] tracking-tight leading-[1.15]">
          Why &ldquo;Eco-Tourism&rdquo; broke for both travelers and hotels.
        </h2>

        <p className="text-base sm:text-lg text-[#3F4E44] leading-relaxed">
          Traditional booking portals treat sustainability as marketing collateral: self-declared
          badges with zero operational data. Meanwhile, hotel operators get zero commercial
          reward for expensive utility upgrades.
        </p>
      </div>

      {/* Side-by-Side Comparison Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* Left: Traveler Pain Panel (Sand Paper Surface) */}
        <div className="bg-white rounded-2xl border border-[#E5DED3] p-6 sm:p-8 space-y-6 shadow-xs relative">
          <div className="flex items-center justify-between border-b border-[#E5DED3] pb-4">
            <div>
              <span className="text-xs font-mono text-[#5A6B5F] uppercase tracking-wider block">
                Side 01 &bull; Traveler Reality
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#131F17] mt-1">
                The Greenwash Wall &amp; Accessibility Blindspot
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5DED3] flex items-center justify-center text-[#9A5B32] shrink-0">
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Pain Point 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAF0E8] text-[#7C3E1D] border border-[#E4C7B5] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-[#131F17]">
                  Self-declared &ldquo;eco badges&rdquo; with zero data
                </h4>
                <p className="text-xs text-[#5A6B5F] leading-relaxed">
                  Hotels display green badges without publishing verified kWh, water, or waste metrics — hiding real impact behind marketing.
                </p>
              </div>
            </div>

            {/* Pain Point 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAF0E8] text-[#7C3E1D] border border-[#E4C7B5] flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-[#131F17]">
                  Accessibility remains an unverified guess
                </h4>
                <p className="text-xs text-[#5A6B5F] leading-relaxed">
                  Travelers with mobility or sensory needs must call hotels manually because booking sites rely on unvetted checkboxes.
                </p>
              </div>
            </div>

            {/* Pain Point 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAF0E8] text-[#7C3E1D] border border-[#E4C7B5] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingDown className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-[#131F17]">
                  Fragmented transit hides real carbon
                </h4>
                <p className="text-xs text-[#5A6B5F] leading-relaxed">
                  Flight, rail, and road options live on disconnected sites, making it impossible to compare emissions for your journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hotel Operator Pain Panel (Deep Forest Ink Surface) */}
        <div className="bg-[#131F17] text-white rounded-2xl border border-[#25382B] p-6 sm:p-8 space-y-6 shadow-xs relative">
          <div className="flex items-center justify-between border-b border-[#25382B] pb-4">
            <div>
              <span className="text-xs font-mono text-[#9BB1A3] uppercase tracking-wider block">
                Side 02 &bull; Hotel Operator Reality
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#FAF7F2] mt-1">
                Unmonitored Waste &amp; Broken Incentives
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1A281E] border border-[#25382B] flex items-center justify-center text-[#C88A1F] shrink-0">
              <Gauge className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Pain Point 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#223528] text-[#C2DEC9] border border-[#25382B] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingDown className="w-4 h-4 text-[#E08A1E]" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-[#FAF7F2]">
                  Utility leaks stay invisible until month-end
                </h4>
                <p className="text-xs text-[#9BB1A3] leading-relaxed">
                  Chiller faults, cooling tower leaks, and kitchen spoilage run undetected without automated telemetry anomaly alerts.
                </p>
              </div>
            </div>

            {/* Pain Point 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#223528] text-[#C2DEC9] border border-[#25382B] flex items-center justify-center shrink-0 mt-0.5">
                <Gauge className="w-4 h-4 text-[#2D6A4F]" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-[#FAF7F2]">
                  CapEx upgrades yield zero booking lift
                </h4>
                <p className="text-xs text-[#9BB1A3] leading-relaxed">
                  Installing solar or greywater systems gets zero rank advantage on OTAs over inefficient, high-emission competitors.
                </p>
              </div>
            </div>

            {/* Pain Point 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#223528] text-[#C2DEC9] border border-[#25382B] flex items-center justify-center shrink-0 mt-0.5">
                <Coins className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-[#FAF7F2]">
                  Loyalty programs subsidize overconsumption
                </h4>
                <p className="text-xs text-[#9BB1A3] leading-relaxed">
                  Points systems reward spending on wasteful amenities with zero mechanism to reward guests who conserve linen or AC.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Unified Solution Callout */}
      <div className="mt-10 bg-[#FAF7F2] rounded-2xl border border-[#E5DED3] p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
        <div className="space-y-1 max-w-3xl">
          <span className="text-xs font-mono font-semibold text-[#2D6A4F] uppercase tracking-wider">
            The GreenYatra Solution
          </span>
          <h4 className="font-serif text-xl font-semibold text-[#131F17]">
            One live number connecting both sides of the market.
          </h4>
          <p className="text-xs text-[#5A6B5F] leading-relaxed">
            The Green Score is an auditable 0&ndash;100 index computed from live utility telemetry, AI engineering actions, and guest in-stay conservation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="text-center px-4 py-3 bg-white rounded-xl border border-[#E5DED3]">
            <span className="text-[10px] font-mono text-[#7A8A7F] block">Traveler Gets</span>
            <span className="text-xs font-semibold text-[#131F17]">Audited Transparency</span>
          </div>
          <span className="text-[#2D6A4F] font-mono font-bold hidden sm:inline">&harr;</span>
          <div className="text-center px-4 py-3 bg-white rounded-xl border border-[#E5DED3]">
            <span className="text-[10px] font-mono text-[#7A8A7F] block">Hotel Gets</span>
            <span className="text-xs font-semibold text-[#131F17]">Direct Booking Lift &amp; ROI</span>
          </div>
        </div>
      </div>
    </section>
  );
}
