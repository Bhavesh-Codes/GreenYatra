import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { GreenTag, ScoreBreakdown } from '@/types/database';

const ALLOWED_STATUSES = ['Suggested', 'In Progress', 'Verified Complete'] as const;
type RecommendationStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string; recoId: string }> }
) {
    try {
        const { id, recoId } = await context.params;

        if (!id || !recoId) {
            return NextResponse.json(
                { success: false, error: 'Hotel ID and Recommendation ID are required' },
                { status: 400 }
            );
        }

        // 1. Parse & validate request body
        const body = await request.json().catch(() => ({}));
        const status = body?.status as RecommendationStatus;

        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`
                },
                { status: 400 }
            );
        }

        // 2. Update recommendation in Supabase
        const { data: updatedReco, error: updateRecoErr } = await supabaseAdmin
            .from('recommendations')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', recoId)
            .eq('hotel_id', id)
            .select()
            .single();

        if (updateRecoErr || !updatedReco) {
            return NextResponse.json(
                {
                    success: false,
                    error: updateRecoErr?.message || 'Recommendation not found for this hotel'
                },
                { status: 404 }
            );
        }

        // 3. Fetch hotel record to retrieve current score breakdown for other pillars
        const { data: hotel, error: hotelErr } = await supabaseAdmin
            .from('hotels')
            .select('*')
            .eq('id', id)
            .single();

        if (hotelErr || !hotel) {
            return NextResponse.json(
                { success: false, error: 'Associated hotel not found' },
                { status: 404 }
            );
        }

        // 4. Fetch all recommendations for this hotel to recompute completion rate
        const { data: allRecos, error: allRecosErr } = await supabaseAdmin
            .from('recommendations')
            .select('*')
            .eq('hotel_id', id);

        if (allRecosErr || !allRecos) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch recommendations: ${allRecosErr?.message}` },
                { status: 500 }
            );
        }

        // 5. Recalculate recommendation completion score (0–30 pts)
        // Formula: (Verified Complete recos / Total recos) * 30 pts
        const verifiedCount = allRecos.filter(r => r.status === 'Verified Complete').length;
        const recoCompletionScore =
            allRecos.length > 0
                ? Math.round((verifiedCount / allRecos.length) * 30 * 10) / 10
                : 0;

        // 6. Update score breakdown and total Green Score
        const currentBreakdown: ScoreBreakdown = hotel.score_breakdown || {
            resource_efficiency: 32,
            recommendation_completion: 0,
            guest_behavior: 15,
            accessibility_baseline: 7.5
        };

        const updatedBreakdown: ScoreBreakdown = {
            ...currentBreakdown,
            recommendation_completion: recoCompletionScore
        };

        const rawTotal =
            (Number(updatedBreakdown.resource_efficiency) || 0) +
            (Number(updatedBreakdown.recommendation_completion) || 0) +
            (Number(updatedBreakdown.guest_behavior) || 0) +
            (Number(updatedBreakdown.accessibility_baseline) || 0);

        const newTotalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

        // Determine tag tier: 0–40 = None, 41–70 = Bronze, 71–90 = Silver, 91–100 = Gold
        let newTag: GreenTag = 'None';
        if (newTotalScore >= 91) {
            newTag = 'Gold';
        } else if (newTotalScore >= 71) {
            newTag = 'Silver';
        } else if (newTotalScore >= 41) {
            newTag = 'Bronze';
        } else {
            newTag = 'None';
        }

        // Persist updated scores to hotels table
        const { error: hotelUpdateErr } = await supabaseAdmin
            .from('hotels')
            .update({
                green_score: newTotalScore,
                green_tag: newTag,
                score_breakdown: updatedBreakdown
            })
            .eq('id', id);

        if (hotelUpdateErr) {
            console.warn('[RecoPatchAPI] Warning: Failed to persist updated Green Score to hotel:', hotelUpdateErr);
        }

        // 7. Return JSON response
        return NextResponse.json({
            success: true,
            updated_recommendation: updatedReco,
            updated_score: newTotalScore,
            updated_tag: newTag
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[RecoPatchAPI] Error updating recommendation status:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Internal server error while updating recommendation'
            },
            { status: 500 }
        );
    }
}
