'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Coins,
  Receipt
} from 'lucide-react';

export default function RoiSection() {
  // Interactive parameters
  const [roomCount, setRoomCount] = useState<number>(100);
  const [occupancyRate, setOccupancyRate] = useState<number>(72);
  const [participationRate, setParticipationRate] = useState<number>(65);

  // Unit Economics Constants (Auditable assumptions)
  const HOUSEKEEPING_SAVING_PER_DAY = 280; // ₹ in labor, laundry chemicals, water & linen wear
  const HVAC_SAVING_PER_DAY = 145;         // ₹ in AC electricity at 24°C vs 18°C (3.2 kWh @ ₹9.5/kWh)
  const VOUCHER_COGS_PER_DAY = 120;        // ₹ cost-of-goods to hotel for beverage/bakery perk

  // Computations
  const totalRoomNightsPerMonth = Math.round(roomCount * 30 * (occupancyRate / 100));
  const participatingNights = Math.round(totalRoomNightsPerMonth * (participationRate / 100));

  const grossHousekeepingSavings = participatingNights * HOUSEKEEPING_SAVING_PER_DAY;
  const grossHvacSavings = participatingNights * HVAC_SAVING_PER_DAY;
  const totalGrossSavings = grossHousekeepingSavings + grossHvacSavings;

  const totalRewardCost = participatingNights * VOUCHER_COGS_PER_DAY;
  const netMonthlyProfit = totalGrossSavings - totalRewardCost;
  const roiMultiplier = Math.round((netMonthlyProfit / totalRewardCost) * 100);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5DED3]">
      {/* Section Header */}
      <div className="max-w-2xl mx-auto text-center space-y-2.5 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DED3] text-[#5A6B5F] text-xs font-mono">
          <TrendingUp className="w-3.5 h-3.5 text-[#2D6A4F]" aria-hidden="true" />
          <span>Provable Loyalty ROI</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-[#131F17] tracking-tight">
          A loyalty program that pays for itself.
        </h2>

        <p className="text-sm text-[#5A6B5F] leading-relaxed">
          Guest rewards are funded directly from measured laundry and HVAC savings &mdash; turning sustainability into a net profit center.
        </p>
      </div>

      {/* Interactive ROI Calculator Card */}
      <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-lg shadow-[#131F17]/5 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-[#131F17] text-white px-5 sm:px-7 py-3.5 flex items-center justify-between border-b border-[#25382B]">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
            <h3 className="text-xs sm:text-sm font-semibold font-mono tracking-wide uppercase text-[#FAF7F2]">
              Property ROI Simulation
            </h3>
          </div>
          <span className="text-xs font-mono text-[#9BB1A3]">
            FHRAI hospitality benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5DED3]">
          {/* Left: Interactive Input Sliders (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-7 space-y-5 bg-[#FAF7F2]">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-lg font-bold text-[#131F17]">
                Model Your Property
              </h4>
              <span className="text-[11px] font-mono text-[#5A6B5F]">
                {totalRoomNightsPerMonth.toLocaleString('en-IN')} room-nights/mo
              </span>
            </div>

            {/* Slider 1: Room Count */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#E5DED3]">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="room-slider" className="font-medium text-[#131F17]">
                  Total Rooms
                </label>
                <span className="font-mono font-bold text-[#131F17] tabular-nums">
                  {roomCount}
                </span>
              </div>
              <input
                id="room-slider"
                type="range"
                min={30}
                max={300}
                step={10}
                value={roomCount}
                onChange={(e) => setRoomCount(Number(e.target.value))}
                className="w-full accent-[#2D6A4F] cursor-pointer"
              />
            </div>

            {/* Slider 2: Occupancy Rate */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#E5DED3]">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="occupancy-slider" className="font-medium text-[#131F17]">
                  Occupancy Rate
                </label>
                <span className="font-mono font-bold text-[#131F17] tabular-nums">
                  {occupancyRate}%
                </span>
              </div>
              <input
                id="occupancy-slider"
                type="range"
                min={40}
                max={95}
                step={1}
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(Number(e.target.value))}
                className="w-full accent-[#2D6A4F] cursor-pointer"
              />
            </div>

            {/* Slider 3: Guest Participation */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#E5DED3]">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="participation-slider" className="font-medium text-[#131F17]">
                  Guest Participation
                </label>
                <span className="font-mono font-bold text-[#2D6A4F] tabular-nums">
                  {participationRate}%
                </span>
              </div>
              <input
                id="participation-slider"
                type="range"
                min={20}
                max={90}
                step={5}
                value={participationRate}
                onChange={(e) => setParticipationRate(Number(e.target.value))}
                className="w-full accent-[#2D6A4F] cursor-pointer"
              />
            </div>

            <div className="text-[11px] text-[#5A6B5F] font-mono">
              Participating guest nights:{' '}
              <span className="text-[#2D6A4F] font-bold tabular-nums">
                {participatingNights.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Right: Net Financial Readout (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5DED3] pb-3">
                <h4 className="font-serif text-lg font-bold text-[#131F17]">
                  Monthly Net Outcome
                </h4>
                <span className="text-xs font-mono font-bold text-[#2D6A4F] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#C2DEC9]">
                  +{roiMultiplier}% Net ROI
                </span>
              </div>

              {/* Big Profit Box */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#C2DEC9]">
                <span className="text-[11px] font-mono uppercase text-[#5A6B5F] block">
                  Net Monthly Profit to Hotel
                </span>
                <div className="text-3xl font-mono font-black text-[#131F17] tabular-nums mt-0.5">
                  +₹{netMonthlyProfit.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-[#5A6B5F]">/ month</span>
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E5DED3]">
                  <span>Housekeeping skipped (laundry, chemicals &amp; labor @ ₹280/day)</span>
                  <span className="font-mono font-bold text-[#2D6A4F] tabular-nums">
                    +₹{grossHousekeepingSavings.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E5DED3]">
                  <span>Thermostat 24&deg;C hold (HVAC electricity saved @ ₹145/day)</span>
                  <span className="font-mono font-bold text-[#2D6A4F] tabular-nums">
                    +₹{grossHvacSavings.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF0E8] border border-[#E4C7B5]">
                  <span className="text-[#7C3E1D]">Less: Cost of redeemed perks (wholesale COGS @ ₹120)</span>
                  <span className="font-mono font-bold text-[#9A5B32] tabular-nums">
                    -₹{totalRewardCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Concise Assumption Footer */}
            <div className="pt-3 border-t border-[#E5DED3] text-[11px] text-[#7A8A7F] flex items-center gap-1.5 font-mono">
              <Receipt className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" aria-hidden="true" />
              <span>Assumptions: ₹280 laundry/labor + ₹145 HVAC savings vs ₹120 wholesale perk cost per opt-in room.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
