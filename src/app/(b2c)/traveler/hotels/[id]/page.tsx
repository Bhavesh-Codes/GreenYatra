'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    Leaf,
    ShieldCheck,
    Award,
    MapPin,
    Zap,
    Droplets,
    Trash2,
    Footprints,
    Accessibility,
    Eye,
    Ear,
    Sparkles,
    CheckCircle2,
    HelpCircle,
    X,
    Clock,
    TrendingUp,
    Wine,
    Coffee,
    Gift,
    ArrowRight,
    Check,
    ExternalLink,
    AlertCircle,
    RotateCcw
} from 'lucide-react';
import type { Hotel, Recommendation, GreenTag } from '@/types/database';

interface HotelDetailResponse {
    success: boolean;
    hotel?: Hotel;
    verified_actions?: Recommendation[];
    error?: string;
}

/**
 * Sanitizes and strictly clamps sub-scores to their authorized maximums.
 * If a value was mistakenly stored as a 0-100 percentage, it scales it down cleanly.
 */
function clampSubScore(value: number | undefined, max: number): number {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    let normalized = value;
    if (normalized > max && normalized <= 100) {
        normalized = (normalized / 100) * max;
    }
    return Math.min(max, Math.max(0, Math.round(normalized * 10) / 10));
}

export default function TravelerHotelDetailPage() {
    const params = useParams();
    const hotelId = (params?.id as string) || '';

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [verifiedActions, setVerifiedActions] = useState<Recommendation[]>([]);
    const [showTrustModal, setShowTrustModal] = useState<boolean>(false);

    // Fetch hotel and verified actions on mount or id change
    useEffect(() => {
        if (!hotelId) return;

        let isMounted = true;
        const fetchHotelData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/hotels/${hotelId}`);
                const data: HotelDetailResponse = await res.json();

                if (!res.ok || !data.success || !data.hotel) {
                    throw new Error(data.error || 'Hotel details could not be found.');
                }

                if (isMounted) {
                    setHotel(data.hotel);
                    setVerifiedActions(data.verified_actions || []);
                }
            } catch (err: unknown) {
                const errorObj = err as Error;
                if (isMounted) {
                    setError(errorObj.message || 'Failed to load hotel information.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchHotelData();

        return () => {
            isMounted = false;
        };
    }, [hotelId]);

    // Compute normalized 4-pillar scores
    const subScores = useMemo(() => {
        if (!hotel) {
            return {
                resource: 0,
                recommendations: 0,
                guest: 0,
                accessibility: 0
            };
        }

        const sb = hotel.score_breakdown;
        return {
            resource: clampSubScore(sb?.resource_efficiency, 40),
            recommendations: clampSubScore(sb?.recommendation_completion, 30),
            guest: clampSubScore(sb?.guest_behavior, 20),
            accessibility: clampSubScore(sb?.accessibility_baseline, 10)
        };
    }, [hotel]);

    // Tier badge color helper
    const getTierBadgeStyle = (tier?: GreenTag) => {
        switch (tier) {
            case 'Gold':
                return 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20';
            case 'Silver':
                return 'bg-slate-700 text-white border-slate-600 shadow-slate-700/20';
            case 'Bronze':
                return 'bg-amber-600 text-white border-amber-500 shadow-amber-600/20';
            default:
                return 'bg-slate-500 text-white border-slate-400 shadow-slate-500/20';
        }
    };

    // Category styling helper for verified actions
    const getCategoryMeta = (category: string) => {
        switch (category) {
            case 'energy':
                return {
                    label: 'Energy Decarbonization',
                    icon: Zap,
                    bgClass: 'bg-amber-50 text-amber-800 border-amber-200',
                    iconClass: 'text-amber-600'
                };
            case 'water':
                return {
                    label: 'Water Circularity',
                    icon: Droplets,
                    bgClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
                    iconClass: 'text-cyan-600'
                };
            case 'food_waste':
                return {
                    label: 'Organic Waste Diversion',
                    icon: Trash2,
                    bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    iconClass: 'text-emerald-600'
                };
            default:
                return {
                    label: 'Operational Upgrade',
                    icon: Sparkles,
                    bgClass: 'bg-slate-50 text-slate-800 border-slate-200',
                    iconClass: 'text-slate-600'
                };
        }
    };

    // Loading Skeleton state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
                {/* Header Skeleton */}
                <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="w-40 h-9 bg-slate-200/70 rounded-xl animate-pulse" />
                        <div className="w-44 h-9 bg-slate-200/70 rounded-xl animate-pulse" />
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-pulse">
                    {/* Hero Skeleton */}
                    <div className="w-full h-80 sm:h-96 rounded-3xl bg-slate-200" />

                    {/* Score Inspector Skeleton */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="w-48 h-8 bg-slate-200 rounded-lg" />
                            <div className="w-32 h-6 bg-slate-200 rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-20 bg-slate-100 rounded-2xl" />
                            <div className="h-20 bg-slate-100 rounded-2xl" />
                            <div className="h-20 bg-slate-100 rounded-2xl" />
                            <div className="h-20 bg-slate-100 rounded-2xl" />
                        </div>
                    </div>

                    {/* Actions Skeleton */}
                    <div className="space-y-4">
                        <div className="w-56 h-7 bg-slate-200 rounded-lg" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-44 bg-white border border-slate-200/80 rounded-2xl" />
                            <div className="h-44 bg-white border border-slate-200/80 rounded-2xl" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Error state
    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
                <header className="bg-white border-b border-slate-200">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                        <Link
                            href="/traveler"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Trip Planner</span>
                        </Link>
                    </div>
                </header>

                <main className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Hotel Property Not Found</h1>
                    <p className="text-sm text-slate-600">
                        {error || 'We could not retrieve the audited record for this hotel ID. Please return to the search planner.'}
                    </p>
                    <div className="pt-4">
                        <Link
                            href="/traveler"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Green Trip Planner</span>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const feats = hotel.accessibility_features || {
        step_free_access: false,
        wheelchair_accessible: false,
        visual_assistance: false,
        hearing_assistance: false
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Back to Trip Planner */}
                    <Link
                        href="/traveler"
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl border border-slate-200/80 transition-colors shadow-2xs cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-600" />
                        <span>Back to Trip Planner</span>
                    </Link>

                    {/* Switch to Hotel ESG OS (B2B loop demonstration) */}
                    <Link
                        href={`/hotel/${hotel.id}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 rounded-xl border border-slate-200 transition-all shadow-2xs"
                        title="View the live B2B telemetry & ESG compliance dashboard for this property"
                    >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Switch to Hotel ESG OS</span>
                        <span className="sm:hidden">ESG OS</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                    </Link>
                </div>
            </header>

            {/* Main Container */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hotel Hero Section */}
                <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
                    {/* High-Resolution Hero Image */}
                    <div className="relative h-80 sm:h-[420px] w-full">
                        {hotel.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={hotel.image_url}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                <Building2 className="w-16 h-16" />
                            </div>
                        )}

                        {/* Subtle Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                        {/* Top Badges Floating on Hero */}
                        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2">
                            {/* Green Tag Badge */}
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-md ${getTierBadgeStyle(
                                    hotel.green_tag
                                )}`}
                            >
                                <Award className="w-4 h-4" />
                                <span>{hotel.green_tag} Green Tag Tier</span>
                            </span>

                            {/* Verified Audited Pill */}
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 border border-white/40 shadow-sm">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Third-Party Audited</span>
                            </span>
                        </div>

                        {/* Bottom Hero Content */}
                        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="space-y-1.5 text-white max-w-2xl">
                                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-xs">
                                    {hotel.name}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>{hotel.address || `${hotel.city}, India`}</span>
                                </p>
                            </div>

                            {/* Price Nightly Box */}
                            <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-lg text-slate-900 shrink-0 sm:text-right">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                    Nightly Rate
                                </span>
                                <div className="flex sm:justify-end items-baseline gap-1 mt-0.5">
                                    <span className="text-2xl font-black text-slate-900">
                                        ₹{hotel.price_per_night?.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">/ night</span>
                                </div>
                                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                                    Includes verified zero-carbon offset
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description Text Bar */}
                    {hotel.description && (
                        <div className="p-5 sm:p-6 bg-white border-t border-slate-100">
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                {hotel.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Anti-Greenwashing Score Inspector Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-7">
                    {/* Header Row with Trustworthy Explanation Trigger */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                    Transparent ESG Certification
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
                                <span>Audited Green Score:</span>
                                <span className="text-emerald-600">{hotel.green_score}</span>
                                <span className="text-sm font-semibold text-slate-400">/ 100</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Real-time dynamic composite calculated from live IoT meters and verified operational retrofits.
                            </p>
                        </div>

                        {/* "Why is this trustworthy?" Button */}
                        <button
                            type="button"
                            onClick={() => setShowTrustModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
                        >
                            <HelpCircle className="w-4 h-4 text-emerald-600" />
                            <span>Why is this trustworthy?</span>
                        </button>
                    </div>

                    {/* Anti-Greenwashing Guarantee Banner */}
                    <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-slate-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start sm:items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                                Verified Anti-Greenwashing Standard
                            </h4>
                            <p className="text-xs text-slate-600 leading-normal">
                                Unlike self-declared hospitality badges, GreenYatra penalizes unverified marketing claims. Every point is backed by calibrated smart-meter telemetry, utility invoices, and third-party sustainability audits.
                            </p>
                        </div>
                    </div>

                    {/* 4-Pillar Score Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* 1. Resource Efficiency (40 pts) */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="w-4 h-4 text-amber-600" />
                                        <h3 className="font-bold text-sm text-slate-900">Resource Efficiency</h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Live metered telemetry vs peer benchmarks (Energy, Water, Food Waste)
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-lg font-extrabold text-slate-900">
                                        {subScores.resource}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400"> / 40 pts</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(subScores.resource / 40) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                                {Math.round((subScores.resource / 40) * 100)}% benchmark performance
                            </span>
                        </div>

                        {/* 2. Verified Eco-Upgrades (30 pts) */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                        <h3 className="font-bold text-sm text-slate-900">Verified Eco-Upgrades</h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Independent retrofit completion rate &amp; certified operational fixes
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-lg font-extrabold text-slate-900">
                                        {subScores.recommendations}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400"> / 30 pts</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(subScores.recommendations / 30) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                                {Math.round((subScores.recommendations / 30) * 100)}% verified implementation
                            </span>
                        </div>

                        {/* 3. Guest In-Stay Participation (20 pts) */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-sky-600" />
                                        <h3 className="font-bold text-sm text-slate-900">Guest In-Stay Participation</h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Verified guest opt-ins (Linen, AC 24°C eco-mode, and towel reuse)
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-lg font-extrabold text-slate-900">
                                        {subScores.guest}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400"> / 20 pts</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(subScores.guest / 20) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                                {Math.round((subScores.guest / 20) * 100)}% guest opt-in rate
                            </span>
                        </div>

                        {/* 4. Accessibility Audit (10 pts) */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Accessibility className="w-4 h-4 text-indigo-600" />
                                        <h3 className="font-bold text-sm text-slate-900">Accessibility Audit</h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Universal physical accessibility verified by on-site compliance baseline
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-lg font-extrabold text-slate-900">
                                        {subScores.accessibility}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400"> / 10 pts</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(subScores.accessibility / 10) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                                {Math.round((subScores.accessibility / 10) * 100)}% barrier-free compliance
                            </span>
                        </div>
                    </div>
                </div>

                {/* Verified Sustainability Actions Section */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <span>Verified Sustainability Actions</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Independently audited operational retrofits completed by this property
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 self-start sm:self-auto">
                            {verifiedActions.length} Completed Retrofit{verifiedActions.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    {verifiedActions.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3 shadow-2xs">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-sm text-slate-800">
                                Hotel is currently completing initial baseline recommendations
                            </h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                The sustainability engineering team is implementing prioritized energy, water, and waste retrofits. Once verified by our IoT telemetry audit, they will be listed here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {verifiedActions.map((action) => {
                                const catMeta = getCategoryMeta(action.category);
                                const CatIcon = catMeta.icon;

                                return (
                                    <div
                                        key={action.id}
                                        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
                                    >
                                        <div className="space-y-2.5">
                                            {/* Category & Status */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${catMeta.bgClass}`}
                                                >
                                                    <CatIcon className={`w-3.5 h-3.5 ${catMeta.iconClass}`} />
                                                    <span>{catMeta.label}</span>
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                    <Check className="w-3 h-3" />
                                                    <span>Verified Complete</span>
                                                </span>
                                            </div>

                                            {/* Title & Description */}
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                                    {action.title}
                                                </h4>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Impact Badge */}
                                        {action.estimated_impact && (
                                            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50/60 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span className="truncate">{action.estimated_impact}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Accessibility Audit Badges */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Accessibility className="w-5 h-5 text-indigo-600" />
                                <span>Verified Accessibility Features</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Universal inclusion audit conducted on physical property premises
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {/* Step-Free Access */}
                        <div
                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                                feats.step_free_access
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <Footprints className={`w-5 h-5 ${feats.step_free_access ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {feats.step_free_access ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold">N/A</span>
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-xs block">Step-Free Access</span>
                                <span className="text-[10px] opacity-75 block">Elevators &amp; flat thresholds</span>
                            </div>
                        </div>

                        {/* Wheelchair Accessible */}
                        <div
                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                                feats.wheelchair_accessible
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <Accessibility className={`w-5 h-5 ${feats.wheelchair_accessible ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {feats.wheelchair_accessible ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold">N/A</span>
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-xs block">Wheelchair Ramps</span>
                                <span className="text-[10px] opacity-75 block">Wide doors &amp; roll-in showers</span>
                            </div>
                        </div>

                        {/* Visual Assistance */}
                        <div
                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                                feats.visual_assistance
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <Eye className={`w-5 h-5 ${feats.visual_assistance ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {feats.visual_assistance ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold">N/A</span>
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-xs block">Visual Assistance</span>
                                <span className="text-[10px] opacity-75 block">Braille signage &amp; high contrast</span>
                            </div>
                        </div>

                        {/* Hearing Assistance */}
                        <div
                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                                feats.hearing_assistance
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <Ear className={`w-5 h-5 ${feats.hearing_assistance ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {feats.hearing_assistance ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold">N/A</span>
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-xs block">Hearing Assistance</span>
                                <span className="text-[10px] opacity-75 block">Visual strobes &amp; induction loops</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* "Stay Mode" Gamification Teaser Card */}
                <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    {/* Decorative Background Circles */}
                    <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>In-Stay Guest Rewards</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    Earn Eco-Points During Your Stay
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                                    Activate Stay Mode on check-in. Every sustainable action you take directly reduces hotel emissions and earns you instant on-property rewards.
                                </p>
                            </div>

                            {/* Check-In Action Button */}
                            <Link
                                href={`/traveler/stay/${hotel.id}`}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 shrink-0 cursor-pointer"
                            >
                                <span>Check-In to Stay Mode</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Perk Previews */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            {/* Perk 1 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
                                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                                    <Wine className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-white">Craft Cocktail</h4>
                                    <p className="text-[11px] text-slate-300 mt-0.5">
                                        Redeemable at the organic sunset lounge (150 pts)
                                    </p>
                                </div>
                            </div>

                            {/* Perk 2 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
                                <div className="w-8 h-8 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-white">2-Hour Late Checkout</h4>
                                    <p className="text-[11px] text-slate-300 mt-0.5">
                                        Relax longer on departure day (200 pts)
                                    </p>
                                </div>
                            </div>

                            {/* Perk 3 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                                    <Coffee className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-white">Artisanal Dessert</h4>
                                    <p className="text-[11px] text-slate-300 mt-0.5">
                                        Complimentary farm-to-table treat (100 pts)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* "Why is this trustworthy?" Modal Dialog */}
            {showTrustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-base text-slate-900">Why GreenYatra Scores Are Trustworthy</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTrustModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                                    1
                                </div>
                                <div>
                                    <strong className="text-slate-900 block">Live Telemetry, Not Self-Reporting</strong>
                                    Scores are recalculated continuously from IoT energy sub-meters, smart water flow sensors, and kitchen food waste logs.
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold">
                                    2
                                </div>
                                <div>
                                    <strong className="text-slate-900 block">Automated Anomaly Detection</strong>
                                    Sudden HVAC spikes or unmetered water consumption automatically suppress green score badges until verified by auditor engineers.
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 font-bold">
                                    3
                                </div>
                                <div>
                                    <strong className="text-slate-900 block">Verified Physical Audit Baseline</strong>
                                    Accessibility ramps, Braille signage, solar arrays, and composters are audited on-site by accredited ESG inspectors.
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setShowTrustModal(false)}
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
