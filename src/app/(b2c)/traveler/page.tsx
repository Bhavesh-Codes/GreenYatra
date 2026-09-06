'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    Leaf,
    Building2,
    Footprints,
    Accessibility,
    Eye,
    Ear,
    Train,
    Bus,
    Zap,
    Car,
    Plane,
    MapPin,
    Clock,
    Sparkles,
    ArrowRight,
    Search,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
    RotateCcw,
    Award,
    TrendingDown,
    SlidersHorizontal
} from 'lucide-react';
import type { Hotel, GreenTag } from '@/types/database';

// Dynamically import RouteMap without SSR to guarantee clean client-side Mapbox GL mounting
const RouteMap = dynamic(() => import('@/components/RouteMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-80 rounded-2xl bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Initializing Interactive Mapbox GL Canvas...</span>
        </div>
    )
});

interface RouteOption {
    mode: string;
    distance_km: number;
    duration_mins: number;
    cost_inr: number;
    co2e_kg: number;
    is_greenest: boolean;
}

interface TripSearchResponse {
    success: boolean;
    origin: { name: string; lat: number; lng: number };
    destination: { name: string; lat: number; lng: number };
    route_geometry?: [number, number][];
    route_options: RouteOption[];
    carbon_explanation: string;
    hotels: Hotel[];
    error?: string;
}

interface AccessibilityFiltersState {
    stepFree: boolean;
    wheelchair: boolean;
    visual: boolean;
    hearing: boolean;
}

const PRESET_ROUTES = [
    { origin: 'Mumbai, Bandra West', destination: 'Goa, Vagator' },
    { origin: 'Bengaluru, Indiranagar', destination: 'Coorg, Madikeri' },
    { origin: 'Delhi, Connaught Place', destination: 'Jaipur, Pink City' }
];

