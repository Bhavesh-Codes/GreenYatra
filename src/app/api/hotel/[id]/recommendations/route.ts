import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Hotel ID is required' },
                { status: 400 }
            );
        }

        const { data: recommendations, error } = await supabaseAdmin
            .from('recommendations')
            .select('*')
            .eq('hotel_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            recommendations: recommendations || []
        });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}
