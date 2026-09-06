import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Stay } from '@/types/database';

export async function POST(request: Request) {
    try {
        let body: { hotel_id?: string; guest_name?: string; room_number?: string };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON request body.' },
                { status: 400 }
            );
        }

        const { hotel_id, guest_name, room_number } = body;

        if (!hotel_id || typeof hotel_id !== 'string') {
            return NextResponse.json(
                { success: false, error: 'hotel_id is required' },
                { status: 400 }
            );
        }

        // 1. Check if an active stay exists in Supabase table 'stays' for this hotel with status 'Checked In'
        const { data: existingStays, error: fetchErr } = await supabaseAdmin
            .from('stays')
            .select('*')
            .eq('hotel_id', hotel_id)
            .eq('status', 'Checked In')
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchErr) {
            console.error('[Supabase] Error checking active stays:', fetchErr);
            return NextResponse.json(
                { success: false, error: `Failed to query stays: ${fetchErr.message}` },
                { status: 500 }
            );
        }

        if (existingStays && existingStays.length > 0) {
            return NextResponse.json({
                success: true,
                stay: existingStays[0] as Stay
            });
        }

        // 2. If not found, create a new record in 'stays'
        const today = new Date();
        const checkOut = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

        const newStay = {
            hotel_id,
            guest_name: guest_name || 'Aarav Sharma',
            room_number: room_number || '304',
            is_opted_in: true,
            points_accumulated: 50, // welcome bonus
            points_redeemed: 0,
            actions_completed: [],
            status: 'Checked In',
            check_in: today.toISOString(),
            check_out: checkOut.toISOString()
        };

        const { data: insertedStay, error: insertErr } = await supabaseAdmin
            .from('stays')
            .insert(newStay)
            .select('*')
            .single();

        if (insertErr || !insertedStay) {
            console.error('[Supabase] Error creating stay:', insertErr);
            return NextResponse.json(
                { success: false, error: `Failed to create stay: ${insertErr?.message || 'Unknown error'}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            stay: insertedStay as Stay
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API] Error in POST /api/stay/checkin:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
