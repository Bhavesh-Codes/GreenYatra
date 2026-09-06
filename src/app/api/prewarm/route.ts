import { NextResponse } from 'next/server';
import { POST as searchTripRoute } from '@/app/api/trip/search/route';
import { getGeocodeKey, getFeasibilityKey, getRouteKey } from '@/lib/redis';

interface DemoRoutePair {
    origin: string;
    destination: string;
    label: string;
}

const PRIMARY_DEMO_ROUTES: DemoRoutePair[] = [
    {
        origin: 'Mumbai, Bandra West',
        destination: 'Goa, Vagator',
        label: 'Mumbai to Goa'
    },
    {
        origin: 'Delhi, Connaught Place',
        destination: 'Manali, Himachal Pradesh',
        label: 'Delhi to Manali'
    },
    {
        origin: 'Bengaluru, Indiranagar',
        destination: 'Goa, Vagator',
        label: 'Bengaluru to Goa'
    }
];

async function handlePrewarm() {
    const startTime = Date.now();
    const results: Array<{
        route: string;
        origin: string;
        destination: string;
        success: boolean;
        modes_cached: string[];
        cached_keys: string[];
        error?: string;
    }> = [];

    for (const pair of PRIMARY_DEMO_ROUTES) {
        try {
            // Build in-process Request object to execute search route handler
            const req = new Request('http://localhost:3000/api/trip/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: pair.origin,
                    destination: pair.destination,
                    travelers: 1
                })
            });

            const res = await searchTripRoute(req);
            const data = await res.json();

            if (!res.ok || !data.success) {
                results.push({
                    route: pair.label,
                    origin: pair.origin,
                    destination: pair.destination,
                    success: false,
                    modes_cached: [],
                    cached_keys: [],
                    error: data.error || 'Failed to calculate green route.'
                });
                continue;
            }

            const modesCached = Array.isArray(data.route_options)
                ? data.route_options.map((o: { mode: string }) => o.mode)
                : [];

            // Compile list of keys generated and stored in Redis
            const cachedKeys: string[] = [
                getGeocodeKey(pair.origin),
                getGeocodeKey(pair.destination)
            ];

            if (data.origin?.name && data.destination?.name) {
                cachedKeys.push(getFeasibilityKey(data.origin.name, data.destination.name));
            }

            for (const mode of modesCached) {
                cachedKeys.push(getRouteKey(pair.origin, pair.destination, mode));
            }

            results.push({
                route: pair.label,
                origin: pair.origin,
                destination: pair.destination,
                success: true,
                modes_cached: modesCached,
                cached_keys: cachedKeys
            });
        } catch (err: unknown) {
            const error = err as Error;
            results.push({
                route: pair.label,
                origin: pair.origin,
                destination: pair.destination,
                success: false,
                modes_cached: [],
                cached_keys: [],
                error: error.message || 'Internal prewarm error'
            });
        }
    }

    const durationMs = Date.now() - startTime;
    const totalCachedKeys = results.reduce((acc, r) => acc + r.cached_keys.length, 0);

    return NextResponse.json({
        success: true,
        message: `Successfully pre-warmed ${results.filter(r => r.success).length}/${PRIMARY_DEMO_ROUTES.length} primary demo routes into Upstash Redis.`,
        duration_ms: durationMs,
        total_cached_keys: totalCachedKeys,
        prewarmed_routes: results
    });
}

export async function GET() {
    return handlePrewarm();
}

export async function POST() {
    return handlePrewarm();
}
