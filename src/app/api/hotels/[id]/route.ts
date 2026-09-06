import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Hotel, Recommendation } from '@/types/database';

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

        // 2. Fetch all verified recommendations from 'recommendations' where status = 'Verified Complete'
        const { data: verifiedRecommendations, error: recoErr } = await supabaseAdmin
            .from('recommendations')
            .select('*')
            .eq('hotel_id', id)
            .eq('status', 'Verified Complete')
            .order('created_at', { ascending: false });

        if (recoErr) {
            console.error('[Supabase] Error fetching verified recommendations:', recoErr);
            return NextResponse.json(
                { success: false, error: `Failed to fetch verified recommendations: ${recoErr.message}` },
                { status: 500 }
            );
        }

        // 3. Return JSON response
        return NextResponse.json({
            success: true,
            hotel: hotel as Hotel,
            verified_actions: (verifiedRecommendations || []) as Recommendation[]
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API] Error in GET /api/hotels/[id]:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
