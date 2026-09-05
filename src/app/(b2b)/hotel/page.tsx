import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function HotelIndexPage() {
    // Find the primary demo hotel (Tamara Coorg or first created hotel)
    const { data: hotels } = await supabaseAdmin
        .from('hotels')
        .select('id, name')
        .order('created_at', { ascending: true })
        .limit(6);

    const targetHotel =
        hotels?.find(h => h.name.includes('Tamara')) ||
        hotels?.[0];

    if (targetHotel) {
        redirect(`/hotel/${targetHotel.id}`);
    }

    // Fallback if database has not been seeded yet
    redirect('/api/seed');
}
