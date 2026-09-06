'use client';

import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  Award,
  ShieldCheck,
  Building,
  Zap,
  CheckSquare
} from 'lucide-react';

interface HotelExample {
  id: string;
  name: string;
  location: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  resourcePts: number;
  recoPts: number;
  guestPts: number;
  accessPts: number;
  auditNotes: {
    resource: string;
    reco: string;
    guest: string;
    access: string;
  };
}

const EXAMPLES: HotelExample[] = [
  {
    id: 'gold-example',
    name: 'Evolve Back Kuruba Safari Lodge',
    location: 'Kabini, Karnataka',
    tier: 'Gold',
    resourcePts: 38,
    recoPts: 28,
    guestPts: 18,
    accessPts: 9,
    auditNotes: {
      resource: 'Micro-hydro & 82% solar power, 0% single-use plastic, on-site sewage reed bed treating 100% greywater.',
      reco: '14 of 15 Gemini AI energy actions verified complete (chiller setpoint retuning, kitchen induction swap).',
      guest: '84% of checked-in guests opted into Stay Mode linen reuse and 24°C thermostat hold.',
      access: 'Step-free safari boardwalks, tactile room markers, emergency visual strobe annunciators in all suites.'
    }
  },
  {
    id: 'silver-example',
    name: 'Wildflower Ridge Eco-Lodge',
    location: 'Mashobra, Himachal Pradesh',
    tier: 'Silver',
    resourcePts: 31,
    recoPts: 22,
    guestPts: 14,
    accessPts: 9,
    auditNotes: {
      resource: 'Pellet biomass boiler, dual-flush fixtures installed across all 48 guestrooms, regional peer benchmark: -18% power.',
      reco: '8 of 11 recommended actions verified (insulation upgrades and water pressure reducers installed).',
      guest: '62% guest participation in towel reuse program earning local orchard cider vouchers.',
      access: 'Ramped main lodge entryway, zero-threshold bathrooms, accessible dining lounge.'
    }
  },
  {
    id: 'bronze-example',
    name: 'Heritage Coorg Plantation Estate',
    location: 'Madikeri, Western Ghats',
    tier: 'Bronze',
    resourcePts: 23,
    recoPts: 15,
    guestPts: 10,
    accessPts: 8,
    auditNotes: {
      resource: 'Spring water gravity feeds, baseline municipal power connection with diesel backup generator.',
      reco: '4 of 9 initial recommendations complete (LED relamping complete; solar water heating in progress).',
      guest: '38% guest participation in optional conservation toggles.',
      access: 'Ground-floor accessible verandah room with grab bars and wheelchair ramp.'
    }
  }
];

