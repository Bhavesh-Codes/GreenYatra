'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    Leaf,
    Zap,
    Droplets,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
    MapPin,
    ArrowRight,
    Sparkles,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    X,
    Award,
    ExternalLink,
    Building2,
    Clock,
    Flame,
    Filter,
    Check,
    BrainCircuit,
    ChevronRight,
    Coins,
    HelpCircle,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';
import type { Hotel, HotelUsage, Recommendation, GreenTag, ScoreBreakdown } from '@/types/database';

type MetricType = 'energy' | 'water' | 'food';
type CategoryFilter = 'all' | 'energy' | 'water' | 'food_waste';

interface HotelUsageApiResponse {
    success: boolean;
    hotel: Hotel;
    usage: HotelUsage[];
    has_recent_anomaly: boolean;
    recent_anomaly: HotelUsage | null;
    error?: string;
}

interface HotelListItem {
    id: string;
    name: string;
    city: string;
    green_score: number;
    green_tag: GreenTag;
}

interface RoiData {
    total_stays: number;
    opted_in_stays: number;
    participation_rate: number;
    gross_savings_inr: number;
    rewards_cost_inr: number;
    net_profit_inr: number;
    avg_savings_per_guest: number;
    assumptions: string[];
}

/**
 * Sanitizes and strictly clamps sub-scores to their authorized maximums.
 * If a value was mistakenly seeded or stored as a 0-100 percentage, it scales it down cleanly.
 */
function clampSubScore(value: number | undefined, max: number): number {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    let normalized = value;
    // If value exceeds max but <= 100, it was formatted as a percentage of 100
    if (normalized > max && normalized <= 100) {
        normalized = (normalized / 100) * max;
    }
    return Math.min(max, Math.max(0, Math.round(normalized * 10) / 10));
}

