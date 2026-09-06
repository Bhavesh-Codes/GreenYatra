import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Stay, GreenTag, ScoreBreakdown } from '@/types/database';

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Stay ID parameter is required' },
                { status: 400 }
            );
        }

        let body: { action_id?: string; points?: number; title?: string };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON request body.' },
                { status: 400 }
            );
        }

        const { action_id, points, title } = body;

        if (!action_id || typeof points !== 'number') {
            return NextResponse.json(
                { success: false, error: 'action_id and numeric points are required' },
                { status: 400 }
            );
        }

        // 1. Fetch the stay from 'stays'
        const { data: stay, error: fetchErr } = await supabaseAdmin
            .from('stays')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchErr || !stay) {
            return NextResponse.json(
                { success: false, error: 'Stay not found' },
                { status: 404 }
            );
        }

        // 2. Append action to actions_completed and increment points_accumulated
        const newAction = {
            action_id,
            title: title || (action_id === 'linen' ? 'Skipped Daily Linen Change' : action_id === 'ac' ? 'AC Set to 24°C+ Eco-Mode' : 'Reused Bath Towels'),
            points: Math.max(0, points),
            completed_at: new Date().toISOString()
        };

        const currentActions = Array.isArray(stay.actions_completed) ? stay.actions_completed : [];
        const updatedActions = [...currentActions, newAction];
        const updatedPoints = (stay.points_accumulated || 0) + Math.max(0, points);

        const { data: updatedStay, error: updateErr } = await supabaseAdmin
            .from('stays')
            .update({
                actions_completed: updatedActions,
                points_accumulated: updatedPoints,
                is_opted_in: true
            })
            .eq('id', id)
            .select('*')
            .single();

        if (updateErr || !updatedStay) {
            console.error('[Supabase] Error updating stay actions:', updateErr);
            return NextResponse.json(
                { success: false, error: `Failed to record guest action: ${updateErr?.message || 'Unknown error'}` },
                { status: 500 }
            );
        }

        // 3. Recalculate hotel's Guest Behavior Subscore (out of 20)
        let newTotal = 0;
        if (stay.hotel_id) {
            const { data: allStays } = await supabaseAdmin
                .from('stays')
                .select('is_opted_in')
                .eq('hotel_id', stay.hotel_id);

            const totalStaysCount = allStays?.length || 1;
            const optedInCount = allStays ? allStays.filter(s => s.is_opted_in).length : 1;
            const participationRate = optedInCount / totalStaysCount;
            const guestBehaviorScore = Math.min(20, Math.max(0, Math.round(participationRate * 20)));

            const { data: hotel } = await supabaseAdmin
                .from('hotels')
                .select('*')
                .eq('id', stay.hotel_id)
                .single();

            if (hotel) {
                const currentBreakdown: ScoreBreakdown = hotel.score_breakdown || {
                    resource_efficiency: 32,
                    recommendation_completion: 20,
                    guest_behavior: 15,
                    accessibility_baseline: 8
                };

                const updatedBreakdown: ScoreBreakdown = {
                    ...currentBreakdown,
                    guest_behavior: guestBehaviorScore
                };

                const rawTotal =
                    (Number(updatedBreakdown.resource_efficiency) || 0) +
                    (Number(updatedBreakdown.recommendation_completion) || 0) +
                    (Number(updatedBreakdown.guest_behavior) || 0) +
                    (Number(updatedBreakdown.accessibility_baseline) || 0);

                newTotal = Math.min(100, Math.max(0, Math.round(rawTotal)));

                let newTag: GreenTag = 'None';
                if (newTotal >= 91) {
                    newTag = 'Gold';
                } else if (newTotal >= 71) {
                    newTag = 'Silver';
                } else if (newTotal >= 41) {
                    newTag = 'Bronze';
                }

                await supabaseAdmin
                    .from('hotels')
                    .update({
                        green_score: newTotal,
                        green_tag: newTag,
                        score_breakdown: updatedBreakdown
                    })
                    .eq('id', stay.hotel_id);
            }
        }

        return NextResponse.json({
            success: true,
            stay: updatedStay as Stay,
            updated_green_score: newTotal
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API] Error in PATCH /api/stay/[id]/action:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
