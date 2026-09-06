'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Navigation,
  Train,
  Bus,
  Plane,
  Car,
  Zap,
  ShieldCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ViableMode {
  id: string;
  name: string;
  category: 'rail' | 'bus' | 'flight' | 'car' | 'ev';
  icon: typeof Train;
  co2eKg: number;
  durationStr: string;
  costInr: number;
  isLowestCarbon: boolean;
  notes: string;
}

interface OmittedMode {
  name: string;
  mode: string;
  reason: string;
}

interface HotelAuditBreakdown {
  id: string;
  name: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  score: number;
  location: string;
  resourceScore: number;      // max 40
  resourceNotes: string;
  recoScore: number;          // max 30
  recoNotes: string;
  guestScore: number;         // max 20
  guestNotes: string;
  accessScore: number;        // max 10
  accessNotes: string;
}

interface RoutePreset {
  id: string;
  label: string;
  origin: string;
  destination: string;
  distanceKm: number;
  modes: ViableMode[];
  omittedMode?: OmittedMode;
  hotel: HotelAuditBreakdown;
}

const PRESETS: RoutePreset[] = [
  {
    id: 'mumbai-goa',
    label: 'Mumbai → Goa',
    origin: 'Mumbai, Bandra West',
    destination: 'Goa, Vagator Beach',
    distanceKm: 587,
    modes: [
      {
        id: 'rail-vb',
        name: 'Electric Vande Bharat Express',
        category: 'rail',
        icon: Train,
        co2eKg: 65,
        durationStr: '8h 20m',
        costInr: 1450,
        isLowestCarbon: true,
        notes: 'Dedicated electric traction on Konkan Railway corridor'
      },
      {
        id: 'bus-ev',
        name: 'Intercity Electric Volvo Sleeper',
        category: 'bus',
        icon: Bus,
        co2eKg: 88,
        durationStr: '12h 40m',
        costInr: 1250,
        isLowestCarbon: false,
        notes: 'Standard NH66 highway route with night charging stop'
      },
      {
        id: 'flight-bom',
        name: 'Commercial Flight (BOM → GOI)',
        category: 'flight',
        icon: Plane,
        co2eKg: 184,
        durationStr: '4h 15m (1h air + gate)',
        costInr: 4850,
        isLowestCarbon: false,
        notes: 'Climatiq LTO + climb GHG factors with radiative forcing'
      },
      {
        id: 'car-petrol',
        name: 'Private Petrol / Diesel Sedan',
        category: 'car',
        icon: Car,
        co2eKg: 248,
        durationStr: '11h 15m',
        costInr: 9800,
        isLowestCarbon: false,
        notes: 'Single passenger occupancy baseline (14.2 km/L avg)'
      }
    ],
    hotel: {
      id: 'h-vagator',
      name: 'Vagator Eco-Sanctuary',
      tier: 'Gold',
      score: 94,
      location: 'North Goa',
      resourceScore: 38,
      resourceNotes: '78% rooftop solar, zero single-use plastic, rainwater retention',
      recoScore: 28,
      recoNotes: '14 of 15 verified energy & HVAC retrofits complete',
      guestScore: 19,
      guestNotes: '86% guest opt-in to Stay Mode linen & AC nudges',
      accessScore: 9,
      accessNotes: 'Step-free beach ramps, accessible villa bathrooms, tactile signage'
    }
  },
  {
    id: 'delhi-manali',
    label: 'Delhi → Manali',
    origin: 'Delhi, Connaught Place',
    destination: 'Manali, Old Manali',
    distanceKm: 538,
    modes: [
      {
        id: 'bus-volvo',
        name: 'Electric Volvo Multi-Axle Bus',
        category: 'bus',
        icon: Bus,
        co2eKg: 72,
        durationStr: '13h 45m',
        costInr: 1650,
        isLowestCarbon: true,
        notes: 'Via Kiratpur-Nerchowk high-efficiency corridor'
      },
      {
        id: 'rail-cab',
        name: 'Vande Bharat to Chandigarh + EV Cab',
        category: 'rail',
        icon: Train,
        co2eKg: 89,
        durationStr: '10h 30m',
        costInr: 2350,
        isLowestCarbon: false,
        notes: 'Electric rail to foothills, electric road leg to valley'
      },
      {
        id: 'car-diesel',
        name: 'Private Diesel SUV (4x4)',
        category: 'car',
        icon: Car,
        co2eKg: 294,
        durationStr: '12h 00m',
        costInr: 11400,
        isLowestCarbon: false,
        notes: 'High-gradient mountain fuel consumption penalty'
      }
    ],
    omittedMode: {
      name: 'Commercial Direct Flight',
      mode: 'Aviation',
      reason: 'No commercial scheduled runway in high-altitude Manali valley. Nearest airport Bhuntar (KUU) has restricted runway limits and no direct commercial service; rail lines terminate at Chandigarh. GreenYatra omits unrealistic flight routes instead of inventing schedules.'
    },
    hotel: {
      id: 'h-solang',
      name: 'Solang Alpine Timber Lodge',
      tier: 'Silver',
      score: 78,
      location: 'Manali, Himachal Pradesh',
      resourceScore: 31,
      resourceNotes: 'Biomass pellet hydronic heating, greywater passive reed bed',
      recoScore: 22,
      recoNotes: '8 of 11 AI-suggested engineering actions verified complete',
      guestScore: 16,
      guestNotes: '68% guest participation in towel reuse and 20°C heat conservation',
      accessScore: 9,
      accessNotes: 'Ramped main lodge, tactile snow-melt pathway, accessible ground suites'
    }
  },
  {
    id: 'bengaluru-coorg',
    label: 'Bengaluru → Coorg',
    origin: 'Bengaluru, Indiranagar',
    destination: 'Coorg, Madikeri',
    distanceKm: 265,
    modes: [
      {
        id: 'ev-shuttle',
        name: 'Shared Intercity EV Shuttle',
        category: 'ev',
        icon: Zap,
        co2eKg: 34,
        durationStr: '5h 30m',
        costInr: 850,
        isLowestCarbon: true,
        notes: 'Direct expressway via Mysuru EV charging corridor'
      },
      {
        id: 'bus-ksrtc',
        name: 'KSRTC Electric Airavat Bus',
        category: 'bus',
        icon: Bus,
        co2eKg: 41,
        durationStr: '6h 15m',
        costInr: 640,
        isLowestCarbon: false,
        notes: 'High-occupancy regional state transport fleet'
      },
      {
        id: 'car-petrol-c',
        name: 'Private Petrol Hatchback',
        category: 'car',
        icon: Car,
        co2eKg: 118,
        durationStr: '5h 00m',
        costInr: 4300,
        isLowestCarbon: false,
        notes: 'Standard road transit across Western Ghats foothills'
      }
    ],
    omittedMode: {
      name: 'Direct Passenger Rail',
      mode: 'Rail',
      reason: 'No railway corridor traverses the steep Western Ghats escarpment into Madikeri; the nearest railhead is Mysuru (120 km away). Direct road EV transit avoids multi-leg transshipment delays.'
    },
    hotel: {
      id: 'h-coorg',
      name: 'Heritage Plantation Bungalow',
      tier: 'Bronze',
      score: 58,
      location: 'Madikeri, Coorg',
      resourceScore: 24,
      resourceNotes: 'Gravity-fed spring water, baseline grid electricity with diesel backup',
      recoScore: 15,
      recoNotes: '4 of 8 efficiency upgrades complete (lighting & solar thermal pending)',
      guestScore: 11,
      guestNotes: '42% guest participation in water conservation program',
      accessScore: 8,
      accessNotes: 'Ground-floor wheelchair access, step-free verandah dining'
    }
  }
];

