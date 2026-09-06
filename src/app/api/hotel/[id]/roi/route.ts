import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Stay } from '@/types/database';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Hotel ID parameter is required' },
                { status: 400 }
            );
        }

        // 1. Query all records from 'stays' where hotel_id = id
        const { data: stays, error: staysErr } = await supabaseAdmin
            .from('stays')
            .select('*')
            .eq('hotel_id', id);

        if (staysErr) {
            console.error('[Supabase] Error querying stays for ROI:', staysErr);
            return NextResponse.json(
                { success: false, error: `Failed to fetch stay records: ${staysErr.message}` },
                { status: 500 }
            );
        }

        const stayList = (stays || []) as Stay[];
        const total_stays = stayList.length;
        const opted_in_stays = stayList.filter((s) => s.is_opted_in).length;
        const participation_rate = total_stays > 0 ? Math.round((opted_in_stays / total_stays) * 100) : 0;

        // 2. Compute gross utility & housekeeping savings across all actions
        let gross_savings_inr = 0;

        for (const stay of stayList) {
            const actions = Array.isArray(stay.actions_completed) ? stay.actions_completed : [];
            for (const act of actions) {
                const actId = (act.action_id || '').toLowerCase();
                if (actId === 'linen' || actId.includes('linen')) {
                    gross_savings_inr += 250;
                } else if (actId === 'ac' || actId.includes('climate') || actId.includes('eco-mode')) {
                    gross_savings_inr += 120;
                } else if (actId === 'towel' || actId.includes('towel')) {
                    gross_savings_inr += 80;
                } else {
                    gross_savings_inr += 100;
                }
            }
        }

        // 3. Compute rewards cost to hotel
        let rewards_cost_inr = 0;

        for (const stay of stayList) {
            const code = (stay.redemption_code || '').toUpperCase();
            const pointsRedeemed = stay.points_redeemed || 0;

            if (code.includes('COCKTAIL') || code.includes('BAR')) {
                rewards_cost_inr += 120;
            } else if (code.includes('DESSERT') || code.includes('COFFEE')) {
                rewards_cost_inr += 60;
            } else if (code.includes('LATE') || code.includes('CHECKOUT')) {
                rewards_cost_inr += 0;
            } else if (pointsRedeemed > 0) {
                // If customized voucher code, apply standard hospitality reward unit economics (~₹0.40/pt)
                rewards_cost_inr += Math.round(pointsRedeemed * 0.4);
            }
        }

        const net_profit_inr = Math.max(0, gross_savings_inr - rewards_cost_inr);
        const avg_savings_per_guest = total_stays > 0 ? Math.round(net_profit_inr / total_stays) : 0;

        const assumptions = [
            'Linen skip savings: ₹250 per action (laundry water, electricity, housekeeping labor)',
            'AC at 24°C savings: ₹120 per action (compressor power cycle reduction)',
            'Towel reuse savings: ₹80 per action (hot water wash savings)',
            'Reward unit costs to hotel: Free Cocktail = ₹120, Artisanal Dessert = ₹60, Late Checkout = ₹0 (marginal)'
        ];

        return NextResponse.json({
            success: true,
            roi: {
                total_stays,
                opted_in_stays,
                participation_rate,
                gross_savings_inr,
                rewards_cost_inr,
                net_profit_inr,
                avg_savings_per_guest,
                assumptions
            }
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API] Error in GET /api/hotel/[id]/roi:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
