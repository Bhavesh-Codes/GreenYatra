'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import AppNavbar from '@/components/AppNavbar';
import { Loader2, Building2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function HotelIndexPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [statusMessage, setStatusMessage] = useState<string>('Resolving hotel property dashboard...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoading) return;

        // 1. If not authenticated, redirect to hotel operator sign in
        if (!user) {
            router.replace('/auth/hotel?redirect=/hotel');
            return;
        }

        const currentUser = user;

        // 2. If logged in as traveler, redirect to trip planner
        if (currentUser.role !== 'hotel') {
            router.replace('/traveler');
            return;
        }

        // 3. Operator ownership lookup
        async function resolveHotelDestination() {
            try {
                setStatusMessage('Locating your registered properties...');

                // Check if this operator already owns a hotel in Supabase
                const { data: ownedHotels, error: queryErr } = await supabase
                    .from('hotels')
                    .select('id, name')
                    .eq('owner_user_id', currentUser.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (queryErr) {
                    console.warn('[HotelIndex] Error querying operator hotels:', queryErr);
                }

                if (ownedHotels && ownedHotels.length > 0) {
                    router.replace(`/hotel/${ownedHotels[0].id}`);
                    return;
                }

                // If demo operator (e.g. demo email or seed account), fallback to Tamara Coorg
                const isDemoOperator =
                    currentUser.email?.toLowerCase().includes('demo') ||
                    currentUser.email?.toLowerCase().includes('tamara') ||
                    currentUser.fullName?.toLowerCase().includes('tamara');

                if (isDemoOperator) {
                    const { data: demoHotels } = await supabase
                        .from('hotels')
                        .select('id, name')
                        .ilike('name', '%Tamara%')
                        .limit(1);

                    if (demoHotels && demoHotels.length > 0) {
                        router.replace(`/hotel/${demoHotels[0].id}`);
                        return;
                    }
                }

                // If no property is owned yet, redirect to onboarding wizard
                setStatusMessage('No properties registered yet. Redirecting to onboarding...');
                router.replace('/hotel/onboard');
            } catch (err: unknown) {
                const e = err as Error;
                console.error('[HotelIndex] Resolution error:', e);
                setError(e.message || 'Unable to load property dashboard.');
            }
        }

        resolveHotelDestination();
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <AppNavbar />

            <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-24 flex flex-col items-center justify-center text-center">
                {error ? (
                    <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm space-y-4 w-full">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Routing Error</h2>
                        <p className="text-xs text-slate-600">{error}</p>
                        <div className="pt-2 flex gap-3 justify-center">
                            <Link
                                href="/hotel/onboard"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
                            >
                                Onboard Property
                            </Link>
                            <Link
                                href="/auth/hotel"
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                            >
                                Switch Account
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-4 w-full">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-600" />
                                <span>Hotel ESG OS</span>
                            </h3>
                            <p className="text-xs text-slate-500">{statusMessage}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