export default function HeroInteractiveDemo() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('mumbai-goa');
  const [originInput, setOriginInput] = useState<string>(PRESETS[0].origin);
  const [destInput, setDestInput] = useState<string>(PRESETS[0].destination);
  const [activeHotelOverride, setActiveHotelOverride] = useState<HotelAuditBreakdown | null>(null);

  // Animation progression states (0 to 1)
  const [animProgress, setAnimProgress] = useState<number>(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const currentPreset = useMemo(() => {
    return PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
  }, [selectedPresetId]);

  const activeHotel = activeHotelOverride || currentPreset.hotel;

  // Trigger smooth count-up and route drawing on preset change
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimProgress(1);
      return;
    }

    setAnimProgress(0);
    const startTime = performance.now();
    const duration = 850; // ms

    let animFrameId: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(tick);
      }
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [selectedPresetId, activeHotelOverride, prefersReducedMotion]);

  const handleSelectPreset = (preset: RoutePreset) => {
    setSelectedPresetId(preset.id);
    setOriginInput(preset.origin);
    setDestInput(preset.destination);
    setActiveHotelOverride(null);
  };

  // Tier color helpers
  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return {
          badgeBg: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
          accent: '#D97706',
          stroke: '#D97706'
        };
      case 'Silver':
        return {
          badgeBg: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
          accent: '#5A6B7C',
          stroke: '#5A6B7C'
        };
      case 'Bronze':
        return {
          badgeBg: 'bg-[#FAF0E8] text-[#7C3E1D] border-[#E4C7B5]',
          accent: '#9A5B32',
          stroke: '#9A5B32'
        };
      default:
        return {
          badgeBg: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]',
          accent: '#6B7280',
          stroke: '#6B7280'
        };
    }
  };

  const tierColors = getTierBadgeStyle(activeHotel.tier);

  // Gauge calculations for 220 degree arc
  const displayedScore = Math.round(activeHotel.score * animProgress);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  // Use a 220-degree arc: arcLength = circumference * (220 / 360) = circumference * 0.611
  const arcLength = circumference * (220 / 360);
  const strokeDashoffset = arcLength - (arcLength * (displayedScore / 100));

  return (
    <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Hero Statement */}
      <div className="max-w-4xl mx-auto text-center space-y-5 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3ED] border border-[#C2DEC9] text-[#2D6A4F] text-xs font-semibold tracking-normal">
          <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" aria-hidden="true" />
          <span>The Two-Sided Sustainable &amp; Accessible Travel Platform</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#131F17] tracking-tight leading-[1.12]">
          Lower-carbon trips for travelers.{' '}
          <span className="italic text-[#2D6A4F] block sm:inline">
            Audited efficiency for hotels.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#3F4E44] max-w-2xl mx-auto font-normal leading-relaxed">
          GreenYatra connects free-text multi-modal route planning with a live, verified{' '}
          <strong className="font-semibold text-[#131F17]">Green Score</strong>. Travelers discover
          accessible stays ranked by real resource telemetry — while hotels cut energy, water, and
          food waste to earn that exact same score.
        </p>
      </div>

      {/* Centerpiece Interactive Demo Card */}
      <div className="bg-white rounded-2xl border border-[#E5DED3] shadow-lg shadow-[#131F17]/5 overflow-hidden transition-all">
        {/* Instrument Header Bar */}
        <div className="bg-[#131F17] text-white px-5 sm:px-7 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#25382B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] ring-4 ring-[#2D6A4F]/30 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-semibold tracking-wide uppercase font-mono text-[#EAF3ED]">
              Interactive Simulation: Live Route &amp; Hotel ESG Demo
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#9BB1A3] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" aria-hidden="true" />
            <span>Audited Telemetry &bull; Zero Fabricated Modes</span>
          </div>
        </div>

        {/* Route Selector & Input Bar */}
        <div className="p-5 sm:p-7 border-b border-[#E5DED3] bg-[#FAF7F2]">
          <div className="space-y-4">
            {/* Preset Route Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#5A6B5F] uppercase tracking-wider font-mono mr-1">
                Sample Route Pairs:
              </span>
              {PRESETS.map((preset) => {
                const isActive = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:outline-none ${
                      isActive
                        ? 'bg-[#2D6A4F] text-white shadow-xs font-semibold'
                        : 'bg-white hover:bg-[#EAF3ED] text-[#2C3B31] border border-[#E5DED3]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Inputs & Distance Meta */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-5 relative">
                <label htmlFor="origin-input" className="sr-only">Origin Location</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2D6A4F]">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="origin-input"
                  type="text"
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  placeholder="Enter origin city or landmark"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E5DED3] rounded-xl text-[#131F17] font-medium placeholder-[#7A8A7F] focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-center">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DED3] text-xs font-mono text-[#5A6B5F]">
                  <Navigation className="w-3 h-3 text-[#2D6A4F]" aria-hidden="true" />
                  <span className="tabular-nums">{currentPreset.distanceKm} km</span>
                </div>
                <div className="md:hidden flex items-center gap-1 text-xs text-[#5A6B5F] font-mono">
                  <span>&darr;</span>
                  <span>{currentPreset.distanceKm} km direct transit corridor</span>
                </div>
              </div>

              <div className="md:col-span-5 relative">
                <label htmlFor="dest-input" className="sr-only">Destination Location</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#D97706]">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="dest-input"
                  type="text"
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  placeholder="Enter destination city or landmark"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E5DED3] rounded-xl text-[#131F17] font-medium placeholder-[#7A8A7F] focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Split Pane: Left (Transport Ranking) | Right (Destination Hotel Score) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5DED3]">
          {/* Left: Viable Transport Modes & Anti-Hallucination Omission (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-7 space-y-5 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#131F17]">
                  Viable Transport Comparison
                </h3>
                <p className="text-xs text-[#5A6B5F]">
                  Resolved via Mapbox directions + Climatiq certified GHG activity emission factors
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#2D6A4F] bg-[#EAF3ED] px-2.5 py-1 rounded-md border border-[#C2DEC9]">
                Live Factor Check
              </span>
            </div>

            {/* Stylized Animated Route Contour SVG */}
            <div className="h-16 w-full bg-[#FAF7F2] rounded-xl border border-[#E5DED3] p-3 flex items-center relative overflow-hidden">
              <svg className="w-full h-8" viewBox="0 0 400 30" fill="none" preserveAspectRatio="none">
                {/* Background faint guide line */}
                <path
                  d="M 15 15 C 100 28, 180 2, 280 24 C 340 28, 370 18, 385 15"
                  stroke="#E5DED3"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {/* Dynamic animated drawn line */}
                <path
                  key={selectedPresetId}
                  d="M 15 15 C 100 28, 180 2, 280 24 C 340 28, 370 18, 385 15"
                  stroke="#2D6A4F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-route-draw"
                />
                <circle cx="15" cy="15" r="4.5" fill="#2D6A4F" />
                <circle cx="385" cy="15" r="4.5" fill="#D97706" />
              </svg>
              <div className="absolute left-4 top-1 text-[10px] font-mono font-medium text-[#2D6A4F]">
                {originInput.split(',')[0]}
              </div>
              <div className="absolute right-4 top-1 text-[10px] font-mono font-medium text-[#D97706]">
                {destInput.split(',')[0]}
              </div>
            </div>

            {/* Mode Cards Stack */}
            <div className="space-y-3">
              {currentPreset.modes.map((mode) => {
                const Icon = mode.icon;
                const animatedCo2e = Math.round(mode.co2eKg * animProgress);
                const animatedCost = Math.round(mode.costInr * animProgress);

                return (
                  <div
                    key={mode.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                      mode.isLowestCarbon
                        ? 'bg-[#EAF3ED]/60 border-[#C2DEC9] ring-1 ring-[#2D6A4F]/20'
                        : 'bg-white border-[#E5DED3] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            mode.isLowestCarbon
                              ? 'bg-[#2D6A4F] text-white'
                              : 'bg-[#FAF7F2] text-[#5A6B5F] border border-[#E5DED3]'
                          }`}
                        >
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#131F17]">
                              {mode.name}
                            </span>
                            {mode.isLowestCarbon && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D6A4F] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#C2DEC9]">
                                <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" aria-hidden="true" />
                                <span>Lowest Carbon</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#5A6B5F] mt-0.5">{mode.notes}</p>
                        </div>
                      </div>

                      {/* Numerical Instrument Readouts */}
                      <div className="flex items-center gap-3 sm:gap-5 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DED3]/60 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-[#7A8A7F] block font-mono">Footprint</span>
                          <span
                            className={`text-sm font-mono font-bold tabular-nums ${
                              mode.isLowestCarbon ? 'text-[#2D6A4F]' : 'text-[#131F17]'
                            }`}
                          >
                            {animatedCo2e}{' '}
                            <span className="text-[11px] font-normal text-[#5A6B5F]">kg CO₂e</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#7A8A7F] block font-mono">Duration</span>
                          <span className="text-xs font-mono font-medium text-[#131F17]">
                            {mode.durationStr}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#7A8A7F] block font-mono">Est. Fare</span>
                          <span className="text-xs font-mono font-semibold text-[#131F17] tabular-nums">
                            ₹{animatedCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Anti-Hallucination Omitted Mode Notice (Crucial requirement) */}
            {currentPreset.omittedMode && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DED3] text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#B45309] font-semibold font-mono">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Unrealistic Mode Omitted: {currentPreset.omittedMode.name}</span>
                </div>
                <p className="text-[#5A6B5F] leading-relaxed">
                  {currentPreset.omittedMode.reason}
                </p>
                <div className="text-[11px] text-[#2D6A4F] font-mono pt-0.5">
                  &bull; Anti-Hallucination Policy: Viable modes are computed from real transport networks, not fabricated tables.
                </div>
              </div>
            )}
          </div>

          {/* Right: Destination Hotel Live Green Score Gauge & Breakdown (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-7 bg-[#FAF7F2] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Hotel Header & Quick Tier Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#5A6B5F] uppercase tracking-wider">
                    Destination Property
                  </span>
                  <div className="flex items-center gap-1">
                    {PRESETS.map((p) => {
                      const isCurrent = activeHotel.id === p.hotel.id;
                      return (
                        <button
                          key={p.hotel.id}
                          type="button"
                          onClick={() => setActiveHotelOverride(p.hotel)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#131F17] text-white font-semibold'
                              : 'bg-white hover:bg-slate-200 text-[#5A6B5F] border border-[#E5DED3]'
                          }`}
                        >
                          {p.hotel.tier}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#131F17]">
                      {activeHotel.name}
                    </h3>
                    <p className="text-xs text-[#5A6B5F]">{activeHotel.location}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border font-mono ${tierColors.badgeBg}`}
                  >
                    {activeHotel.tier} Tier
                  </span>
                </div>
              </div>

              {/* Live SVG Gauge filling up to score */}
              <div className="bg-white rounded-xl border border-[#E5DED3] p-4 flex items-center justify-center relative shadow-xs">
                <div className="relative w-44 h-36 flex items-center justify-center">
                  <svg className="w-44 h-44 -rotate-110 transform" viewBox="0 0 160 160">
                    {/* Gauge Track */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#E5DED3"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${arcLength} ${circumference}`}
                      strokeLinecap="round"
                    />
                    {/* Gauge Animated Value Arc */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={tierColors.stroke}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${arcLength} ${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-75 ease-out"
                    />
                  </svg>

                  {/* Inner Score Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 text-center pointer-events-none">
                    <span className="text-3xl font-mono font-extrabold text-[#131F17] tabular-nums leading-none">
                      {displayedScore}
                    </span>
                    <span className="text-[11px] font-mono text-[#7A8A7F] mt-0.5">
                      out of 100
                    </span>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#2D6A4F] mt-1">
                      Audited Green Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Simplified Clean Score Breakdown */}
              <div className="space-y-2.5 bg-white rounded-xl border border-[#E5DED3] p-3.5 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E5DED3] text-[#131F17] font-semibold">
                  <span>Score Breakdown (100 Pts Total)</span>
                  <span className="font-mono text-[11px] text-[#2D6A4F]">Audited Weights</span>
                </div>

                {/* Component 1: Resource Efficiency (40%) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#131F17]">Resource Efficiency (40%)</span>
                    <span className="font-mono font-bold tabular-nums text-[#2D6A4F]">
                      {Math.round(activeHotel.resourceScore * animProgress)} / 40
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 overflow-hidden border border-[#E5DED3]">
                    <div
                      className="bg-[#2D6A4F] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(activeHotel.resourceScore / 40) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Component 2: Recommendation Completion (30%) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#131F17]">AI Recommendations (30%)</span>
                    <span className="font-mono font-bold tabular-nums text-[#2D6A4F]">
                      {Math.round(activeHotel.recoScore * animProgress)} / 30
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 overflow-hidden border border-[#E5DED3]">
                    <div
                      className="bg-[#2D6A4F] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(activeHotel.recoScore / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Component 3: Guest Behavior (20%) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#131F17]">Guest In-Stay Behavior (20%)</span>
                    <span className="font-mono font-bold tabular-nums text-[#2D6A4F]">
                      {Math.round(activeHotel.guestScore * animProgress)} / 20
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 overflow-hidden border border-[#E5DED3]">
                    <div
                      className="bg-[#2D6A4F] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(activeHotel.guestScore / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Component 4: Accessibility Baseline (10%) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#131F17]">Accessibility Baseline (10%)</span>
                    <span className="font-mono font-bold tabular-nums text-[#2D6A4F]">
                      {Math.round(activeHotel.accessScore * animProgress)} / 10
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 overflow-hidden border border-[#E5DED3]">
                    <div
                      className="bg-[#2D6A4F] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(activeHotel.accessScore / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Sum Verification Line */}
                <div className="pt-2 border-t border-[#E5DED3] flex items-center justify-between font-mono text-[11px] text-[#131F17]">
                  <span className="text-[#5A6B5F]">
                    {activeHotel.resourceScore} + {activeHotel.recoScore} + {activeHotel.guestScore} + {activeHotel.accessScore}
                  </span>
                  <span className="font-bold text-[#2D6A4F]">
                    = {activeHotel.score} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Direct App Link */}
            <div className="pt-1">
              <Link
                href={`/traveler?origin=${encodeURIComponent(originInput)}&destination=${encodeURIComponent(destInput)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#245838] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>Launch Full Planner for This Route</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