export default function TravelerPage() {
    // Search form inputs
    const [origin, setOrigin] = useState<string>('Mumbai, Bandra West');
    const [destination, setDestination] = useState<string>('Goa, Vagator');
    const [travelers, setTravelers] = useState<number>(1);

    // Accessibility filter state
    const [accessibilityFilters, setAccessibilityFilters] = useState<AccessibilityFiltersState>({
        stepFree: false,
        wheelchair: false,
        visual: false,
        hearing: false
    });

    // Query & Results state
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResult, setSearchResult] = useState<TripSearchResponse | null>(null);

    // Toggle individual accessibility filter
    const toggleFilter = (key: keyof AccessibilityFiltersState) => {
        setAccessibilityFilters((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Calculate Green Routes handler
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!origin.trim() || !destination.trim()) {
            setError('Please enter both an origin and destination location.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/trip/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: origin.trim(),
                    destination: destination.trim(),
                    travelers
                })
            });

            const data: TripSearchResponse = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to calculate green routes.');
            }

            setSearchResult(data);
        } catch (err: unknown) {
            const errObj = err as Error;
            console.error('Trip search failed:', errObj);
            setError(errObj.message || 'Unable to connect to trip calculation service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Set preset route
    const applyPreset = (presetOrigin: string, presetDest: string) => {
        setOrigin(presetOrigin);
        setDestination(presetDest);
    };

    // Filter hotels by active accessibility criteria and order by Green Score descending
    const filteredHotels = useMemo(() => {
        if (!searchResult?.hotels) return [];

        return searchResult.hotels
            .filter((hotel) => {
                const feats = hotel.accessibility_features || {
                    step_free_access: false,
                    wheelchair_accessible: false,
                    visual_assistance: false,
                    hearing_assistance: false
                };

                if (accessibilityFilters.stepFree && !feats.step_free_access) return false;
                if (accessibilityFilters.wheelchair && !feats.wheelchair_accessible) return false;
                if (accessibilityFilters.visual && !feats.visual_assistance) return false;
                if (accessibilityFilters.hearing && !feats.hearing_assistance) return false;

                return true;
            })
            .sort((a, b) => (b.green_score ?? 0) - (a.green_score ?? 0));
    }, [searchResult, accessibilityFilters]);

    // Compute baseline aviation footprint to calculate relative emissions savings
    const aviationBaselineCo2 = useMemo(() => {
        if (!searchResult?.route_options?.length) return 0;
        const flightOption = searchResult.route_options.find((o) => o.mode === 'flight');
        if (flightOption) return flightOption.co2e_kg;

        // Fallback: use highest CO2 mode
        return Math.max(...searchResult.route_options.map((o) => o.co2e_kg));
    }, [searchResult]);

    // Format mode details
    const getModeDisplay = (mode: string) => {
        switch (mode) {
            case 'train':
                return {
                    name: 'Vande Bharat / Express Rail',
                    icon: Train,
                    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                    tag: 'High-Efficiency Rail'
                };
            case 'bus':
                return {
                    name: 'Intercity Electric / Bio-Bus',
                    icon: Bus,
                    iconColor: 'text-teal-600 bg-teal-50 border-teal-200',
                    tag: 'Affordable Group Transit'
                };
            case 'shared_ev':
                return {
                    name: 'Shared EV Fleet',
                    icon: Zap,
                    iconColor: 'text-sky-600 bg-sky-50 border-sky-200',
                    tag: 'Zero-Emission Highway EV'
                };
            case 'car':
                return {
                    name: 'Private Gasoline Car',
                    icon: Car,
                    iconColor: 'text-slate-600 bg-slate-50 border-slate-200',
                    tag: 'Personal Automobile'
                };
            case 'flight':
                return {
                    name: 'Commercial Air Route',
                    icon: Plane,
                    iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
                    tag: 'High-Altitude Aviation'
                };
            default:
                return {
                    name: mode.toUpperCase(),
                    icon: ArrowRight,
                    iconColor: 'text-slate-600 bg-slate-50 border-slate-200',
                    tag: 'Transit Option'
                };
        }
    };

    // Format minutes into clean hours and minutes
    const formatDuration = (mins: number) => {
        const hours = Math.floor(mins / 60);
        const remaining = Math.round(mins % 60);
        if (hours === 0) return `${remaining} mins`;
        if (remaining === 0) return `${hours} hrs`;
        return `${hours}h ${remaining}m`;
    };

    // Tier badge color helper
    const getTierBadge = (tier: GreenTag) => {
        switch (tier) {
            case 'Gold':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'Silver':
                return 'bg-slate-100 text-slate-700 border-slate-300';
            case 'Bronze':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                            <Leaf className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-slate-900 tracking-tight">GreenYatra</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Traveler
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 hidden sm:block">Sustainable & Accessible Route Engine</p>
                        </div>
                    </div>

                    {/* Switch to Hotel ESG OS Button */}
                    <Link
                        href="/hotel"
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors shadow-2xs"
                    >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Switch to Hotel ESG OS</span>
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>India&apos;s First Certified Eco-Transit Navigator</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Plan Low-Carbon, Accessible Journeys Across India
                    </h1>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                        Compare verified carbon footprints across rail, EV, bus, and flight. Find certified eco-stays tailored to your accessibility requirements.
                    </p>
                </div>

                {/* Search & Accessibility Filter Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-6">
                    <form onSubmit={handleSearch} className="space-y-6">
                        {/* Origin & Destination Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Origin */}
                            <div className="space-y-1.5">
                                <label htmlFor="origin-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Origin City or Landmark
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="origin-input"
                                        type="text"
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        placeholder="e.g. Mumbai, Bandra West"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="space-y-1.5">
                                <label htmlFor="destination-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Destination City or Beach
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="destination-input"
                                        type="text"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="e.g. Goa, Vagator"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Preset Route Chips */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                            <span className="font-medium text-slate-600">Popular Green Routes:</span>
                            {PRESET_ROUTES.map((p, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => applyPreset(p.origin, p.destination)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/60 transition-colors text-slate-700 cursor-pointer"
                                >
                                    {p.origin.split(',')[0]} → {p.destination.split(',')[0]}
                                </button>
                            ))}
                        </div>

                        {/* Accessibility Filters Section */}
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                        Accessibility & Inclusion Filters
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400">
                                    Filter hotel amenities & transit features
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {/* Step-Free Access */}
                                <button
                                    type="button"
                                    onClick={() => toggleFilter('stepFree')}
                                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                        accessibilityFilters.stepFree
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/80 hover:text-slate-900'
                                    }`}
                                >
                                    <Footprints className={`w-4 h-4 shrink-0 ${accessibilityFilters.stepFree ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <span className="truncate">Step-Free Access</span>
                                    {accessibilityFilters.stepFree && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                                    )}
                                </button>

                                {/* Wheelchair Accessible */}
                                <button
                                    type="button"
                                    onClick={() => toggleFilter('wheelchair')}
                                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                        accessibilityFilters.wheelchair
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/80 hover:text-slate-900'
                                    }`}
                                >
                                    <Accessibility className={`w-4 h-4 shrink-0 ${accessibilityFilters.wheelchair ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <span className="truncate">Wheelchair Accessible</span>
                                    {accessibilityFilters.wheelchair && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                                    )}
                                </button>

                                {/* Visual Assistance */}
                                <button
                                    type="button"
                                    onClick={() => toggleFilter('visual')}
                                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                        accessibilityFilters.visual
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/80 hover:text-slate-900'
                                    }`}
                                >
                                    <Eye className={`w-4 h-4 shrink-0 ${accessibilityFilters.visual ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <span className="truncate">Visual Assistance</span>
                                    {accessibilityFilters.visual && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                                    )}
                                </button>

                                {/* Hearing Assistance */}
                                <button
                                    type="button"
                                    onClick={() => toggleFilter('hearing')}
                                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                        accessibilityFilters.hearing
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/80 hover:text-slate-900'
                                    }`}
                                >
                                    <Ear className={`w-4 h-4 shrink-0 ${accessibilityFilters.hearing ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <span className="truncate">Hearing Assistance</span>
                                    {accessibilityFilters.hearing && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Action Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <label htmlFor="travelers-select" className="font-medium text-slate-700">
                                    Travelers:
                                </label>
                                <select
                                    id="travelers-select"
                                    value={travelers}
                                    onChange={(e) => setTravelers(Number(e.target.value))}
                                    className="bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:ring-emerald-500 focus:outline-none"
                                >
                                    <option value={1}>1 Traveler (Solo)</option>
                                    <option value={2}>2 Travelers (Pair)</option>
                                    <option value={3}>3 Travelers</option>
                                    <option value={4}>4 Travelers (Group)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Calculating Green Routes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        <span>Calculate Green Routes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 text-sm">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Routing Error</p>
                            <p className="text-rose-700 text-xs mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading State Skeleton */}
                {loading && !searchResult && (
                    <div className="space-y-6 animate-pulse">
                        <div className="h-80 bg-slate-200 rounded-2xl" />
                        <div className="h-24 bg-slate-200 rounded-xl" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-44 bg-slate-200 rounded-2xl" />
                            <div className="h-44 bg-slate-200 rounded-2xl" />
                            <div className="h-44 bg-slate-200 rounded-2xl" />
                        </div>
                    </div>
                )}

                {/* Results Section (rendered once data arrives) */}
                {searchResult && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Interactive Route Map */}
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                        <span>Interactive Route Map</span>
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Showing route from <strong className="text-slate-700">{searchResult.origin.name}</strong> to{' '}
                                        <strong className="text-slate-700">{searchResult.destination.name}</strong>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Origin
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Destination
                                    </span>
                                </div>
                            </div>

                            <RouteMap
                                origin={searchResult.origin}
                                destination={searchResult.destination}
                                geometry={searchResult.route_geometry}
                                className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
                            />
                        </div>

                        {/* Gemini Carbon Translation Banner */}
                        {searchResult.carbon_explanation && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 sm:p-5 rounded-xl shadow-2xs">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                        <Leaf className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                                                AI Carbon Translation
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                                Powered by Gemini
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                            {searchResult.carbon_explanation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Multi-Modal Comparison Grid */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                        Multi-Modal Carbon & Cost Comparison
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Ranked by Climatiq-verified emissions factors for {travelers} traveler{travelers > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                    {searchResult.route_options.length} Modes Analyzed
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResult.route_options.map((opt, idx) => {
                                    const meta = getModeDisplay(opt.mode);
                                    const IconComponent = meta.icon;

                                    // Compute relative emissions savings vs flying
                                    let relativeSavings: string | null = null;
                                    if (opt.mode === 'flight') {
                                        relativeSavings = 'Baseline aviation footprint';
                                    } else if (aviationBaselineCo2 > 0 && opt.co2e_kg < aviationBaselineCo2) {
                                        const savingsPct = Math.round(((aviationBaselineCo2 - opt.co2e_kg) / aviationBaselineCo2) * 100);
                                        relativeSavings = `Saves ${savingsPct}% CO2 vs flying`;
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className={`relative bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                                                opt.is_greenest
                                                    ? 'border-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
                                                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                                            }`}
                                        >
                                            {/* Greenest Choice Badge */}
                                            {opt.is_greenest && (
                                                <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1.5">
                                                    <span>🌿 Greenest Choice</span>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                {/* Header Row */}
                                                <div className="flex items-start justify-between gap-3 pt-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.iconColor}`}>
                                                            <IconComponent className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-sm text-slate-900 leading-tight">
                                                                {meta.name}
                                                            </h3>
                                                            <span className="text-[11px] font-medium text-slate-500">
                                                                {meta.tag}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Metric Row */}
                                                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
                                                    {/* Duration */}
                                                    <div>
                                                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                                            Travel Time
                                                        </span>
                                                        <span className="text-base font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {formatDuration(opt.duration_mins)}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">
                                                            {opt.distance_km} km
                                                        </span>
                                                    </div>

                                                    {/* Cost */}
                                                    <div>
                                                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                                            Estimated Cost
                                                        </span>
                                                        <span className="text-base font-bold text-slate-900 mt-0.5 block">
                                                            ₹{opt.cost_inr.toLocaleString('en-IN')}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">
                                                            for {travelers} passenger{travelers > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Carbon Footprint */}
                                                <div>
                                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                                        Carbon Footprint
                                                    </span>
                                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                                        <span className={`text-xl font-extrabold ${opt.is_greenest ? 'text-emerald-700' : 'text-slate-900'}`}>
                                                            {opt.co2e_kg}
                                                        </span>
                                                        <span className="text-xs font-semibold text-slate-500">
                                                            kg CO₂e
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Savings Tag */}
                                            {relativeSavings && (
                                                <div className="mt-4 pt-3 border-t border-slate-100">
                                                    {opt.mode === 'flight' ? (
                                                        <span className="text-xs text-rose-600 font-medium">
                                                            {relativeSavings}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                                                            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                                                            {relativeSavings}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Eco-Certified Accommodations Grid */}
                        <div className="space-y-4 pt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                        <span>Eco-Certified Accommodations</span>
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Hotels ranked by Green Score (0–100) and filtered by active accessibility requirements
                                    </p>
                                </div>
                                <div className="text-xs font-medium text-slate-600">
                                    Showing <strong className="text-slate-900">{filteredHotels.length}</strong> matching propert{filteredHotels.length === 1 ? 'y' : 'ies'}
                                </div>
                            </div>

                            {/* Hotels List */}
                            {filteredHotels.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        No hotels match all selected accessibility filters
                                    </p>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Try adjusting your accessibility requirements to see more verified properties in the destination area.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAccessibilityFilters({
                                                stepFree: false,
                                                wheelchair: false,
                                                visual: false,
                                                hearing: false
                                            })
                                        }
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Reset Accessibility Filters</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredHotels.map((hotel) => {
                                        const feats = hotel.accessibility_features || {
                                            step_free_access: false,
                                            wheelchair_accessible: false,
                                            visual_assistance: false,
                                            hearing_assistance: false
                                        };

                                        return (
                                            <Link
                                                key={hotel.id}
                                                href={`/traveler/hotels/${hotel.id}`}
                                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group cursor-pointer"
                                            >
                                                <div>
                                                    {/* Hotel Image */}
                                                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                                                        {hotel.image_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={hotel.image_url}
                                                                alt={hotel.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                                                <Building2 className="w-10 h-10" />
                                                            </div>
                                                        )}

                                                        {/* Green Tag Badge */}
                                                        <div className="absolute top-3 left-3">
                                                            <span
                                                                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs backdrop-blur-md ${getTierBadge(
                                                                    hotel.green_tag
                                                                )}`}
                                                            >
                                                                <Award className="w-3.5 h-3.5" />
                                                                <span>{hotel.green_tag} Tier</span>
                                                            </span>
                                                        </div>

                                                        {/* Green Score Pill */}
                                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs flex items-center gap-1.5">
                                                            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span className="text-xs font-bold text-slate-900">
                                                                {hotel.green_score}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-semibold">/100</span>
                                                        </div>
                                                    </div>

                                                    {/* Card Body */}
                                                    <div className="p-5 space-y-3">
                                                        <div>
                                                            <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                                                                {hotel.name}
                                                            </h3>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                <span className="truncate">{hotel.city || 'India'}</span>
                                                            </p>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-lg font-extrabold text-slate-900">
                                                                ₹{hotel.price_per_night?.toLocaleString('en-IN')}
                                                            </span>
                                                            <span className="text-xs text-slate-500">/ night</span>
                                                        </div>

                                                        {/* Accessibility Tags */}
                                                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                                Accessibility Certified
                                                            </span>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {feats.step_free_access && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                                                                        <Footprints className="w-3 h-3 text-slate-500" />
                                                                        Step-Free
                                                                    </span>
                                                                )}
                                                                {feats.wheelchair_accessible && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                                                                        <Accessibility className="w-3 h-3 text-slate-500" />
                                                                        Wheelchair
                                                                    </span>
                                                                )}
                                                                {feats.visual_assistance && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                                                                        <Eye className="w-3 h-3 text-slate-500" />
                                                                        Visual Help
                                                                    </span>
                                                                )}
                                                                {feats.hearing_assistance && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                                                                        <Ear className="w-3 h-3 text-slate-500" />
                                                                        Hearing Help
                                                                    </span>
                                                                )}
                                                                {!feats.step_free_access &&
                                                                    !feats.wheelchair_accessible &&
                                                                    !feats.visual_assistance &&
                                                                    !feats.hearing_assistance && (
                                                                        <span className="text-[11px] text-slate-400">
                                                                            Standard accessibility
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Footer: View Hotel & Stays Button */}
                                                <div className="p-5 pt-0">
                                                    <div
                                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 group-hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-2xs group-hover:shadow-sm"
                                                    >
                                                        <span>View Hotel &amp; Stays</span>
                                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-16 bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                            <Leaf className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">GreenYatra B2C Traveler</span>
                    </div>
                    <p>
                        Carbon computations powered by Climatiq GHG factors. Multi-modal intelligence via Mapbox &amp; Gemini.
                    </p>
                    <Link href="/hotel" className="text-emerald-700 hover:underline font-medium">
                        Access Hotel B2B ESG OS &rarr;
                    </Link>
                </div>
            </footer>
        </div>
    );
}
