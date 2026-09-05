import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: hotels, error } = await supabaseAdmin
            .from('hotels')
            .select('id, name, city, green_score, green_tag, price_per_night')
            .order('name', { ascending: true });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            hotels: hotels || []
        });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to fetch hotels' },
            { status: 500 }
        );
    }
}