export default function HotelDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const hotelId = (params?.id as string) || '';
    const { user, signOut } = useAuth();
    const isReadOnlyTraveler = user?.role === 'traveler';

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/auth/hotel');
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<HotelUsageApiResponse | null>(null);
    const [activeMetric, setActiveMetric] = useState<MetricType>('energy');
    const [showBreakdown, setShowBreakdown] = useState<boolean>(true);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    // Hotel switcher state
    const [hotelsList, setHotelsList] = useState<HotelListItem[]>([]);
    const [showHotelDropdown, setShowHotelDropdown] = useState<boolean>(false);

    // Recommendations state
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [recosLoading, setRecosLoading] = useState<boolean>(false);
    const [generatingRecos, setGeneratingRecos] = useState<boolean>(false);
    const [updatingRecoId, setUpdatingRecoId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
    const [scorePulse, setScorePulse] = useState<boolean>(false);
    const [aiNotification, setAiNotification] = useState<string | null>(null);

    // ROI Tracker state
    const [roiData, setRoiData] = useState<RoiData | null>(null);
    const [roiLoading, setRoiLoading] = useState<boolean>(false);
    const [showEconomicsPanel, setShowEconomicsPanel] = useState<boolean>(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch all hotels for the header dropdown switcher
    useEffect(() => {
        async function loadHotels() {
            try {
                const res = await fetch('/api/hotels');
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && Array.isArray(json.hotels)) {
                        setHotelsList(json.hotels);
                    }
                }
            } catch (err) {
                console.error('Error loading hotels list:', err);
            }
        }
        loadHotels();
    }, []);

    // Fetch primary hotel telemetry and metrics
    const fetchHotelData = async () => {
        if (!hotelId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/hotel/${hotelId}/usage`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP error ${res.status}`);
            }
            const json: HotelUsageApiResponse = await res.json();
            if (!json.success) {
                throw new Error(json.error || 'Failed to fetch hotel metrics');
            }
            setData(json);
        } catch (err: unknown) {
            const e = err as Error;
            setError(e.message || 'Error loading hotel dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch existing recommendations
    const fetchRecommendations = async () => {
        if (!hotelId) return;
        setRecosLoading(true);
        try {
            const res = await fetch(`/api/hotel/${hotelId}/recommendations`);
            if (res.ok) {
                const json = await res.json();
                if (json.success && Array.isArray(json.recommendations)) {
                    setRecommendations(json.recommendations);
                }
            }
        } catch (err) {
            console.error('Error fetching recommendations:', err);
        } finally {
            setRecosLoading(false);
        }
    };

    // Fetch hotel ROI analytics
    const fetchRoiData = async () => {
        if (!hotelId) return;
        setRoiLoading(true);
        try {
            const res = await fetch(`/api/hotel/${hotelId}/roi`);
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.roi) {
                    setRoiData(json.roi);
                }
            }
        } catch (err) {
            console.error('Error fetching hotel ROI data:', err);
        } finally {
            setRoiLoading(false);
        }
    };

    useEffect(() => {
        fetchHotelData();
        fetchRecommendations();
        fetchRoiData();
    }, [hotelId]);

    // Generate AI recommendations via Gemini
    const handleGenerateRecommendations = async () => {
        if (!hotelId || generatingRecos) return;
        setGeneratingRecos(true);
        setAiNotification(null);
        try {
            const res = await fetch(`/api/hotel/${hotelId}/recommendations/generate`, {
                method: 'POST'
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to generate recommendations (${res.status})`);
            }
            const json = await res.json();
            if (json.success && Array.isArray(json.recommendations)) {
                setRecommendations(prev => [...json.recommendations, ...prev]);
                setAiNotification(`Gemini generated ${json.recommendations.length} targeted sustainability fixes directly tailored to your telemetry!`);

                const section = document.getElementById('ai-recommendations-section');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } catch (err: unknown) {
            const e = err as Error;
            alert(`Error generating AI recommendations: ${e.message}`);
        } finally {
            setGeneratingRecos(false);
        }
    };

    // Update recommendation status via PATCH and recompute live score
    const handleStatusChange = async (
        recoId: string,
        newStatus: 'Suggested' | 'In Progress' | 'Verified Complete'
    ) => {
        if (!hotelId || updatingRecoId === recoId) return;
        setUpdatingRecoId(recoId);

        const previousRecos = [...recommendations];
        const updatedRecos = recommendations.map(r => (r.id === recoId ? { ...r, status: newStatus } : r));
        setRecommendations(updatedRecos);

        try {
            const res = await fetch(`/api/hotel/${hotelId}/recommendations/${recoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                throw new Error(`Failed to update status (${res.status})`);
            }

            const json = await res.json();
            if (json.success) {
                if (data?.hotel) {
                    const verifiedCount = updatedRecos.filter(r => r.status === 'Verified Complete').length;
                    const newRecoScore =
                        updatedRecos.length > 0
                            ? Math.round((verifiedCount / updatedRecos.length) * 30 * 10) / 10
                            : 0;

                    setData(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            hotel: {
                                ...prev.hotel,
                                green_score: json.updated_score,
                                green_tag: json.updated_tag,
                                score_breakdown: {
                                    ...prev.hotel.score_breakdown,
                                    recommendation_completion: newRecoScore
                                }
                            }
                        };
                    });

                    // Trigger animated score tick-up celebration
                    setScorePulse(true);
                    setTimeout(() => setScorePulse(false), 2200);
                }
            } else {
                setRecommendations(previousRecos);
            }
        } catch (err) {
            console.error('Error updating recommendation status:', err);
            setRecommendations(previousRecos);
        } finally {
            setUpdatingRecoId(null);
        }
    };

    const hotel = data?.hotel;
    const usageList = useMemo(() => data?.usage || [], [data]);

    // Clamped 4-Pillar Breakdown scores (never exceeds maximums)
    const clampedBreakdown = useMemo(() => {
        const raw = hotel?.score_breakdown || {
            resource_efficiency: 0,
            recommendation_completion: 0,
            guest_behavior: 0,
            accessibility_baseline: 0
        };

        const resource_efficiency = clampSubScore(raw.resource_efficiency, 40);
        const recommendation_completion = clampSubScore(raw.recommendation_completion, 30);
        const guest_behavior = clampSubScore(raw.guest_behavior, 20); // strictly clamps bug showing 80/20 -> 16/20
        const accessibility_baseline = clampSubScore(raw.accessibility_baseline, 10);

        return {
            resource_efficiency,
            recommendation_completion,
            guest_behavior,
            accessibility_baseline
        };
    }, [hotel]);

    // Clamped Total Green Score (0–100)
    const clampedTotalScore = useMemo(() => {
        const calculated =
            clampedBreakdown.resource_efficiency +
            clampedBreakdown.recommendation_completion +
            clampedBreakdown.guest_behavior +
            clampedBreakdown.accessibility_baseline;

        return Math.min(100, Math.max(0, Math.round(hotel?.green_score || calculated)));
    }, [clampedBreakdown, hotel?.green_score]);

    // Tag badge styles
    const getTagBadge = (tag: GreenTag | undefined) => {
        switch (tag) {
            case 'Gold':
                return {
                    label: 'Gold Certified',
                    bg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
                    dot: 'bg-emerald-600'
                };
            case 'Silver':
                return {
                    label: 'Silver Certified',
                    bg: 'bg-slate-100 border-slate-300 text-slate-800',
                    dot: 'bg-slate-600'
                };
            case 'Bronze':
                return {
                    label: 'Bronze Certified',
                    bg: 'bg-amber-100 border-amber-300 text-amber-800',
                    dot: 'bg-amber-600'
                };
            default:
                return {
                    label: 'Baseline Onboarded',
                    bg: 'bg-gray-100 border-gray-300 text-gray-700',
                    dot: 'bg-gray-500'
                };
        }
    };

    const tagInfo = getTagBadge(hotel?.green_tag);

    // Chart data mapping
    const chartData = useMemo(() => {
        return usageList.map(row => {
            const dateObj = new Date(row.date);
            const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

            let actual = row.energy_kwh;
            let benchmark = row.energy_benchmark_kwh;
            let unit = 'kWh';

            if (activeMetric === 'water') {
                actual = row.water_liters;
                benchmark = row.water_benchmark_liters;
                unit = 'L';
            } else if (activeMetric === 'food') {
                actual = row.food_waste_kg;
                benchmark = row.food_waste_benchmark_kg;
                unit = 'kg';
            }

            return {
                rawDate: row.date,
                date: formattedDate,
                actual,
                benchmark,
                is_anomaly: row.is_anomaly,
                anomaly_reason: row.anomaly_reason,
                unit
            };
        });
    }, [usageList, activeMetric]);

    // KPI computations
    const kpiMetrics = useMemo(() => {
        const last30 = chartData.slice(-30);
        if (last30.length === 0) {
            return { avg: 0, peak: 0, peakDate: 'N/A', deltaPct: 0 };
        }

        let sumActual = 0;
        let sumBench = 0;
        let peak = 0;
        let peakDate = '';

        for (const item of last30) {
            sumActual += item.actual;
            sumBench += item.benchmark;
            if (item.actual > peak) {
                peak = item.actual;
                peakDate = item.rawDate;
            }
        }

        const avg = Math.round((sumActual / last30.length) * 10) / 10;
        const avgBench = sumBench / last30.length;
        const deltaPct = avgBench > 0 ? Math.round(((avg - avgBench) / avgBench) * 100) : 0;

        return { avg, peak, peakDate, deltaPct };
    }, [chartData]);

    const unitLabel = activeMetric === 'energy' ? 'kWh' : activeMetric === 'water' ? 'L' : 'kg';

    // Anomaly marker dot
    const renderAnomalyDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (payload && payload.is_anomaly) {
            return (
                <g key={`anomaly-dot-${payload.rawDate}`}>
                    <circle cx={cx} cy={cy} r={9} fill="#ef4444" fillOpacity={0.3} className="animate-ping" />
                    <circle cx={cx} cy={cy} r={6} fill="#dc2626" stroke="#ffffff" strokeWidth={2} />
                </g>
            );
        }
        return null;
    };

    // Filter recommendations by category
    const filteredRecommendations = useMemo(() => {
        if (selectedCategory === 'all') return recommendations;
        return recommendations.filter(r => r.category === selectedCategory);
    }, [recommendations, selectedCategory]);

    // 1. REFINED LIGHT-THEMED LOADING SKELETON (zero jarring layout shift)
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8faf8] font-sans pb-24">
                {/* Header Nav Skeleton */}
                <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30 shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
                            <div className="h-5 w-32 bg-slate-100 rounded-md animate-pulse" />
                        </div>
                        <div className="h-8 w-44 bg-slate-100 rounded-lg animate-pulse" />
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
                    {/* Header Hero Card Skeleton */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="space-y-3 w-full max-w-lg">
                            <div className="flex gap-2">
                                <div className="h-6 w-28 bg-slate-100 rounded-full animate-pulse" />
                                <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse" />
                            </div>
                            <div className="h-8 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="h-4 w-1/2 bg-slate-100 rounded-md animate-pulse" />
                        </div>
                        <div className="w-full lg:w-72 h-24 bg-slate-50 border border-slate-200/60 rounded-xl p-4 animate-pulse" />
                    </div>

                    {/* 4-Pillar Score Grid Skeleton */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 sm:p-7 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="h-6 w-56 bg-slate-100 rounded-md animate-pulse" />
                            <div className="h-7 w-28 bg-slate-100 rounded-md animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse" />
                                        <div className="h-4 w-12 bg-slate-100 rounded-md animate-pulse" />
                                    </div>
                                    <div className="h-2 w-full bg-slate-200/80 rounded-full animate-pulse" />
                                    <div className="h-3 w-4/5 bg-slate-100 rounded-md animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Telemetry Chart Skeleton */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 sm:p-7 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <div className="h-6 w-64 bg-slate-100 rounded-md animate-pulse" />
                                <div className="h-4 w-44 bg-slate-100 rounded-md animate-pulse" />
                            </div>
                            <div className="h-8 w-64 bg-slate-100 rounded-xl animate-pulse" />
                        </div>
                        <div className="h-80 w-full bg-slate-50/70 rounded-xl border border-dashed border-slate-200 animate-pulse flex items-center justify-center">
                            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                    <h2 className="text-xl font-bold text-slate-800">Hotel Telemetry Unavailable</h2>
                    <p className="text-slate-600 text-sm">{error || 'Could not locate the requested eco-hotel.'}</p>
                    <div className="pt-2 flex gap-3 justify-center">
                        <button
                            onClick={fetchHotelData}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition cursor-pointer"
                        >
                            Retry
                        </button>
                        <Link
                            href="/api/seed"
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                        >
                            Run Seed API
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faf8] text-slate-900 font-sans pb-24">
            {/* Top Navigation Bar with Hotel Switcher */}
            <header className="border-b border-emerald-100/80 bg-white/90 backdrop-blur sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Leaf className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-bold text-slate-900 tracking-tight text-lg">GreenYatra</span>
                            <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                Hotel ESG OS
                            </span>
                        </div>
                    </div>

                    {/* 2. Hotel Switcher in Header */}
                    <div className="relative">
                        <button
                            onClick={() => setShowHotelDropdown(!showHotelDropdown)}
                            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-800 transition cursor-pointer shadow-2xs"
                        >
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="max-w-[160px] sm:max-w-[240px] truncate">{hotel.name}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showHotelDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showHotelDropdown && (
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                                    <span>Select Demo Eco-Hotel</span>
                                    <span className="text-emerald-700 font-semibold">{hotelsList.length} properties</span>
                                </div>
                                <div className="max-h-72 overflow-y-auto space-y-1">
                                    {hotelsList.map(h => {
                                        const isCurrent = h.id === hotelId;
                                        const isTamara = h.name.includes('Tamara');
                                        return (
                                            <button
                                                key={h.id}
                                                onClick={() => {
                                                    setShowHotelDropdown(false);
                                                    if (h.id !== hotelId) {
                                                        router.push(`/hotel/${h.id}`);
                                                    }
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                                                    isCurrent
                                                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                                                        : 'hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                <div className="space-y-0.5 max-w-[210px] sm:max-w-[260px]">
                                                    <div className="font-semibold truncate">{h.name}</div>
                                                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                                        <span>{h.city}</span>
                                                        {isTamara && (
                                                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                                                HVAC Anomaly
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                                                        Score: {h.green_score}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/traveler"
                            className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition shadow-2xs"
                        >
                            <span>{isReadOnlyTraveler ? 'Return to Trip Planner' : 'Switch to Traveler View'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Operator Auth Details & Logout */}
                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl py-1 px-2.5">
                                <div className={`w-6 h-6 rounded-lg text-white font-bold text-xs flex items-center justify-center ${isReadOnlyTraveler ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : (isReadOnlyTraveler ? 'T' : 'O')}
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                                        {user?.fullName || (isReadOnlyTraveler ? 'Traveler Guest' : 'Operator Demo')}
                                    </p>
                                    <span
                                        className={`text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded border block ${
                                            isReadOnlyTraveler
                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                : 'bg-slate-200/70 text-slate-700 border-slate-300'
                                        }`}
                                    >
                                        {isReadOnlyTraveler ? 'TRAVELER' : 'HOTEL OPERATOR'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleSignOut}
                                title="Sign Out"
                                className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
                {/* Read-Only Traveler Preview Notice */}
                {isReadOnlyTraveler && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                                <ShieldCheck className="w-5 h-5 text-amber-700" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                                        Read-Only Traveler Preview
                                    </span>
                                    <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                                        Public Verification Mode
                                    </span>
                                </div>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    You are viewing this eco-certified resort&apos;s verified ESG telemetry as a <strong className="font-semibold text-amber-950">Traveler</strong>. Operational mutations, AI resolution generation, and task status toggles are restricted to authorized hotel operators.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/traveler"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-amber-100/60 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 shadow-2xs transition shrink-0"
                        >
                            <span>Return to Trip Planner</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
                {/* Section 1: Hotel Title & Main Green Score Hero */}
                <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tagInfo.bg}`}>
                                <span className={`w-2 h-2 rounded-full ${tagInfo.dot}`} />
                                {tagInfo.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {hotel.city}, India
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                {hotel.name}
                            </h1>
                            <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                {hotel.address || `${hotel.city}, India`}
                            </p>
                        </div>
                    </div>

                    {/* Prominent Green Score Card (with tick-up pulse animation) */}
                    <div
                        className={`w-full lg:w-auto border rounded-xl p-5 flex items-center justify-between lg:justify-start gap-6 shrink-0 transition-all duration-700 ${
                            scorePulse
                                ? 'bg-emerald-100/90 border-emerald-400 ring-4 ring-emerald-300/60 scale-105 shadow-md'
                                : 'bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 border-emerald-200/80 shadow-xs'
                        }`}
                    >
                        <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Verified Green Score</span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {clampedTotalScore}
                                </span>
                                <span className="text-slate-500 text-sm font-semibold">/ 100</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-800">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Appearing in ~34% more searches
                            </div>
                        </div>

                        <div className="h-14 w-14 rounded-xl bg-white border border-emerald-200 shadow-xs flex items-center justify-center shrink-0">
                            <Award className="w-7 h-7 text-emerald-600" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Active Anomaly Alert Banner */}
                {data.has_recent_anomaly && data.recent_anomaly && (
                    <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                                <AlertTriangle className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-rose-900">
                                        Active Telemetry Anomaly Detected
                                    </h4>
                                    <span className="text-[11px] font-semibold bg-rose-200/70 text-rose-800 px-2 py-0.5 rounded-full">
                                        {data.recent_anomaly.date}
                                    </span>
                                </div>
                                <p className="text-xs text-rose-800 mt-1 leading-relaxed max-w-3xl">
                                    {data.recent_anomaly.anomaly_reason ||
                                        'Significant power surge (+55% over benchmark) logged by hotel smart sensors.'}
                                </p>
                            </div>
                        </div>

                        {!isReadOnlyTraveler ? (
                            <button
                                onClick={handleGenerateRecommendations}
                                disabled={generatingRecos}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 text-white rounded-xl text-xs font-semibold shadow-xs transition hover:shadow cursor-pointer shrink-0"
                            >
                                {generatingRecos ? (
                                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                )}
                                <span>{generatingRecos ? 'Gemini Analyzing...' : 'Generate AI Resolution'}</span>
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-800 rounded-xl text-xs font-semibold border border-rose-200 shrink-0">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Operator Attention Required</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Notification toast if AI recommendations were just generated */}
                {aiNotification && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center justify-between text-xs font-medium shadow-xs">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span>{aiNotification}</span>
                        </div>
                        <button
                            onClick={() => setAiNotification(null)}
                            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Section 3: 3. Clamped Anti-Greenwashing Score Breakdown Card */}
                <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-7 flex items-center justify-between border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    Anti-Greenwashing Score Transparency
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500">
                                Strictly clamped 4-pillar formula. Scores are derived directly from verified sensors, audits, and guest behaviors.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                        >
                            <span>{showBreakdown ? 'Collapse Formula' : 'Expand Formula'}</span>
                            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    {showBreakdown && (
                        <div className="p-6 sm:p-7 bg-slate-50/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Pillar 1: Resource Efficiency (Clamped to 40 max) */}
                            <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">Resource Efficiency</span>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        40% Weight
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                                        <span className="text-slate-500">Score Earned</span>
                                        <span className="font-bold text-slate-900">
                                            {clampedBreakdown.resource_efficiency} <span className="text-slate-400 font-normal">/ 40 pts</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                                            style={{ width: `${(clampedBreakdown.resource_efficiency / 40) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug">
                                    Actual 30-day telemetry benchmarking kWh, water liters, and waste vs local targets.
                                </p>
                            </div>

                            {/* Pillar 2: Reco Completion (Clamped to 30 max) */}
                            <div className={`bg-white rounded-xl p-4 border shadow-2xs space-y-3 transition-colors duration-500 ${scorePulse ? 'border-sky-400 bg-sky-50/40 ring-2 ring-sky-200' : 'border-emerald-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">Reco Completion</span>
                                    </div>
                                    <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md">
                                        30% Weight
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                                        <span className="text-slate-500">Score Earned</span>
                                        <span className="font-bold text-sky-700">
                                            {clampedBreakdown.recommendation_completion} <span className="text-slate-400 font-normal">/ 30 pts</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-sky-500 h-2 rounded-full transition-all duration-700"
                                            style={{ width: `${(clampedBreakdown.recommendation_completion / 30) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug">
                                    Percentage of AI-diagnosed engineering retrofits marked Verified Complete.
                                </p>
                            </div>

                            {/* Pillar 3: Guest Eco-Behavior (Clamped to 20 max - fixed bug) */}
                            <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                                            <Flame className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">Guest Behavior</span>
                                    </div>
                                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                                        20% Weight
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                                        <span className="text-slate-500">Score Earned</span>
                                        <span className="font-bold text-slate-900">
                                            {clampedBreakdown.guest_behavior} <span className="text-slate-400 font-normal">/ 20 pts</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-amber-500 h-2 rounded-full transition-all duration-700"
                                            style={{ width: `${(clampedBreakdown.guest_behavior / 20) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug">
                                    Guest opt-in actions: linen reuse, towel reuse, and 24°C eco-mode compliance.
                                </p>
                            </div>

                            {/* Pillar 4: Accessibility Baseline (Clamped to 10 max) */}
                            <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">Accessibility Audit</span>
                                    </div>
                                    <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md">
                                        10% Weight
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                                        <span className="text-slate-500">Score Earned</span>
                                        <span className="font-bold text-slate-900">
                                            {clampedBreakdown.accessibility_baseline} <span className="text-slate-400 font-normal">/ 10 pts</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-2 rounded-full transition-all duration-700"
                                            style={{ width: `${(clampedBreakdown.accessibility_baseline / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug">
                                    Physical audit verification: step-free access, wheelchair, and sensory support.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 4: Resource Consumption Telemetry (Interactive Recharts) */}
                <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-sm p-6 sm:p-7 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Resource Consumption Telemetry</h3>
                            <p className="text-xs text-slate-500">
                                Daily actual meter logs vs local peer benchmarks over 90 continuous days.
                            </p>
                        </div>

                        {/* Metric Toggle Tabs */}
                        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setActiveMetric('energy')}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    activeMetric === 'energy'
                                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span>Energy (kWh)</span>
                            </button>

                            <button
                                onClick={() => setActiveMetric('water')}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    activeMetric === 'water'
                                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                                <span>Water (Liters)</span>
                            </button>

                            <button
                                onClick={() => setActiveMetric('food')}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    activeMetric === 'food'
                                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Trash2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Food Waste (kg)</span>
                            </button>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-80 w-full pt-2">
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        interval={12}
                                    />
                                    <YAxis
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        unit={` ${unitLabel}`}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 text-xs shadow-lg space-y-1.5">
                                                        <div className="font-semibold text-slate-300 flex items-center justify-between gap-4">
                                                            <span>{d.rawDate}</span>
                                                            {d.is_anomaly && (
                                                                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                                    ANOMALY
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-emerald-400 font-bold text-sm">
                                                            Actual: {d.actual.toLocaleString()} {d.unit}
                                                        </div>
                                                        <div className="text-slate-400">
                                                            Peer Benchmark: {d.benchmark.toLocaleString()} {d.unit}
                                                        </div>
                                                        {d.anomaly_reason && (
                                                            <div className="text-rose-300 text-[11px] pt-1 border-t border-slate-700">
                                                                {d.anomaly_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="actual"
                                        name="Actual Daily Usage"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#emeraldGradient)"
                                        dot={renderAnomalyDot}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="benchmark"
                                        name="Peer Benchmark"
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                        strokeDasharray="4 4"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
                        )}
                    </div>

                    {/* Quick KPI Cards Below Chart */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                30-Day Average
                            </span>
                            <div className="text-xl font-bold text-slate-900 mt-0.5">
                                {kpiMetrics.avg.toLocaleString()} <span className="text-xs text-slate-500">{unitLabel}/day</span>
                            </div>
                        </div>

                        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Peak Logged Day
                            </span>
                            <div className="text-xl font-bold text-slate-900 mt-0.5">
                                {kpiMetrics.peak.toLocaleString()} <span className="text-xs text-slate-500">{unitLabel}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{kpiMetrics.peakDate}</span>
                        </div>

                        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Delta vs Benchmark
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                    className={`text-xl font-bold ${
                                        kpiMetrics.deltaPct > 0 ? 'text-rose-600' : 'text-emerald-700'
                                    }`}
                                >
                                    {kpiMetrics.deltaPct > 0 ? `+${kpiMetrics.deltaPct}%` : `${kpiMetrics.deltaPct}%`}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {kpiMetrics.deltaPct > 0 ? 'above peer target' : 'below peer target'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. PROMINENT DEDICATED AI RECOMMENDATIONS SECTION DIRECTLY BELOW CHART */}
                <div
                    id="ai-recommendations-section"
                    className="bg-white rounded-2xl border border-emerald-100/90 shadow-sm p-6 sm:p-7 space-y-6 scroll-mt-20"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                                    <BrainCircuit className="w-5 h-5 text-emerald-700" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    AI Sustainability Audit & Action Items
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500">
                                Gemini 3.6-Flash evaluates your 14-day telemetry and sensor spikes to prescribe high-impact retrofits. Marking fixes Complete updates your live Green Score!
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Category Filter Pills */}
                            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${selectedCategory === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    All ({recommendations.length})
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('energy')}
                                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${selectedCategory === 'energy' ? 'bg-white text-amber-800 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Energy
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('water')}
                                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${selectedCategory === 'water' ? 'bg-white text-sky-800 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Water
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('food_waste')}
                                    className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${selectedCategory === 'food_waste' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Waste
                                </button>
                            </div>

                            {/* Primary Generate AI Recommendations Button (Hidden for Read-Only Travelers) */}
                            {!isReadOnlyTraveler ? (
                                <button
                                    onClick={handleGenerateRecommendations}
                                    disabled={generatingRecos}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-xs transition hover:shadow cursor-pointer shrink-0"
                                >
                                    {generatingRecos ? (
                                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                    )}
                                    <span>{generatingRecos ? 'Gemini Analyzing Telemetry...' : 'Generate AI Recommendations'}</span>
                                </button>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200">
                                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Verified Recommendations (Read-Only)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recommendations Cards Grid */}
                    {recosLoading ? (
                        <div className="space-y-4">
                            <div className="h-28 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
                            <div className="h-28 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
                        </div>
                    ) : filteredRecommendations.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl p-8 space-y-3">
                            <BrainCircuit className="w-10 h-10 text-emerald-500 mx-auto" />
                            <h4 className="text-sm font-bold text-slate-800">No Action Items in this Category</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Click &quot;Generate AI Recommendations&quot; above to have Gemini 3.6-Flash audit your resource usage and propose optimizations.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredRecommendations.map(reco => {
                                const isUpdating = updatingRecoId === reco.id;

                                // Category styling
                                let categoryBadge = {
                                    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                                    icon: <Trash2 className="w-3.5 h-3.5 text-emerald-600" />,
                                    label: 'Food Waste'
                                };

                                if (reco.category === 'energy') {
                                    categoryBadge = {
                                        bg: 'bg-amber-50 text-amber-800 border-amber-200',
                                        icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
                                        label: 'Energy'
                                    };
                                } else if (reco.category === 'water') {
                                    categoryBadge = {
                                        bg: 'bg-sky-50 text-sky-800 border-sky-200',
                                        icon: <Droplets className="w-3.5 h-3.5 text-sky-600" />,
                                        label: 'Water'
                                    };
                                }

                                return (
                                    <div
                                        key={reco.id}
                                        className={`rounded-xl border p-5 space-y-3.5 transition-all duration-300 ${
                                            reco.status === 'Verified Complete'
                                                ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                                                : reco.status === 'In Progress'
                                                ? 'bg-sky-50/30 border-sky-200 shadow-2xs'
                                                : 'bg-white border-slate-200 shadow-2xs'
                                        }`}
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${categoryBadge.bg}`}>
                                                    {categoryBadge.icon}
                                                    <span>{categoryBadge.label}</span>
                                                </span>
                                                {reco.status === 'Verified Complete' && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                        Verified Complete
                                                    </span>
                                                )}
                                            </div>

                                            {/* Status Selector Dropdown / Button Group for Operators or Static Pill for Travelers */}
                                            {!isReadOnlyTraveler ? (
                                                <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200 text-[11px] shrink-0">
                                                    <button
                                                        onClick={() => handleStatusChange(reco.id, 'Suggested')}
                                                        disabled={isUpdating}
                                                        className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                                                            reco.status === 'Suggested'
                                                                ? 'bg-white text-slate-800 font-bold shadow-2xs'
                                                                : 'text-slate-500 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        Suggested
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(reco.id, 'In Progress')}
                                                        disabled={isUpdating}
                                                        className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                                                            reco.status === 'In Progress'
                                                                ? 'bg-sky-600 text-white font-bold shadow-2xs'
                                                                : 'text-slate-500 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        In Progress
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(reco.id, 'Verified Complete')}
                                                        disabled={isUpdating}
                                                        className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                                                            reco.status === 'Verified Complete'
                                                                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                                                                : 'text-slate-500 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        Complete
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
                                                        reco.status === 'Verified Complete'
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                            : reco.status === 'In Progress'
                                                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                                                            : 'bg-slate-100 text-slate-700 border-slate-300'
                                                    }`}
                                                >
                                                    {reco.status}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title & Description */}
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                                {reco.title}
                                            </h4>
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                {reco.description}
                                            </p>
                                        </div>

                                        {/* Estimated Impact Badge */}
                                        <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
                                            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-100/70 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                                                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                                                <span>{reco.estimated_impact}</span>
                                            </div>

                                            {isUpdating && (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                    Syncing score...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Section 5: Eco-Loyalty Financial ROI Tracker */}
                <div id="roi-tracker" className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Eco-Loyalty Financial ROI Tracker</span>
                                </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                Loyalty Program Profitability &amp; Resource Savings
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Proving sustainability is a profit center, not a cost center.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                                onClick={fetchRoiData}
                                disabled={roiLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
                                title="Refresh financial ROI calculations"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${roiLoading ? 'animate-spin' : ''}`} />
                                <span>Sync ROI</span>
                            </button>
                        </div>
                    </div>

                    {/* 4-Card Financial KPI Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Net Financial Profit */}
                        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 rounded-2xl p-5 border border-emerald-200/90 shadow-2xs flex flex-col justify-between space-y-3">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Net Financial Profit
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>ROI Positive</span>
                                </span>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-emerald-600 tracking-tight">
                                    +₹{(roiData?.net_profit_inr || 0).toLocaleString('en-IN')}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Net margin saved after all guest perks
                                </p>
                            </div>
                        </div>

                        {/* 2. Gross Operational Savings */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Gross Operational Savings
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                                    Utility &amp; Labor
                                </span>
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    ₹{(roiData?.gross_savings_inr || 0).toLocaleString('en-IN')}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Saved on laundry, HVAC power &amp; housekeeping
                                </p>
                            </div>
                        </div>

                        {/* 3. Rewards Payout */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Rewards Payout
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                    Perks Cost
                                </span>
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    ₹{(roiData?.rewards_cost_inr || 0).toLocaleString('en-IN')}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Total cost of guest perks redeemed
                                </p>
                            </div>
                        </div>

                        {/* 4. Guest Participation Rate */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Participation Rate
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                                    {roiData?.opted_in_stays || 0} / {roiData?.total_stays || 0} Stays
                                </span>
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {roiData?.participation_rate || 0}%
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Guests active in daily eco-actions
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Transparent Unit Economics Card */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowEconomicsPanel(prev => !prev)}
                            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/60 transition cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold text-sm text-slate-900 block">
                                        Transparent Unit Economics &amp; Financial Model
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Average value generated: <strong className="text-emerald-700 font-bold">+₹{(roiData?.avg_savings_per_guest || 0).toLocaleString('en-IN')}</strong> per participating guest stay
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                                <span>{showEconomicsPanel ? 'Hide Details' : 'View Breakdown'}</span>
                                {showEconomicsPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </button>

                        {showEconomicsPanel && (
                            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-slate-200/60 mt-1 animate-fadeIn">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
                                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                                            🧺 Linen Skip
                                        </span>
                                        <div className="text-sm font-extrabold text-slate-900">
                                            +₹250 / action
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-tight">
                                            Laundry water, power &amp; labor savings
                                        </p>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                                        <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                                            ❄️ AC at 24°C+
                                        </span>
                                        <div className="text-sm font-extrabold text-slate-900">
                                            +₹120 / action
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-tight">
                                            Compressor cooling cycle reduction
                                        </p>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                                        <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                                            🚿 Towel Reuse
                                        </span>
                                        <div className="text-sm font-extrabold text-slate-900">
                                            +₹80 / action
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-tight">
                                            Hot water boiler &amp; wash detergent savings
                                        </p>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                                            🎁 Reward Costs
                                        </span>
                                        <div className="text-sm font-extrabold text-slate-900">
                                            ₹0 – ₹120 / perk
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-tight">
                                            Cocktail ₹120, Dessert ₹60, Late Checkout ₹0
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>
                                            Average net value generation: <strong>+₹{(roiData?.avg_savings_per_guest || 0).toLocaleString('en-IN')}</strong> per guest room. Verified by IoT submetering &amp; front-desk stay ledger.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 6: Action Bar / Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Recommendations Quick Jumper Card */}
                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                                <BrainCircuit className="w-5 h-5" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900">
                                Verified Action Ledger
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                {recommendations.filter(r => r.status === 'Verified Complete').length} of {recommendations.length} action items marked Complete. Completed work orders directly contribute up to +30 points to your verified Green Score.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                const el = document.getElementById('ai-recommendations-section');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 hover:text-sky-800 transition cursor-pointer"
                        >
                            <span>Manage Recommendations</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Guest Loyalty ROI Tracker Link Card */}
                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900">
                                Guest Loyalty Green ROI Tracker
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Track points accumulated and redeemed by eco-conscious travelers. Verify laundry water saved, HVAC kilowatt-hours deferred, and net profit margin improvement.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                const el = document.getElementById('roi-tracker');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                        >
                            <span>View Financial ROI Analysis</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
