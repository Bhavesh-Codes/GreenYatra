import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { geocodeLocation } from '@/lib/mapbox';
import type { GreenTag, ScoreBreakdown, AccessibilityFeatures } from '@/types/database';

export async function POST(request: Request) {
    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON request body.' },
                { status: 400 }
            );
        }

        const {
            name,
            city,
            address,
            price_per_night,
            image_url,
            description,
            latitude: reqLat,
            longitude: reqLng,
            baseline_audit,
            accessibility_features
        } = body;

        if (!name || !city || !address) {
            return NextResponse.json(
                { success: false, error: 'Property Name, City, and Address are required.' },
                { status: 400 }
            );
        }

        // 1. Geocode location via Mapbox if coordinates not supplied
        let latitude: number = typeof reqLat === 'number' ? reqLat : 0;
        let longitude: number = typeof reqLng === 'number' ? reqLng : 0;

        if (!latitude || !longitude) {
            try {
                const query = `${address}, ${city}, India`;
                const geocoded = await geocodeLocation(query);
                if (geocoded && geocoded.lat && geocoded.lng) {
                    latitude = geocoded.lat;
                    longitude = geocoded.lng;
                } else {
                    // Fallback to geocoding just city
                    const cityGeocoded = await geocodeLocation(`${city}, India`);
                    if (cityGeocoded && cityGeocoded.lat && cityGeocoded.lng) {
                        latitude = cityGeocoded.lat;
                        longitude = cityGeocoded.lng;
                    } else {
                        // Default coordinate fallback (Goa region)
                        latitude = 15.2993;
                        longitude = 74.1240;
                    }
                }
            } catch (geoErr) {
                console.warn('[Onboard] Geocoding fallback triggered:', geoErr);
                latitude = 15.2993;
                longitude = 74.1240;
            }
        }

        // 2. Calculate initial Baseline Green Score (Cold Start)
        // - Base foundation points: 25 pts
        const baseScore = 25;

        // - Renewable energy %: up to 15 pts
        const renewablePct = Math.max(0, Math.min(100, Number(baseline_audit?.renewable_energy_pct) || 0));
        const renewablePts = Math.min(15, Math.round((renewablePct / 100) * 15));

        // - Low flow fixtures / waste policies: up to 15 pts (5 pts each)
        const lowFlowPts = baseline_audit?.low_flow_fixtures ? 5 : 0;
        const wasteSortingPts = baseline_audit?.waste_sorting ? 5 : 0;
        const buffetControlPts = baseline_audit?.buffet_portion_control ? 5 : 0;
        const policiesPts = lowFlowPts + wasteSortingPts + buffetControlPts;

        // - Accessibility features count: up to 10 pts (2.5 pts each)
        const acc: AccessibilityFeatures = {
            step_free_access: !!accessibility_features?.step_free_access,
            wheelchair_accessible: !!accessibility_features?.wheelchair_accessible,
            visual_assistance: !!accessibility_features?.visual_assistance,
            hearing_assistance: !!accessibility_features?.hearing_assistance
        };
        const accCount = Object.values(acc).filter(Boolean).length;
        const accessibilityPts = Math.round(accCount * 2.5);

        // Sum baseline score (typically 40–65, reaching Bronze tier)
        const initialGreenScore = Math.min(100, baseScore + renewablePts + policiesPts + accessibilityPts);

        let initialGreenTag: GreenTag = 'None';
        if (initialGreenScore >= 80) initialGreenTag = 'Gold';
        else if (initialGreenScore >= 65) initialGreenTag = 'Silver';
        else if (initialGreenScore >= 40) initialGreenTag = 'Bronze';

        const scoreBreakdown: ScoreBreakdown = {
            resource_efficiency: Math.min(100, Math.round(30 + (renewablePts + policiesPts) * 2.3)),
            recommendation_completion: 35,
            guest_behavior: 40,
            accessibility_baseline: Math.min(100, Math.round(25 + accCount * 18.75))
        };

        // 3. Insert new record into 'hotels' table
        const hotelRecord = {
            name: name.trim(),
            city: city.trim(),
            address: address.trim(),
            latitude,
            longitude,
            description: description?.trim() || `Eco-conscious property in ${city} committed to certified ESG auditing and resource conservation.`,
            price_per_night: Number(price_per_night) || 5500,
            image_url: image_url?.trim() || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
            green_score: initialGreenScore,
            green_tag: initialGreenTag,
            score_breakdown: scoreBreakdown,
            accessibility_features: acc,
            baseline_audit: {
                renewable_energy_pct: renewablePct,
                low_flow_fixtures: !!baseline_audit?.low_flow_fixtures,
                waste_sorting: !!baseline_audit?.waste_sorting,
                buffet_portion_control: !!baseline_audit?.buffet_portion_control,
                onboarded_at: new Date().toISOString()
            }
        };

        const { data: newHotel, error: hotelErr } = await supabaseAdmin
            .from('hotels')
            .insert(hotelRecord)
            .select('*')
            .single();

        if (hotelErr || !newHotel) {
            console.error('[Onboard] Error inserting hotel record:', hotelErr);
            return NextResponse.json(
                { success: false, error: `Failed to create hotel: ${hotelErr?.message || 'Database error'}` },
                { status: 500 }
            );
        }

        // 4. Generate 30 days of initial baseline telemetry in 'hotel_usage'
        const ENERGY_BENCHMARK = 390;
        const WATER_BENCHMARK = 2900;
        const FOOD_WASTE_BENCHMARK = 42;

        const usageRows = [];
        for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
            const dateObj = new Date();
            dateObj.setDate(dateObj.getDate() - dayOffset);
            const dateStr = dateObj.toISOString().split('T')[0];

            const dayOfWeek = dateObj.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const weekendMultiplier = isWeekend ? 1.2 : 1.0;

            // Small natural variances
            const energyVariance = (Math.sin(dayOffset * 0.7) * 0.08) + ((Math.random() - 0.5) * 0.06);
            const waterVariance = (Math.cos(dayOffset * 0.6) * 0.09) + ((Math.random() - 0.5) * 0.06);
            const foodVariance = ((Math.random() - 0.5) * 0.12);

            const energyKwh = Math.round(ENERGY_BENCHMARK * (1 + energyVariance) * weekendMultiplier * 10) / 10;
            const waterLiters = Math.round(WATER_BENCHMARK * (1 + waterVariance) * weekendMultiplier);
            const foodWasteKg = Math.round(FOOD_WASTE_BENCHMARK * (1 + foodVariance) * weekendMultiplier * 10) / 10;

            usageRows.push({
                hotel_id: newHotel.id,
                date: dateStr,
                energy_kwh: energyKwh,
                water_liters: waterLiters,
                food_waste_kg: foodWasteKg,
                energy_benchmark_kwh: ENERGY_BENCHMARK,
                water_benchmark_liters: WATER_BENCHMARK,
                food_waste_benchmark_kg: FOOD_WASTE_BENCHMARK,
                is_anomaly: false,
                anomaly_reason: null
            });
        }

        const { error: usageErr } = await supabaseAdmin
            .from('hotel_usage')
            .insert(usageRows);

        if (usageErr) {
            console.warn('[Onboard] Warning: Could not insert baseline telemetry:', usageErr);
        }

        // 5. Insert 2 starter recommendations in 'recommendations'
        const starterRecommendations = [
            {
                hotel_id: newHotel.id,
                category: 'energy',
                title: 'Smart Occupancy HVAC Setback & Zone Scheduling',
                description: 'Deploy keycard and PIR-integrated smart thermostats in guest rooms to automatically setback temperature by 3°C during vacancy.',
                estimated_impact: 'Reduces HVAC cooling load by 22% (~14,000 kWh/yr saved)',
                status: 'Suggested'
            },
            {
                hotel_id: newHotel.id,
                category: 'water',
                title: 'Guest Bathroom Aerated Low-Flow Fixture Retrofit',
                description: 'Upgrade high-consumption bathroom basin faucets and showerheads with 6.5 L/min pressurized flow regulators.',
                estimated_impact: 'Conserves ~340,000 liters of treated municipal water annually',
                status: 'Suggested'
            }
        ];

        const { error: recoErr } = await supabaseAdmin
            .from('recommendations')
            .insert(starterRecommendations);

        if (recoErr) {
            console.warn('[Onboard] Warning: Could not insert starter recommendations:', recoErr);
        }

        return NextResponse.json({
            success: true,
            hotel_id: newHotel.id,
            hotel: newHotel
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[Onboard] Unexpected error in POST /api/hotel/onboard:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
