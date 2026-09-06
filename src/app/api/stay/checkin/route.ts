import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Stay } from '@/types/database';

export async function POST(request: Request) {
    try {
        let body: {
            hotel_id?: string;
            guest_name?: string;
            guest_email?: string;
            room_number?: string;
        };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON request body.' },
                { status: 400 }
            );
        }

        const { hotel_id, guest_name, guest_email, room_number } = body;

        if (!hotel_id || typeof hotel_id !== 'string') {
            return NextResponse.json(
                { success: false, error: 'hotel_id is required' },
                { status: 400 }
            );
        }

        // 1. Check if an active stay exists in Supabase table 'stays' for this specific guest with status 'Checked In'
        let query = supabaseAdmin
            .from('stays')
            .select('*')
            .eq('hotel_id', hotel_id)
            .eq('status', 'Checked In');

        if (guest_email && guest_name) {
            query = query.or(`guest_email.eq.${guest_email},guest_name.eq.${guest_name}`);
        } else if (guest_email) {
            query = query.eq('guest_email', guest_email);
        } else if (guest_name) {
            query = query.eq('guest_name', guest_name);
        }

        const { data: existingStays, error: fetchErr } = await query
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
        const todayStr = new Date().toISOString().split('T')[0];
        const checkOutStr = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

        const newStay = {
            hotel_id,
            guest_name: guest_name || 'Bhavesh Bisht',
            guest_email: guest_email || null,
            room_number: room_number || 'Room ' + Math.floor(100 + Math.random() * 899),
            check_in: todayStr,
            check_out: checkOutStr,
            is_opted_in: true,
            points_accumulated: 50, // welcome bonus
            points_redeemed: 0,
            actions_completed: [],
            status: 'Checked In'
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
