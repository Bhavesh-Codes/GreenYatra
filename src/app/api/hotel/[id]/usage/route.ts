import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Hotel, HotelUsage, Recommendation, Stay, GreenTag, ScoreBreakdown } from '@/types/database';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Hotel ID parameter is required' },
                { status: 400 }
            );
        }

        // 1. Fetch hotel record from Supabase table 'hotels'
        const { data: hotel, error: hotelErr } = await supabaseAdmin
            .from('hotels')
            .select('*')
            .eq('id', id)
            .single();

        if (hotelErr || !hotel) {
            return NextResponse.json(
                { success: false, error: 'Hotel not found' },
                { status: 404 }
            );
        }

        // 2. Fetch all daily records from 'hotel_usage' ordered by date ASC
        const { data: usageRows, error: usageErr } = await supabaseAdmin
            .from('hotel_usage')
            .select('*')
            .eq('hotel_id', id)
            .order('date', { ascending: true });

        if (usageErr) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch usage records: ${usageErr.message}` },
                { status: 500 }
            );
        }

        // 3. Fetch all records from 'recommendations' for this hotel
        const { data: recos, error: recosErr } = await supabaseAdmin
            .from('recommendations')
            .select('*')
            .eq('hotel_id', id);

        if (recosErr) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch recommendations: ${recosErr.message}` },
                { status: 500 }
            );
        }

        // 4. Fetch all records from 'stays' for this hotel
        const { data: stays, error: staysErr } = await supabaseAdmin
            .from('stays')
            .select('*')
            .eq('hotel_id', id);

        if (staysErr) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch stays: ${staysErr.message}` },
                { status: 500 }
            );
        }

        const allUsage: HotelUsage[] = usageRows || [];
        const allRecos: Recommendation[] = recos || [];
        const allStays: Stay[] = stays || [];

        // 5. Recompute live Green Score using exact PRD formula

        // A. Resource Efficiency Score (0–40):
        // Compare average actual energy/water/waste against peer benchmarks over the last 30 days
        const last30Usage = allUsage.slice(-30);
        let resourceEfficiencyScore = 32; // Default baseline if telemetry not yet accumulated

        if (last30Usage.length > 0) {
            let totalEnergyActual = 0;
            let totalEnergyBench = 0;
            let totalWaterActual = 0;
            let totalWaterBench = 0;
            let totalWasteActual = 0;
            let totalWasteBench = 0;

            for (const row of last30Usage) {
                totalEnergyActual += Number(row.energy_kwh) || 0;
                totalEnergyBench += Number(row.energy_benchmark_kwh) || 420;
                totalWaterActual += Number(row.water_liters) || 0;
                totalWaterBench += Number(row.water_benchmark_liters) || 3100;
                totalWasteActual += Number(row.food_waste_kg) || 0;
                totalWasteBench += Number(row.food_waste_benchmark_kg) || 45;
            }

            const energyRatio = totalEnergyBench > 0 ? totalEnergyActual / totalEnergyBench : 1;
            const waterRatio = totalWaterBench > 0 ? totalWaterActual / totalWaterBench : 1;
            const wasteRatio = totalWasteBench > 0 ? totalWasteActual / totalWasteBench : 1;

            const avgConsumptionRatio = (energyRatio + waterRatio + wasteRatio) / 3;

            // Efficiency mapping:
            // <= 0.75x ratio -> 100% efficiency (40 points)
            // 1.0x ratio (at benchmark) -> 80% efficiency (32 points)
            // 1.25x ratio -> ~55% efficiency (22 points)
            // >= 1.6x ratio -> 0% efficiency
            const effPercent = Math.max(0, Math.min(100, ((1.6 - avgConsumptionRatio) / (1.6 - 0.75)) * 100));
            resourceEfficiencyScore = Math.round(((effPercent / 100) * 40) * 10) / 10;
        }

        // B. Recommendation Completion Rate (0–30):
        // (Verified Complete recos / Total recos) * 30
        let recommendationCompletionScore = 0;
        if (allRecos.length > 0) {
            const verifiedCount = allRecos.filter(r => r.status === 'Verified Complete').length;
            recommendationCompletionScore = Math.round((verifiedCount / allRecos.length) * 30 * 10) / 10;
        } else if (hotel.score_breakdown?.recommendation_completion) {
            recommendationCompletionScore = hotel.score_breakdown.recommendation_completion;
        }

        // C. Guest Behavior Score (0–20):
        // (Opted-in stays / Total stays) * 20
        let guestBehaviorScore = 15; // Baseline guest behavior score
        if (allStays.length > 0) {
            const optedInCount = allStays.filter(s => s.is_opted_in === true).length;
            guestBehaviorScore = Math.round((optedInCount / allStays.length) * 20 * 10) / 10;
        } else if (hotel.score_breakdown?.guest_behavior) {
            guestBehaviorScore = hotel.score_breakdown.guest_behavior;
        }

        // D. Accessibility Baseline Score (0–10):
        // Count completed accessibility features / 4 * 10
        const access = hotel.accessibility_features || {};
        const completedFeatures = [
            access.step_free_access,
            access.wheelchair_accessible,
            access.visual_assistance,
            access.hearing_assistance
        ].filter(Boolean).length;
        const accessibilityBaselineScore = Math.round((completedFeatures / 4) * 10 * 10) / 10;

        // E. Total Green Score = sum of the 4 sub-scores (clamped 0–100)
        const rawTotal =
            resourceEfficiencyScore +
            recommendationCompletionScore +
            guestBehaviorScore +
            accessibilityBaselineScore;

        const totalGreenScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

        // F. Determine tag: 0–40 = None, 41–70 = Bronze, 71–90 = Silver, 91–100 = Gold
        let greenTag: GreenTag = 'None';
        if (totalGreenScore >= 91) {
            greenTag = 'Gold';
        } else if (totalGreenScore >= 71) {
            greenTag = 'Silver';
        } else if (totalGreenScore >= 41) {
            greenTag = 'Bronze';
        } else {
            greenTag = 'None';
        }

        const scoreBreakdown: ScoreBreakdown = {
            resource_efficiency: resourceEfficiencyScore,
            recommendation_completion: recommendationCompletionScore,
            guest_behavior: guestBehaviorScore,
            accessibility_baseline: accessibilityBaselineScore
        };

        // 6. Update hotel record in Supabase with freshly computed metrics
        const { data: updatedHotel, error: updateErr } = await supabaseAdmin
            .from('hotels')
            .update({
                green_score: totalGreenScore,
                green_tag: greenTag,
                score_breakdown: scoreBreakdown
            })
            .eq('id', id)
            .select()
            .single();

        if (updateErr) {
            console.warn('[HotelUsageAPI] Warning: Failed to persist updated score to hotels table:', updateErr);
        }

        // 7. Check for recent anomalies (within last 14 days or in usage set)
        const last14DaysUsage = allUsage.slice(-14);
        const recentAnomaly =
            last14DaysUsage.find(r => r.is_anomaly === true) ||
            allUsage.find(r => r.is_anomaly === true) ||
            null;
        const hasRecentAnomaly = recentAnomaly !== null;

        // 8. Return JSON response
        return NextResponse.json({
            success: true,
            hotel: updatedHotel || {
                ...hotel,
                green_score: totalGreenScore,
                green_tag: greenTag,
                score_breakdown: scoreBreakdown
            },
            usage: allUsage,
            has_recent_anomaly: hasRecentAnomaly,
            recent_anomaly: recentAnomaly
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[HotelUsageAPI] Unexpected error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Internal server error while processing hotel usage'
            },
            { status: 500 }
        );
    }
}
