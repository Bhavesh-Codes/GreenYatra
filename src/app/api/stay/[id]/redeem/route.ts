import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
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

        let body: { reward_title?: string; cost_points?: number };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON request body.' },
                { status: 400 }
            );
        }

        const { reward_title, cost_points } = body;

        if (!reward_title || typeof cost_points !== 'number' || cost_points <= 0) {
            return NextResponse.json(
                { success: false, error: 'Valid reward_title and positive cost_points are required' },
                { status: 400 }
            );
        }

        // 1. Fetch stay from 'stays'
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

        const accumulated = stay.points_accumulated || 0;
        const redeemed = stay.points_redeemed || 0;
        const availablePoints = accumulated - redeemed;

        // 2. Check if points_accumulated - points_redeemed >= cost_points
        if (availablePoints < cost_points) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Insufficient points. You have ${availablePoints} points available, but ${cost_points} points are required.`
                },
                { status: 400 }
            );
        }

        // 3. Generate voucher code
        const sanitizedTitle = reward_title
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 16);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const voucherCode = `ECO-${sanitizedTitle}-${randomNum}`;

        const newRedeemedTotal = redeemed + cost_points;

        // 4. Update stay record
        const { error: updateErr } = await supabaseAdmin
            .from('stays')
            .update({
                points_redeemed: newRedeemedTotal,
                redemption_code: voucherCode
            })
            .eq('id', id);

        if (updateErr) {
            console.error('[Supabase] Error processing redemption:', updateErr);
            return NextResponse.json(
                { success: false, error: `Failed to process redemption: ${updateErr.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            redemption_code: voucherCode,
            remaining_points: accumulated - newRedeemedTotal
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API] Error in POST /api/stay/[id]/redeem:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
