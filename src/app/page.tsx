'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Leaf,
    Building2,
    Sparkles,
    MapPin,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    TrendingUp,
    Zap,
    Award,
    Footprints,
    Coins,
    Compass,
    Route,
    BrainCircuit,
    Check,
    Globe,
    Users,
    ChevronRight,
    SlidersHorizontal,
    BarChart3
} from 'lucide-react';
import AppNavbar from '@/components/AppNavbar';

export default function LandingPage() {
    const router = useRouter();

    // Quick trip teaser state
    const [teaserOrigin, setTeaserOrigin] = useState('Mumbai, Bandra West');
    const [teaserDest, setTeaserDest] = useState('Goa, Vagator');

    const handleTeaserSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teaserOrigin.trim() || !teaserDest.trim()) return;
        router.push(`/traveler?origin=${encodeURIComponent(teaserOrigin.trim())}&destination=${encodeURIComponent(teaserDest.trim())}`);
    };

    const applyTeaserPreset = (origin: string, dest: string) => {
        setTeaserOrigin(origin);
        setTeaserDest(dest);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
            {/* Top Shared Navigation Bar */}
            <AppNavbar />

            {/* Hero Section */}
            <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Subtle emerald radial background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
                    {/* Top Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-bold tracking-wide shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>India&apos;s First Real-Time ESG Hospitality Ecosystem</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                        Travel with Purpose.{' '}
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                            Operate with Precision.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
                        The first two-sided hospitality platform connecting low-carbon, accessible travel planning with real-time hotel sustainability intelligence and net-profitable guest loyalty.
                    </p>

                    {/* Dual Call-to-Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                            href="/traveler"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all cursor-pointer"
                        >
                            <span>Plan a Green Journey</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/auth/hotel"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm sm:text-base border border-slate-300 hover:border-slate-400 shadow-sm transition-all cursor-pointer"
                        >
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span>Onboard Your Hotel</span>
                        </Link>
                    </div>

                    {/* Trust Metric Badges */}
                    <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>100% Traceable Green Score</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700">
                            <Footprints className="w-4 h-4 text-teal-600 shrink-0" />
                            <span>Universal Accessibility Audits</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700">
                            <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Positive ROI Guarantee</span>
                        </div>
                    </div>
                </div>

                {/* Floating Interactive Carbon Route Teaser Card */}
                <div className="max-w-3xl mx-auto mt-12 bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-slate-200/70 p-5 sm:p-7 relative overflow-hidden">
                    {/* Top accent gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Route className="w-4 h-4 text-emerald-600" />
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                Instant Route Carbon Estimator
                            </h2>
                        </div>
                        <span className="text-[11px] text-slate-500">
                            Powered by Mapbox Highway Contours &amp; Climatiq GHG Factors
                        </span>
                    </div>

                    <form onSubmit={handleTeaserSearch} className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* Origin */}
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                    Origin Location
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={teaserOrigin}
                                        onChange={(e) => setTeaserOrigin(e.target.value)}
                                        placeholder="e.g. Mumbai, Bandra West"
                                        className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                    Destination Location
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
                                        <Compass className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={teaserDest}
                                        onChange={(e) => setTeaserDest(e.target.value)}
                                        placeholder="e.g. Goa, Vagator"
                                        className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Presets & CTA */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                                <span className="font-semibold text-slate-600">Common Routes:</span>
                                <button
                                    type="button"
                                    onClick={() => applyTeaserPreset('Mumbai, Bandra West', 'Goa, Vagator')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition cursor-pointer"
                                >
                                    Mumbai → Goa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTeaserPreset('Delhi, Connaught Place', 'Manali, Mall Road')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition cursor-pointer"
                                >
                                    Delhi → Manali
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTeaserPreset('Bengaluru, Indiranagar', 'Goa, Palolem')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition cursor-pointer"
                                >
                                    Bengaluru → Goa
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer shrink-0"
                            >
                                <span>Estimate Route Footprint</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* The Closed-Loop Ecosystem Infographic Section */}
            <section id="how-it-works" className="py-16 bg-white border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                            <span>🔄 Closed-Loop Circular Hospitality</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            The Self-Reinforcing Sustainability Cycle
                        </h2>
                        <p className="text-slate-600 text-base sm:text-lg">
                            Traditional eco-tourism relies on unverified claims. GreenYatra binds traveler decisions and hotel utility meters into an audited economic feedback loop.
                        </p>
                    </div>

                    {/* 4-Step Ecosystem Grid with Visual Connectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Step 1 */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow relative">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg shadow-2xs">
                                01
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Traveler Plans Low-Carbon Trip
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Multi-modal comparison ranks transport by certified Climatiq GHG factors and surfaces verified accessible eco-stays.
                            </p>
                            <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Zero Greenwashing Discovery</span>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow relative">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-lg shadow-2xs">
                                02
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Guest Opts into Stay Mode
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Micro-actions like AC moderation (24°C) and skipping housekeeping conserve hotel power and water in exchange for in-stay perks.
                            </p>
                            <div className="pt-2 text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5" />
                                <span>Earned Eco-Points Wallet</span>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow relative">
                            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-lg shadow-2xs">
                                03
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Hotel Lowers Operating Costs
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Operator tracks net financial savings (labor, energy, laundry) and implements Gemini AI recommendations to fix consumption anomalies.
                            </p>
                            <div className="pt-2 text-[11px] font-semibold text-sky-700 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Verified Profit Center</span>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow relative">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg shadow-2xs">
                                04
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Live Green Score Increases
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Audited telemetry improvements elevate the hotel&apos;s verified Green Score and tag (Bronze → Silver → Gold), winning more eco-traveler bookings.
                            </p>
                            <div className="pt-2 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                <span>Higher Search Visibility</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Four Core Pillars Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                        <span>Technological Architecture</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Built on Four Foundational Pillars
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg">
                        Engineered with industry-standard carbon databases, real-time IoT utility telemetry, and conversational intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pillar 1 */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-7 space-y-4 hover:border-emerald-300 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Route className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            1. Dynamic Multi-Modal Planner
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Renders actual highway route contours via Mapbox GL Directions API. Integrates official Climatiq GHG emission factors and converts abstract CO₂e metrics into relatable everyday equivalents with Google Gemini AI.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Mapbox Vector Contours</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Climatiq API v1</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Gemini Flash</span>
                        </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-7 space-y-4 hover:border-emerald-300 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            2. Anti-Greenwashing Green Score
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            No self-awarded marketing certificates. Properties are audited by a weighted mathematical algorithm: <strong>40% Resource Telemetry</strong> + <strong>30% Verified Actions</strong> + <strong>20% Guest Behavior</strong> + <strong>10% Accessibility Standards</strong>.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Audited 100-Pt Index</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Bronze / Silver / Gold Tiers</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Inspectable Breakdown</span>
                        </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-7 space-y-4 hover:border-emerald-300 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                            <Coins className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            3. In-Stay Gamified Loyalty
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Guest Stay Mode gamifies conservation during live visits. Guests skip housekeeping or reuse towels, immediately accumulating Eco-Points that unlock instant digital QR vouchers for hotel beverages, dining, and late checkouts.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Live Points Wallet</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Instant Voucher Generator</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Zero Paper Waste</span>
                        </div>
                    </div>

                    {/* Pillar 4 */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-7 space-y-4 hover:border-emerald-300 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            4. Hotel ESG OS &amp; Gemini Recommendations
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Full 90-day time-series telemetry tracks power, water, and kitchen food waste against regional benchmarks. Anomaly detection identifies unexpected spikes, while Gemini AI generates prioritized engineering interventions.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Time-Series Telemetry</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Spike Anomaly Flagging</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Unit Economics ROI</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* B2B Hotel Partner Banner */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    {/* Background accent ambient light */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-3xl space-y-4 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold uppercase tracking-wider">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Hotel Partnership Network</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                            Are you a hotel operator or sustainability manager?
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            Join certified green properties across India. Benchmark your resource usage, access automated AI audits, and turn sustainability into a profit center.
                        </p>
                        <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Link
                                href="/hotel/onboard"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
                            >
                                <span>Launch Hotel ESG OS</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/auth/hotel"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors"
                            >
                                <span>Sign In as Operator</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-white border-t border-slate-200/90 py-12 text-slate-600 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand Column */}
                        <div className="space-y-3 md:col-span-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                    <Leaf className="w-4 h-4" />
                                </div>
                                <span className="font-extrabold text-base text-slate-900 tracking-tight">GreenYatra</span>
                            </div>
                            <p className="text-slate-500 max-w-sm leading-relaxed">
                                Accelerating India&apos;s net-zero transition through audited multi-modal route planning, universal travel accessibility, and automated hotel telemetry intelligence.
                            </p>
                            <p className="text-[11px] text-slate-400">
                                GHG accounting strictly aligned with the GHG Protocol Corporate Standard and Climatiq Emission Datasets.
                            </p>
                        </div>

                        {/* B2C Links */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Traveler Solutions</h4>
                            <ul className="space-y-1.5">
                                <li>
                                    <Link href="/traveler" className="hover:text-emerald-700 transition-colors">
                                        Multi-Modal Trip Planner
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/auth/traveler" className="hover:text-emerald-700 transition-colors">
                                        Traveler Portal Login
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/traveler" className="hover:text-emerald-700 transition-colors">
                                        Accessible Hotels Index
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* B2B Links */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Hotel Enterprise</h4>
                            <ul className="space-y-1.5">
                                <li>
                                    <Link href="/hotel" className="hover:text-emerald-700 transition-colors">
                                        Hotel ESG Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/hotel/onboard" className="hover:text-emerald-700 transition-colors">
                                        Property Onboarding Wizard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/auth/hotel" className="hover:text-emerald-700 transition-colors">
                                        Operator Portal Login
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
                        <p>© {new Date().getFullYear()} GreenYatra Technologies Pvt. Ltd. All rights reserved.</p>
                        <div className="flex items-center gap-4 text-[11px]">
                            <span>Verified GHG Accounting</span>
                            <span>•</span>
                            <span>Mapbox GL Enabled</span>
                            <span>•</span>
                            <span>Google Gemini AI</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
