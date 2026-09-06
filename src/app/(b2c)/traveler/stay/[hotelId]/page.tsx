'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    Sparkles,
    ThermometerSnowflake,
    Waves,
    Wine,
    Coffee,
    Clock,
    CheckCircle2,
    Coins,
    Gift,
    Award,
    Copy,
    Check,
    X,
    QrCode,
    PartyPopper,
    AlertCircle,
    Loader2,
    MapPin,
    ShieldCheck
} from 'lucide-react';
import type { Hotel, Stay, GuestAction } from '@/types/database';

interface EcoNudge {
    id: 'linen' | 'ac' | 'towel';
    title: string;
    points: number;
    impact: string;
    icon: typeof Sparkles;
    colorClass: string;
}

const ECO_NUDGES: EcoNudge[] = [
    {
        id: 'linen',
        title: 'Skip Housekeeping Today',
        points: 50,
        impact: 'Conserves ~250L of laundry water & eliminates detergent runoff',
        icon: Sparkles,
        colorClass: 'from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-200'
    },
    {
        id: 'ac',
        title: 'Keep AC set to 24°C',
        points: 50,
        impact: 'Cuts HVAC compressor power strain by ~35% during peak heat hours',
        icon: ThermometerSnowflake,
        colorClass: 'from-sky-500/20 to-sky-500/5 text-sky-600 border-sky-200'
    },
    {
        id: 'towel',
        title: 'Reuse Bathroom Towels',
        points: 50,
        impact: 'Saves water heating boiler energy and micro-fiber shedding',
        icon: Waves,
        colorClass: 'from-teal-500/20 to-teal-500/5 text-teal-600 border-teal-200'
    }
];

interface PerkItem {
    id: string;
    title: string;
    cost: number;
    description: string;
    icon: typeof Wine;
    tag: string;
}

const PERKS: PerkItem[] = [
    {
        id: 'cocktail',
        title: 'Complimentary Signature Cocktail',
        cost: 100,
        description: 'Handcrafted botanical cocktail or mocktail at the organic sunset lounge',
        icon: Wine,
        tag: 'Sunset Bar & Lounge'
    },
    {
        id: 'dessert',
        title: 'Artisanal Organic Dessert',
        cost: 75,
        description: "Chef's seasonal farm-to-table dessert with locally harvested wild honey",
        icon: Coffee,
        tag: 'The Green Table Bistro'
    },
    {
        id: 'late_checkout',
        title: 'Guaranteed 2:00 PM Late Checkout',
        cost: 150,
        description: 'Relax longer on departure day with guaranteed late keycard access',
        icon: Clock,
        tag: 'Front Desk Concierge'
    }
];

interface RedeemedVoucher {
    code: string;
    title: string;
    cost: number;
    redeemedAt: string;
}