export default function ScoreFormulaSection() {
  const [selectedExample, setSelectedExample] = useState<HotelExample>(EXAMPLES[0]);

  const totalScore =
    selectedExample.resourcePts +
    selectedExample.recoPts +
    selectedExample.guestPts +
    selectedExample.accessPts;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return {
          pill: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
          text: 'text-[#D97706]',
          border: 'border-[#FDE68A]'
        };
      case 'Silver':
        return {
          pill: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
          text: 'text-[#5A6B7C]',
          border: 'border-[#CBD5E1]'
        };
      case 'Bronze':
        return {
          pill: 'bg-[#FAF0E8] text-[#7C3E1D] border-[#E4C7B5]',
          text: 'text-[#9A5B32]',
          border: 'border-[#E4C7B5]'
        };
      default:
        return {
          pill: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]',
          text: 'text-[#6B7280]',
          border: 'border-[#E5E7EB]'
        };
    }
  };

  const activeColor = getTierColor(selectedExample.tier);

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E5DED3]">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#C2DEC9] text-[#2D6A4F] text-xs font-mono">
          <Calculator className="w-3.5 h-3.5 text-[#2D6A4F]" aria-hidden="true" />
          <span>Auditable Mathematical Formula</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#131F17] tracking-tight leading-[1.15]">
          The Green Score is never a black box.
        </h2>

        <p className="text-base sm:text-lg text-[#3F4E44] leading-relaxed">
          Every score on GreenYatra is computed from four transparent, audited components with
          strict mathematical weights. No self-awarded certificates, no pay-to-win badges.
        </p>
      </div>

      {/* Prominent Formula Bar */}
      <div className="bg-[#131F17] text-white rounded-2xl border border-[#25382B] p-6 sm:p-8 mb-12 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#25382B] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9BB1A3]">
              The Core Governing Equation
            </span>
          </div>
          <span className="text-xs font-mono text-[#C2DEC9]">
            Audited 100-Point Index
          </span>
        </div>

        {/* Large Equation Readout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center sm:text-left">
          {/* Term 1 */}
          <div className="p-4 rounded-xl bg-[#1A281E] border border-[#25382B] space-y-1.5">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#2D6A4F] tabular-nums">
              40%
            </div>
            <div className="text-sm font-semibold text-[#FAF7F2]">Resource Efficiency</div>
            <p className="text-xs text-[#9BB1A3] leading-normal">
              Baseline audit + live 90-day usage (kWh, water, food waste) vs regional peer benchmark.
            </p>
          </div>

          {/* Term 2 */}
          <div className="p-4 rounded-xl bg-[#1A281E] border border-[#25382B] space-y-1.5">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#C2DEC9] tabular-nums">
              30%
            </div>
            <div className="text-sm font-semibold text-[#FAF7F2]">AI Recommendations</div>
            <p className="text-xs text-[#9BB1A3] leading-normal">
              Verified completed engineering interventions &divide; total AI recommendations suggested.
            </p>
          </div>

          {/* Term 3 */}
          <div className="p-4 rounded-xl bg-[#1A281E] border border-[#25382B] space-y-1.5">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#D97706] tabular-nums">
              20%
            </div>
            <div className="text-sm font-semibold text-[#FAF7F2]">Guest Stay Behavior</div>
            <p className="text-xs text-[#9BB1A3] leading-normal">
              % of checked-in guests opting into linen reuse &amp; thermostat moderation &times; savings achieved.
            </p>
          </div>

          {/* Term 4 */}
          <div className="p-4 rounded-xl bg-[#1A281E] border border-[#25382B] space-y-1.5">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#9BB1A3] tabular-nums">
              10%
            </div>
            <div className="text-sm font-semibold text-[#FAF7F2]">Accessibility Baseline</div>
            <p className="text-xs text-[#9BB1A3] leading-normal">
              Completion of universal accessibility audit (step-free path, tactile &amp; sensory accommodations).
            </p>
          </div>
        </div>
      </div>

      {/* Tier Thresholds Row */}
      <div className="mb-12 bg-white rounded-2xl border border-[#E5DED3] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DED3] pb-4 mb-5">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#131F17]">
              Four Clearly Defined Tiers
            </h3>
            <p className="text-xs text-[#5A6B5F]">
              Every tier has deterministic criteria. Hotels cannot jump tiers without verified data.
            </p>
          </div>
          <span className="text-xs font-mono text-[#2D6A4F] bg-[#EAF3ED] px-2.5 py-1 rounded border border-[#C2DEC9] self-start sm:self-auto">
            Zero Discretionary Overrides
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* None */}
          <div className="p-4 rounded-xl border border-[#E5DED3] bg-[#FAF7F2] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#6B7280]">0 &ndash; 40 pts</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E5E7EB] text-[#4B5563]">
                Getting Started
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#131F17]">No Badge / Baseline</h4>
            <p className="text-xs text-[#5A6B5F] leading-relaxed">
              New property completing onboarding audit; usage monitoring yet to stream.
            </p>
          </div>

          {/* Bronze */}
          <div className="p-4 rounded-xl border border-[#E4C7B5] bg-[#FAF0E8] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#7C3E1D]">41 &ndash; 70 pts</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E4C7B5] text-[#7C3E1D]">
                Bronze Tier
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#131F17]">Verified Baseline</h4>
            <p className="text-xs text-[#5A6B5F] leading-relaxed">
              Active telemetry streaming, baseline audit certified, initial AI actions begun.
            </p>
          </div>

          {/* Silver */}
          <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F1F5F9] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#334155]">71 &ndash; 90 pts</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#CBD5E1] text-[#334155]">
                Silver Tier
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#131F17]">Demonstrated Reductions</h4>
            <p className="text-xs text-[#5A6B5F] leading-relaxed">
              Statistically significant reductions vs peers, majority AI recommendations complete.
            </p>
          </div>

          {/* Gold */}
          <div className="p-4 rounded-xl border border-[#FDE68A] bg-[#FEF3C7] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#92400E]">91 &ndash; 100 pts</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FDE68A] text-[#92400E]">
                Gold Tier
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#131F17]">Top Decile Circularity</h4>
            <p className="text-xs text-[#5A6B5F] leading-relaxed">
              Renewable microgrids, circular waste recovery, and &gt;80% guest eco-engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Worked Examples Across 3 Hotels */}
      <div className="bg-white rounded-2xl border border-[#E5DED3] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DED3] pb-4">
          <div>
            <span className="text-xs font-mono text-[#5A6B5F] uppercase tracking-wider block">
              Auditable Telemetry Inspector
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#131F17] mt-0.5">
              Inspect Worked Examples Across Different Tiers
            </h3>
          </div>

          {/* Example Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#E5DED3] self-start sm:self-auto">
            {EXAMPLES.map((ex) => {
              const isActive = ex.id === selectedExample.id;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExample(ex)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:outline-none ${
                    isActive
                      ? 'bg-[#131F17] text-white font-bold shadow-xs'
                      : 'text-[#5A6B5F] hover:text-[#131F17] hover:bg-white'
                  }`}
                >
                  {ex.tier} ({ex.resourcePts + ex.recoPts + ex.guestPts + ex.accessPts} pts)
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Hotel Card & Formula Proof */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Summary Box (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF7F2] rounded-xl border border-[#E5DED3] p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-[#5A6B5F] block">{selectedExample.location}</span>
                <h4 className="font-serif text-lg font-bold text-[#131F17]">{selectedExample.name}</h4>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border font-mono ${activeColor.pill}`}>
                {selectedExample.tier} Tier
              </span>
            </div>

            {/* Big Math Sum Callout */}
            <div className="p-4 bg-white rounded-xl border border-[#E5DED3] space-y-2">
              <span className="text-[11px] font-mono text-[#5A6B5F] uppercase block">
                Verification Proof
              </span>
              <div className="text-2xl font-mono font-black text-[#131F17] tabular-nums">
                {selectedExample.resourcePts}{' '}
                <span className="text-sm font-normal text-[#5A6B5F]">+</span>{' '}
                {selectedExample.recoPts}{' '}
                <span className="text-sm font-normal text-[#5A6B5F]">+</span>{' '}
                {selectedExample.guestPts}{' '}
                <span className="text-sm font-normal text-[#5A6B5F]">+</span>{' '}
                {selectedExample.accessPts}{' '}
                <span className="text-sm font-normal text-[#5A6B5F]">=</span>{' '}
                <span className={activeColor.text}>{totalScore} / 100</span>
              </div>
              <p className="text-xs text-[#5A6B5F] pt-1 border-t border-[#E5DED3]">
                Every component is backed by real utility telemetry and logged verification.
              </p>
            </div>
          </div>

          {/* Right Sub-score breakdown list (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* 1. Resource */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E5DED3] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131F17]">Resource Efficiency (40% Weight)</span>
                <span className="font-mono font-bold tabular-nums text-[#2D6A4F]">
                  {selectedExample.resourcePts} / 40 pts
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 overflow-hidden border border-[#E5DED3]">
                <div
                  className="bg-[#2D6A4F] h-full rounded-full"
                  style={{ width: `${(selectedExample.resourcePts / 40) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#5A6B5F] pt-0.5">{selectedExample.auditNotes.resource}</p>
            </div>

            {/* 2. Recommendations */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E5DED3] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131F17]">Recommendation Completion (30% Weight)</span>
                <span className="font-mono font-bold tabular-nums text-[#2D6A4F]">
                  {selectedExample.recoPts} / 30 pts
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 overflow-hidden border border-[#E5DED3]">
                <div
                  className="bg-[#2D6A4F] h-full rounded-full"
                  style={{ width: `${(selectedExample.recoPts / 30) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#5A6B5F] pt-0.5">{selectedExample.auditNotes.reco}</p>
            </div>

            {/* 3. Guest Behavior */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E5DED3] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131F17]">Guest In-Stay Behavior (20% Weight)</span>
                <span className="font-mono font-bold tabular-nums text-[#2D6A4F]">
                  {selectedExample.guestPts} / 20 pts
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 overflow-hidden border border-[#E5DED3]">
                <div
                  className="bg-[#2D6A4F] h-full rounded-full"
                  style={{ width: `${(selectedExample.guestPts / 20) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#5A6B5F] pt-0.5">{selectedExample.auditNotes.guest}</p>
            </div>

            {/* 4. Accessibility */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E5DED3] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131F17]">Accessibility Baseline (10% Weight)</span>
                <span className="font-mono font-bold tabular-nums text-[#2D6A4F]">
                  {selectedExample.accessPts} / 10 pts
                </span>
              </div>
              <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 overflow-hidden border border-[#E5DED3]">
                <div
                  className="bg-[#2D6A4F] h-full rounded-full"
                  style={{ width: `${(selectedExample.accessPts / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#5A6B5F] pt-0.5">{selectedExample.auditNotes.access}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
