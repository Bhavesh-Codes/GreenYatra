import { NextResponse } from 'next/server';
import { geocodeLocation, getRouteDistance, calculateHaversineDistance } from '@/lib/mapbox';
import { determineViableModes, generateCarbonExplanation } from '@/lib/gemini';
import { calculateEmissions } from '@/lib/climatiq';
import { getRouteKey, getCachedData, setCachedData, ROUTE_EMISSIONS_TTL } from '@/lib/redis';
import { supabaseAdmin } from '@/lib/supabase';
import type { Hotel } from '@/types/database';

export interface RouteOption {
    mode: string;
    distance_km: number;
    duration_mins: number;
    cost_inr: number;
    co2e_kg: number;
    is_greenest: boolean;
}

export async function POST(req: Request) {
    try {
        let body: { origin?: unknown; destination?: unknown; travelers?: unknown };
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON request body.' },
                { status: 400 }
            );
        }

        const { origin, destination, travelers: rawTravelers } = body;

        // 1. Validate origin and destination strings
        if (
            typeof origin !== 'string' ||
            !origin.trim() ||
            typeof destination !== 'string' ||
            !destination.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Origin and destination are required non-empty strings.'
                },
                { status: 400 }
            );
        }

        const travelers =
            typeof rawTravelers === 'number' && Number.isFinite(rawTravelers) && rawTravelers > 0
                ? Math.floor(rawTravelers)
                : 1;

        // 2. Geocode both locations using geocodeLocation from @/lib/mapbox
        const [originGeo, destGeo] = await Promise.all([
            geocodeLocation(origin),
            geocodeLocation(destination)
        ]);

        if (!originGeo) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Could not geocode origin location: "${origin}". Please verify the location query.`
                },
                { status: 404 }
            );
        }

        if (!destGeo) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Could not geocode destination location: "${destination}". Please verify the location query.`
                },
                { status: 404 }
            );
        }

        // 3. Compute baseline road distance and driving duration using getRouteDistance
        const baselineRoad = await getRouteDistance(
            { lat: originGeo.lat, lng: originGeo.lng },
            { lat: destGeo.lat, lng: destGeo.lng }
        );

        // 4. Determine viable transport modes using determineViableModes from @/lib/gemini
        const viableModes = await determineViableModes(
            { name: originGeo.name, lat: originGeo.lat, lng: originGeo.lng },
            { name: destGeo.name, lat: destGeo.lat, lng: destGeo.lng },
            baselineRoad.distance_km
        );

        // 5. For each viable mode: fetch cached summary or compute distance, duration, cost, emissions
        const routeOptionsPromises = viableModes.map(async (mode): Promise<RouteOption> => {
            const cacheKey = getRouteKey(origin, destination, mode);

            // Check Redis cache first
            const cached = await getCachedData<RouteOption>(cacheKey);
            if (cached && typeof cached.distance_km === 'number' && typeof cached.co2e_kg === 'number') {
                // Return cached data scaled for current travelers count
                return {
                    ...cached,
                    cost_inr: travelers > 1 ? Math.round(cached.cost_inr * travelers) : cached.cost_inr,
                    co2e_kg: travelers > 1 ? Math.round(cached.co2e_kg * travelers * 100) / 100 : cached.co2e_kg,
                    is_greenest: false
                };
            }

            // Mode-specific distance calculation
            let distanceKm: number;
            let durationMins: number;
            let costInr: number;

            if (mode === 'flight') {
                // For flight: haversine (great-circle) distance + 50km routing overhead
                const greatCircleDist = calculateHaversineDistance(
                    originGeo.lat,
                    originGeo.lng,
                    destGeo.lat,
                    destGeo.lng
                );
                distanceKm = Math.round((greatCircleDist + 50) * 10) / 10;
                // Flight duration: ~650 km/h cruising + 90 mins check-in & boarding overhead
                durationMins = Math.round((distanceKm / 650) * 60 + 90);
                // Realistic Indian flight cost: ~₹5.5/km (min ₹2000)
                costInr = Math.max(2000, Math.round(distanceKm * 5.5 * travelers));
            } else if (mode === 'train') {
                distanceKm = baselineRoad.distance_km;
                // Train speed estimate in India: ~65 km/h
                durationMins = Math.round((distanceKm / 65) * 60);
                // Realistic Indian rail cost: ~₹1.8/km (min ₹150)
                costInr = Math.max(150, Math.round(distanceKm * 1.8 * travelers));
            } else if (mode === 'bus') {
                distanceKm = baselineRoad.distance_km;
                // Intercity bus speed: ~50 km/h
                durationMins = Math.round((distanceKm / 50) * 60);
                // Realistic Indian bus cost: ~₹1.2/km (min ₹100)
                costInr = Math.max(100, Math.round(distanceKm * 1.2 * travelers));
            } else if (mode === 'car') {
                distanceKm = baselineRoad.distance_km;
                durationMins = baselineRoad.duration_mins || Math.round((distanceKm / 65) * 60);
                // Realistic Indian car cost: ~₹8/km
                costInr = Math.round(distanceKm * 8);
            } else {
                // Shared EV / EV
                distanceKm = baselineRoad.distance_km;
                // Base driving time + 35 min fast charging stop every 220 km
                const chargingStops = distanceKm > 220 ? Math.floor(distanceKm / 220) : 0;
                durationMins = (baselineRoad.duration_mins || Math.round((distanceKm / 65) * 60)) + chargingStops * 35;
                // Realistic Indian shared EV cost: ~₹4/km
                costInr = Math.round(distanceKm * 4 * travelers);
            }

            // Calculate carbon footprint in kg CO2e using calculateEmissions from @/lib/climatiq
            const co2eKg = await calculateEmissions(mode, distanceKm, travelers);

            const option: RouteOption = {
                mode,
                distance_km: distanceKm,
                duration_mins: durationMins,
                cost_inr: costInr,
                co2e_kg: co2eKg,
                is_greenest: false
            };

            // Cache 1-passenger baseline in Redis for 24h
            const cachePayload: RouteOption = {
                ...option,
                cost_inr: Math.round(costInr / travelers),
                co2e_kg: Math.round((co2eKg / travelers) * 100) / 100
            };
            await setCachedData(cacheKey, cachePayload, ROUTE_EMISSIONS_TTL);

            return option;
        });

        const routeOptions = await Promise.all(routeOptionsPromises);

        // 6. Rank the resulting options by lowest CO2e emissions
        routeOptions.sort((a, b) => a.co2e_kg - b.co2e_kg);

        if (routeOptions.length > 0) {
            routeOptions[0].is_greenest = true;
        }

        const greenestOption = routeOptions[0] || {
            mode: 'train',
            co2e_kg: 0,
            distance_km: baselineRoad.distance_km
        };

        // 7. Call generateCarbonExplanation for the greenest option
        const carbonExplanation = await generateCarbonExplanation({
            origin: originGeo.name,
            destination: destGeo.name,
            mode: greenestOption.mode,
            co2e_kg: greenestOption.co2e_kg,
            distance_km: greenestOption.distance_km,
            travelers
        });

        // 8. Query Supabase for hotels in or near the destination city, sorted by green_score descending
        const destinationSearchTerm = destGeo.city || destGeo.name;
        let hotels: Hotel[] = [];

        try {
            const { data: matchedHotels, error: hotelErr } = await supabaseAdmin
                .from('hotels')
                .select('*')
                .ilike('city', `%${destinationSearchTerm}%`)
                .order('green_score', { ascending: false });

            if (!hotelErr && matchedHotels && matchedHotels.length > 0) {
                hotels = matchedHotels as Hotel[];
            } else {
                // If no hotels found in exact city name, query all hotels sorted by green_score
                const { data: allHotels } = await supabaseAdmin
                    .from('hotels')
                    .select('*')
                    .order('green_score', { ascending: false });

                hotels = (allHotels || []) as Hotel[];
            }
        } catch (dbErr) {
            console.error('[Supabase] Hotel query error:', dbErr);
            hotels = [];
        }

        // 9. Return JSON response
        return NextResponse.json({
            success: true,
            origin: {
                name: originGeo.name,
                lat: originGeo.lat,
                lng: originGeo.lng
            },
            destination: {
                name: destGeo.name,
                lat: destGeo.lat,
                lng: destGeo.lng
            },
            route_options: routeOptions,
            carbon_explanation: carbonExplanation,
            hotels
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Trip Search API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Internal server error processing trip search.'
            },
            { status: 500 }
        );
    }
}