export default function StayModePage() {
    const params = useParams();
    const hotelId = (params?.hotelId as string) || '';

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [stay, setStay] = useState<Stay | null>(null);

    // Action execution state
    const [actingActionId, setActingActionId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Redemption state
    const [redeemingPerkId, setRedeemingPerkId] = useState<string | null>(null);
    const [activeVoucherModal, setActiveVoucherModal] = useState<RedeemedVoucher | null>(null);
    const [redeemedList, setRedeemedList] = useState<RedeemedVoucher[]>([]);
    const [copiedCode, setCopiedCode] = useState<boolean>(false);

    // On mount: initialize stay & fetch hotel info
    useEffect(() => {
        if (!hotelId) return;

        let isMounted = true;
        const initializeStayMode = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Fetch or create simulated stay via POST /api/stay/checkin
                const stayRes = await fetch('/api/stay/checkin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hotel_id: hotelId })
                });
                const stayData = await stayRes.json();

                if (!stayRes.ok || !stayData.success) {
                    throw new Error(stayData.error || 'Failed to initialize active stay.');
                }

                // 2. Fetch hotel details from /api/hotels/[id]
                const hotelRes = await fetch(`/api/hotels/${hotelId}`);
                const hotelData = await hotelRes.json();

                if (isMounted) {
                    setStay(stayData.stay);
                    if (hotelRes.ok && hotelData.success) {
                        setHotel(hotelData.hotel);
                    }

                    // If the stay already had a redemption code recorded, add to voucher history
                    if (stayData.stay?.redemption_code) {
                        setRedeemedList([
                            {
                                code: stayData.stay.redemption_code,
                                title: 'Active In-Stay Perk',
                                cost: stayData.stay.points_redeemed || 0,
                                redeemedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                        ]);
                    }
                }
            } catch (err: unknown) {
                const errorObj = err as Error;
                if (isMounted) {
                    setError(errorObj.message || 'Unable to load Stay Mode.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeStayMode();

        return () => {
            isMounted = false;
        };
    }, [hotelId]);

    // Handle executing daily eco-nudge action
    const handleTriggerAction = async (nudge: EcoNudge) => {
        if (!stay?.id || actingActionId) return;

        setActingActionId(nudge.id);
        try {
            const res = await fetch(`/api/stay/${stay.id}/action`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action_id: nudge.id,
                    points: nudge.points,
                    title: nudge.title
                })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to register action.');
            }

            // Update stay state immediately
            setStay(data.stay);

            // Trigger success toast
            setToastMessage(`+${nudge.points} Eco-Points Earned! 🌱`);
            setTimeout(() => setToastMessage(null), 3500);
        } catch (err: unknown) {
            const errObj = err as Error;
            alert(errObj.message || 'Error recording eco-action. Please try again.');
        } finally {
            setActingActionId(null);
        }
    };

    // Handle perk redemption
    const handleRedeemPerk = async (perk: PerkItem) => {
        if (!stay?.id || redeemingPerkId) return;

        const available = (stay.points_accumulated || 0) - (stay.points_redeemed || 0);
        if (available < perk.cost) {
            alert('Insufficient points to redeem this perk.');
            return;
        }

        setRedeemingPerkId(perk.id);
        try {
            const res = await fetch(`/api/stay/${stay.id}/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reward_title: perk.title,
                    cost_points: perk.cost
                })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to redeem reward.');
            }

            // Update local stay points
            setStay((prev) =>
                prev
                    ? {
                          ...prev,
                          points_redeemed: (prev.points_redeemed || 0) + perk.cost,
                          redemption_code: data.redemption_code
                      }
                    : null
            );

            const voucherObj: RedeemedVoucher = {
                code: data.redemption_code,
                title: perk.title,
                cost: perk.cost,
                redeemedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setActiveVoucherModal(voucherObj);
            setRedeemedList((prev) => [voucherObj, ...prev]);
        } catch (err: unknown) {
            const errObj = err as Error;
            alert(errObj.message || 'Failed to redeem perk.');
        } finally {
            setRedeemingPerkId(null);
        }
    };

    // Copy voucher code to clipboard
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    // Calculate wallet metrics
    const pointsAccumulated = stay?.points_accumulated || 0;
    const pointsRedeemed = stay?.points_redeemed || 0;
    const availablePoints = Math.max(0, pointsAccumulated - pointsRedeemed);

    // Set of completed action IDs during this stay
    const completedActionIds = new Set(
        (stay?.actions_completed || []).map((a: GuestAction) => a.action_id)
    );

    // Loading Skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
                <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="w-36 h-8 bg-slate-200 rounded-xl animate-pulse" />
                        <div className="w-28 h-8 bg-slate-200 rounded-xl animate-pulse" />
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-pulse">
                    <div className="w-full h-44 rounded-3xl bg-slate-200" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-44 bg-white rounded-2xl border border-slate-200/80" />
                        <div className="h-44 bg-white rounded-2xl border border-slate-200/80" />
                        <div className="h-44 bg-white rounded-2xl border border-slate-200/80" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-56 bg-white rounded-2xl border border-slate-200/80" />
                        <div className="h-56 bg-white rounded-2xl border border-slate-200/80" />
                        <div className="h-56 bg-white rounded-2xl border border-slate-200/80" />
                    </div>
                </main>
            </div>
        );
    }

    // Error State
    if (error || !stay) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
                <header className="bg-white border-b border-slate-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                        <Link
                            href={`/traveler/hotels/${hotelId}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Hotel Details</span>
                        </Link>
                    </div>
                </header>

                <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Stay Mode Unavailable</h1>
                    <p className="text-xs sm:text-sm text-slate-600">
                        {error || 'Unable to connect to active stay session for this property.'}
                    </p>
                    <div className="pt-2">
                        <Link
                            href={`/traveler/hotels/${hotelId}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Hotel Overview</span>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Success Toast */}
            {toastMessage && (
                <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce">
                    <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold border border-emerald-400">
                        <PartyPopper className="w-4 h-4" />
                        <span>{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link
                        href={`/traveler/hotels/${hotelId}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-600" />
                        <span>Hotel Details</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Stay Mode Active</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stay Mode Header Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <h2 className="font-bold text-sm text-slate-600 uppercase tracking-wide">
                                {hotel?.name || 'Verified Eco-Property'}
                            </h2>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Welcome, {stay.guest_name || 'Guest'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700 border border-slate-200/80">
                                Room {stay.room_number || '304'}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                                ✓ Checked In
                            </span>
                            <span className="text-slate-400">
                                2-Night Sustainable Stay
                            </span>
                        </div>
                    </div>

                    {/* Live Points Wallet Card */}
                    <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-2xl p-5 shadow-md flex items-center gap-5 shrink-0 border border-emerald-400/30">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                            <Coins className="w-6 h-6 text-amber-300" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
                                Available Eco-Points
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-3xl font-black text-white tracking-tight">
                                    {availablePoints}
                                </span>
                                <span className="text-xs text-emerald-200 font-medium">pts</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-emerald-200/90 mt-1">
                                <span>Earned: {pointsAccumulated}</span>
                                <span>•</span>
                                <span>Redeemed: {pointsRedeemed}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Eco-Nudges Section */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-600" />
                            <span>Daily In-Stay Eco-Nudges</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Take small actions in your room to immediately reduce hotel energy and water usage while earning instant points.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ECO_NUDGES.map((nudge) => {
                            const IconComponent = nudge.icon;
                            const isCompleted = completedActionIds.has(nudge.id);
                            const isProcessing = actingActionId === nudge.id;

                            return (
                                <div
                                    key={nudge.id}
                                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all space-y-4 ${
                                        isCompleted
                                            ? 'border-emerald-300 bg-emerald-50/20 shadow-2xs'
                                            : 'border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center bg-gradient-to-b ${nudge.colorClass}`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                +{nudge.points} pts
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900">
                                                {nudge.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {nudge.impact}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            disabled={isCompleted || isProcessing}
                                            onClick={() => handleTriggerAction(nudge)}
                                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                isCompleted
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                                                    : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-2xs disabled:bg-slate-300'
                                            }`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Registering Action...</span>
                                                </>
                                            ) : isCompleted ? (
                                                <>
                                                    <Check className="w-4 h-4 text-emerald-700" />
                                                    <span>Completed (+{nudge.points} pts)</span>
                                                </>
                                            ) : (
                                                <span>Opt-In &amp; Earn +{nudge.points} pts</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* In-Hotel Rewards Catalog */}
                <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Gift className="w-5 h-5 text-emerald-600" />
                                <span>In-Hotel Rewards Catalog</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Instantly redeem your earned eco-points for verified on-property amenities.
                            </p>
                        </div>
                        <span className="text-xs text-slate-600 font-medium self-start sm:self-auto">
                            Available Balance: <strong className="text-emerald-700">{availablePoints} pts</strong>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PERKS.map((perk) => {
                            const IconComp = perk.icon;
                            const canAfford = availablePoints >= perk.cost;
                            const isProcessing = redeemingPerkId === perk.id;

                            return (
                                <div
                                    key={perk.id}
                                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs p-5 flex flex-col justify-between space-y-4"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                                                <IconComp className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                {perk.cost} pts
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                {perk.tag}
                                            </span>
                                            <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                                                {perk.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {perk.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            disabled={!canAfford || isProcessing}
                                            onClick={() => handleRedeemPerk(perk)}
                                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                canAfford
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                            }`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Issuing Voucher...</span>
                                                </>
                                            ) : canAfford ? (
                                                <span>Redeem Voucher ({perk.cost} pts)</span>
                                            ) : (
                                                <span>Need {perk.cost - availablePoints} More Pts</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Vouchers History (if any) */}
                {redeemedList.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-600" />
                                <span>Your Active In-Stay Vouchers</span>
                            </h4>
                            <span className="text-xs text-slate-500">
                                Present to staff upon ordering or checkout
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {redeemedList.map((v, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between gap-3"
                                >
                                    <div className="space-y-0.5">
                                        <span className="font-bold text-xs text-slate-900 block">
                                            {v.title}
                                        </span>
                                        <code className="font-mono text-xs font-black text-emerald-800 tracking-wider">
                                            {v.code}
                                        </code>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyCode(v.code)}
                                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer shrink-0"
                                        title="Copy Voucher Code"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Voucher Confirmed Modal */}
            {activeVoucherModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 text-center">
                        {/* Header icon */}
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                            <PartyPopper className="w-7 h-7" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                Voucher Confirmed!
                            </h3>
                            <p className="text-xs text-slate-500">
                                {activeVoucherModal.title} has been credited to your room portfolio.
                            </p>
                        </div>

                        {/* Voucher Display Card */}
                        <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                Voucher Redemption Code
                            </span>
                            <div className="flex items-center justify-center gap-2">
                                <code className="font-mono text-lg font-black text-emerald-800 tracking-wider">
                                    {activeVoucherModal.code}
                                </code>
                                <button
                                    type="button"
                                    onClick={() => handleCopyCode(activeVoucherModal.code)}
                                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                                    title="Copy code"
                                >
                                    {copiedCode ? (
                                        <Check className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                                Cost: {activeVoucherModal.cost} pts
                            </span>
                        </div>

                        {/* Instructions */}
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-left flex items-start gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-950 leading-relaxed">
                                Simply show this screen or provide the voucher code to front desk or waitstaff at redemption. No printout required.
                            </p>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setActiveVoucherModal(null)}
                                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
