import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { GreenTag, ScoreBreakdown, AccessibilityFeatures, GuestAction } from '@/types/database';

interface HotelSeedData {
    name: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
    description: string;
    price_per_night: number;
    image_url: string;
    baseline_audit: Record<string, unknown>;
    accessibility_features: AccessibilityFeatures;
    green_score: number;
    green_tag: GreenTag;
    score_breakdown: ScoreBreakdown;
    has_anomaly?: boolean;
}

const HOTELS_SEED: HotelSeedData[] = [
    {
        name: 'The Tamara Coorg & Eco-Retreat',
        city: 'Goa',
        address: 'Near Butterfly Beach, Palolem, Canacona, South Goa, Goa 403702',
        latitude: 15.0125,
        longitude: 74.0215,
        description: 'Luxurious eco-retreat nestled amidst dense coastal forests featuring solar thermal heating, sustainable architecture, organic dining, and an active zero single-use plastic protocol.',
        price_per_night: 8500,
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        baseline_audit: {
            solar_capacity_kw: 65,
            rainwater_harvesting: true,
            composting_unit: true,
            greywater_recycling: true,
            led_coverage_pct: 95,
            organic_certified: true
        },
        accessibility_features: {
            step_free_access: true,
            wheelchair_accessible: true,
            visual_assistance: true,
            hearing_assistance: false
        },
        green_score: 86,
        green_tag: 'Silver',
        score_breakdown: {
            resource_efficiency: 88,
            recommendation_completion: 85,
            guest_behavior: 85,
            accessibility_baseline: 83
        },
        has_anomaly: true
    },
    {
        name: 'Wildernest Nature Sanctuary',
        city: 'Goa',
        address: 'Swapnagandha Valley, Off Sankhali, Chorla Ghats, Goa 403505',
        latitude: 15.6178,
        longitude: 74.2185,
        description: 'Premier off-grid eco-sanctuary situated high in the Western Ghats biodiversity hotspot, powered exclusively by micro-hydro and rooftop solar with full organic catchment.',
        price_per_night: 9800,
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        baseline_audit: {
            solar_capacity_kw: 85,
            rainwater_harvesting: true,
            composting_unit: true,
            greywater_recycling: true,
            led_coverage_pct: 100,
            organic_certified: true
        },
        accessibility_features: {
            step_free_access: true,
            wheelchair_accessible: true,
            visual_assistance: true,
            hearing_assistance: true
        },
        green_score: 93,
        green_tag: 'Gold',
        score_breakdown: {
            resource_efficiency: 95,
            recommendation_completion: 92,
            guest_behavior: 91,
            accessibility_baseline: 92
        }
    },
    {
        name: 'Ecotel Mumbai Central',
        city: 'Mumbai',
        address: 'Dr. Anandrao Nair Marg, Mumbai Central, Mumbai, Maharashtra 400008',
        latitude: 18.9696,
        longitude: 72.8193,
        description: 'Pioneering LEED Gold urban eco-hotel featuring high-efficiency HVAC chillers, building management automated cooling, and an in-house wet waste vermicomposting plant.',
        price_per_night: 6500,
        image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        baseline_audit: {
            solar_capacity_kw: 40,
            rainwater_harvesting: true,
            composting_unit: true,
            greywater_recycling: true,
            led_coverage_pct: 90,
            organic_certified: false
        },
        accessibility_features: {
            step_free_access: true,
            wheelchair_accessible: true,
            visual_assistance: false,
            hearing_assistance: true
        },
        green_score: 74,
        green_tag: 'Silver',
        score_breakdown: {
            resource_efficiency: 76,
            recommendation_completion: 73,
            guest_behavior: 72,
            accessibility_baseline: 73
        }
    },
    {
        name: 'Himalayan Pine Forest Lodge',
        city: 'Manali',
        address: 'Log Huts Area, Old Manali, Manali, Himachal Pradesh 175131',
        latitude: 32.2396,
        longitude: 77.1887,
        description: 'Authentic stone and timber Himalayan sanctuary heated via ground-source heat pumps and recycled pine needle biomass briquettes, surrounded by organic apple orchards.',
        price_per_night: 5200,
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
        baseline_audit: {
            solar_capacity_kw: 25,
            rainwater_harvesting: false,
            composting_unit: true,
            greywater_recycling: false,
            led_coverage_pct: 82,
            organic_certified: true
        },
        accessibility_features: {
            step_free_access: false,
            wheelchair_accessible: false,
            visual_assistance: true,
            hearing_assistance: false
        },
        green_score: 68,
        green_tag: 'Bronze',
        score_breakdown: {
            resource_efficiency: 70,
            recommendation_completion: 67,
            guest_behavior: 66,
            accessibility_baseline: 67
        }
    },
    {
        name: 'Jaipur Eco Heritage Haveli',
        city: 'Jaipur',
        address: 'Kanti Chandra Road, Bani Park, Jaipur, Rajasthan 302016',
        latitude: 26.9124,
        longitude: 75.7873,
        description: 'Restored royal heritage haveli blending vernacular thermal-mass architecture with a modern 45 kW solar micro-grid, stepwell water recharge, and zero-plastic dining.',
        price_per_night: 7200,
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        baseline_audit: {
            solar_capacity_kw: 45,
            rainwater_harvesting: true,
            composting_unit: true,
            greywater_recycling: true,
            led_coverage_pct: 88,
            organic_certified: true
        },
        accessibility_features: {
            step_free_access: true,
            wheelchair_accessible: true,
            visual_assistance: false,
            hearing_assistance: true
        },
        green_score: 79,
        green_tag: 'Silver',
        score_breakdown: {
            resource_efficiency: 80,
            recommendation_completion: 80,
            guest_behavior: 76,
            accessibility_baseline: 78
        }
    },
    {
        name: 'Garden City Habitat Suites',
        city: 'Bengaluru',
        address: 'Koramangala 4th Block, 100 Feet Road, Bengaluru, Karnataka 560034',
        latitude: 12.9716,
        longitude: 77.5946,
        description: 'Modern biophilic urban sanctuary featuring extensive vertical green walls, solar energy canopies, IoT-monitored sub-surface greywater irrigation, and zero-landfill operations.',
        price_per_night: 7800,
        image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
        baseline_audit: {
            solar_capacity_kw: 55,
            rainwater_harvesting: true,
            composting_unit: true,
            greywater_recycling: true,
            led_coverage_pct: 96,
            organic_certified: false
        },
        accessibility_features: {
            step_free_access: true,
            wheelchair_accessible: true,
            visual_assistance: true,
            hearing_assistance: true
        },
        green_score: 82,
        green_tag: 'Silver',
        score_breakdown: {
            resource_efficiency: 84,
            recommendation_completion: 82,
            guest_behavior: 80,
            accessibility_baseline: 78
        }
    }
];

interface HotelRecoSeed {
    category: 'energy' | 'water' | 'food_waste';
    title: string;
    description: string;
    estimated_impact: string;
    status: 'Suggested' | 'In Progress' | 'Verified Complete';
}

const HOTEL_RECOMMENDATIONS_MAP: Record<string, HotelRecoSeed[]> = {
    'The Tamara Coorg & Eco-Retreat': [
        {
            category: 'energy',
            title: 'Automated Banquet & Common Area HVAC Zone Scheduling',
            description: 'Implement smart occupancy sensors and automated HVAC scheduling to eliminate unbooked cooling waste during non-event hours.',
            estimated_impact: 'Reduces banquet energy usage by 35% (~14,200 kWh/yr saved)',
            status: 'In Progress'
        },
        {
            category: 'water',
            title: 'Closed-Loop Greywater Filtration for Landscaped Gardens',
            description: 'Upgrade reed-bed biological filtration system to treat 100% of guest cottage greywater for native garden irrigation.',
            estimated_impact: 'Conserves ~480,000 liters of fresh borehole water annually',
            status: 'Verified Complete'
        },
        {
            category: 'food_waste',
            title: 'Pre-Consumer Kitchen Waste Weighing & Aerobic Compost Expander',
            description: 'Deploy real-time digital food scales in prep kitchens paired with temperature-controlled aerobic composters for kitchen scraps.',
            estimated_impact: 'Diverts 70% of organic waste from local landfills (~9.5 tons/yr)',
            status: 'Suggested'
        }
    ],
    'Wildernest Nature Sanctuary': [
        {
            category: 'energy',
            title: 'Micro-Hydro Turbine Efficiency Tuning & Battery Storage Upgrade',
            description: 'Install lithium iron phosphate battery backup with dynamic micro-hydro stream head pressure telemetry.',
            estimated_impact: 'Increases clean renewable storage efficiency by 24%',
            status: 'Verified Complete'
        },
        {
            category: 'water',
            title: 'Spring Water Catchment Monitoring & Gravity-Fed Distribution',
            description: 'Install ultrasonic flowmeters along gravity aqueducts to detect and prevent mountain runoff seepage.',
            estimated_impact: 'Eliminates 98% of line leakage and preserves natural aquifers',
            status: 'In Progress'
        },
        {
            category: 'food_waste',
            title: 'Zero-Waste Buffet Portioning & Farm-to-Table Compost Loop',
            description: 'Introduce customized single-serving buffet ramekins and deliver non-edible scraps to community organic farms.',
            estimated_impact: 'Cuts buffet leftovers by 42% and yields 6 tons of compost/yr',
            status: 'Verified Complete'
        }
    ],
    'Ecotel Mumbai Central': [
        {
            category: 'energy',
            title: 'Smart Variable Refrigerant Flow (VRF) Chiller Optimization',
            description: 'Retrofit central chiller plants with predictive AI control based on Mumbai ambient wet-bulb temperatures.',
            estimated_impact: 'Lowers HVAC grid consumption by 18% (~22,000 kWh/yr)',
            status: 'In Progress'
        },
        {
            category: 'water',
            title: 'Low-Flow Aerator Retrofit & Dual-Flush Valve Standard',
            description: 'Equip all 120 guest bathrooms with 1.2 GPM aerated nozzles and dual-flush toilet valves.',
            estimated_impact: 'Saves approximately 620,000 liters of municipal water annually',
            status: 'Verified Complete'
        },
        {
            category: 'food_waste',
            title: 'AI Visual Food Waste Tracking in Banquet Kitchens',
            description: 'Install ceiling-mounted AI image recognition over scullery bins to classify and reduce buffet overproduction.',
            estimated_impact: 'Decreases kitchen over-preparation by 28% (~4.8 tons/yr)',
            status: 'Suggested'
        }
    ],
    'Himalayan Pine Forest Lodge': [
        {
            category: 'energy',
            title: 'Pine Needle Briquette Gasification for Winter Space Heating',
            description: 'Replace auxiliary diesel boilers with locally harvested forest-floor pine needle biomass gasifier units.',
            estimated_impact: 'Reduces fossil fuel usage by 85% and mitigates forest fire risks',
            status: 'In Progress'
        },
        {
            category: 'water',
            title: 'Sub-Zero Freeze-Protected Snowmelt & Rainwater Catchment',
            description: 'Install insulated roof gutter thermal lines to direct seasonal snowmelt into sub-surface storage tanks.',
            estimated_impact: 'Supplies 280,000 liters of soft water during dry spring months',
            status: 'Suggested'
        },
        {
            category: 'food_waste',
            title: 'Insulated Cold-Climate Bokashi Fermentation Units',
            description: 'Utilize inoculated anaerobic Bokashi fermentation barrels to process kitchen waste throughout freezing alpine winters.',
            estimated_impact: '100% of organic waste fermented and cycled into orchard soil',
            status: 'Verified Complete'
        }
    ],
    'Jaipur Eco Heritage Haveli': [
        {
            category: 'energy',
            title: 'Solar Thermal Water Heating with Heritage-Compliant Roof Tiles',
            description: 'Deploy terracotta-camouflaged evacuated tube solar collectors on non-visible haveli rooftop zones.',
            estimated_impact: 'Offsets 92% of guest shower water heating electrical demand',
            status: 'Verified Complete'
        },
        {
            category: 'water',
            title: 'Traditional Stepwell (Baoli) Aquifer Recharge Integration',
            description: 'Connect courtyard sandstone drainage channels directly to the restored heritage stepwell recharge shafts.',
            estimated_impact: 'Recharges 850,000 liters of monsoon water into the local water table',
            status: 'In Progress'
        },
        {
            category: 'food_waste',
            title: 'Thali Waste Minimization & Local Dairy Biogas Digester',
            description: 'Partner with local dairy gaushalas to feed culinary peelings into bio-methane digesters supplying cooking gas.',
            estimated_impact: 'Replaces 45 commercial LPG cylinders annually',
            status: 'Suggested'
        }
    ],
    'Garden City Habitat Suites': [
        {
            category: 'energy',
            title: 'Rooftop Solar Pergola with Smart Energy Storage Integration',
            description: 'Install bi-facial solar glass pergolas over the guest terrace lounge linked to smart peak-shaving batteries.',
            estimated_impact: 'Generates 38,000 kWh/yr cleanly while shading the upper floor',
            status: 'In Progress'
        },
        {
            category: 'water',
            title: 'IoT Sub-Surface Drip Irrigation with Soil Moisture Telemetry',
            description: 'Automate living facade vertical garden watering based on real-time soil tensiometer readings.',
            estimated_impact: 'Decreases landscape water requirements by 44%',
            status: 'Suggested'
        },
        {
            category: 'food_waste',
            title: 'On-Site Accelerated Thermo-Mechanical Compost Dehydrator',
            description: 'Process all restaurant prep and plate waste in a 24-hour aerobic thermophilic digestion unit.',
            estimated_impact: 'Produces 120 kg of pathogen-free soil amendment weekly',
            status: 'Verified Complete'
        }
    ]
};

// Seeded pseudo-random generator for realistic, repeatable telemetry data
function getVariance(seed: number, min: number, max: number): number {
    const x = Math.sin(seed) * 10000;
    const rnd = x - Math.floor(x);
    return min + rnd * (max - min);
}

async function handleSeed() {
    try {
        // 1. Clear existing rows in reverse dependency order
        // Using .delete().neq('id', '00000000-0000-0000-0000-000000000000') as required
        const dummyUuid = '00000000-0000-0000-0000-000000000000';

        const { error: errStays } = await supabaseAdmin
            .from('stays')
            .delete()
            .neq('id', dummyUuid);
        if (errStays) throw new Error(`Failed to clear stays: ${errStays.message}`);

        const { error: errRecos } = await supabaseAdmin
            .from('recommendations')
            .delete()
            .neq('id', dummyUuid);
        if (errRecos) throw new Error(`Failed to clear recommendations: ${errRecos.message}`);

        const { error: errUsage } = await supabaseAdmin
            .from('hotel_usage')
            .delete()
            .neq('id', dummyUuid);
        if (errUsage) throw new Error(`Failed to clear hotel_usage: ${errUsage.message}`);

        const { error: errHotels } = await supabaseAdmin
            .from('hotels')
            .delete()
            .neq('id', dummyUuid);
        if (errHotels) throw new Error(`Failed to clear hotels: ${errHotels.message}`);

        // 2. Insert 6 realistic Indian eco-hotels
        const hotelsToInsert = HOTELS_SEED.map(h => ({
            name: h.name,
            city: h.city,
            address: h.address,
            latitude: h.latitude,
            longitude: h.longitude,
            description: h.description,
            price_per_night: h.price_per_night,
            image_url: h.image_url,
            baseline_audit: h.baseline_audit,
            accessibility_features: h.accessibility_features,
            green_score: h.green_score,
            green_tag: h.green_tag,
            score_breakdown: h.score_breakdown
        }));

        const { data: insertedHotels, error: insertHotelsErr } = await supabaseAdmin
            .from('hotels')
            .insert(hotelsToInsert)
            .select();

        if (insertHotelsErr || !insertedHotels || insertedHotels.length === 0) {
            throw new Error(`Failed to insert hotels: ${insertHotelsErr?.message || 'Unknown error'}`);
        }

        const tamaraHotel = insertedHotels.find(h => h.name === 'The Tamara Coorg & Eco-Retreat') || insertedHotels[0];
        const wildernestHotel = insertedHotels.find(h => h.name === 'Wildernest Nature Sanctuary') || insertedHotels[1];

        // 3. Generate 90 days of daily time-series telemetry in hotel_usage up to today
        // Benchmarks:
        // - Energy benchmark: 420 kWh (normal variance +/- 10-15%, weekend factor 1.25x)
        // - Water benchmark: 3100 L (normal variance +/- 10-12%, weekend factor 1.25x)
        // - Food waste benchmark: 45 kg (normal variance +/- 15%, weekend factor 1.25x)
        // - First hotel (The Tamara Coorg): anomaly 5 days ago (+55% energy spike with reason)
        const allUsageRows: Array<{
            hotel_id: string;
            date: string;
            energy_kwh: number;
            water_liters: number;
            food_waste_kg: number;
            energy_benchmark_kwh: number;
            water_benchmark_liters: number;
            food_waste_benchmark_kg: number;
            is_anomaly: boolean;
            anomaly_reason?: string | null;
        }> = [];

        const ENERGY_BENCHMARK = 420;
        const WATER_BENCHMARK = 3100;
        const FOOD_WASTE_BENCHMARK = 45;

        for (let hotelIdx = 0; hotelIdx < insertedHotels.length; hotelIdx++) {
            const hotel = insertedHotels[hotelIdx];
            const isTamara = hotel.id === tamaraHotel.id;

            for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
                const dateObj = new Date();
                dateObj.setDate(dateObj.getDate() - dayOffset);
                const dateStr = dateObj.toISOString().split('T')[0];

                const dayOfWeek = dateObj.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const weekendMultiplier = isWeekend ? 1.25 : 1.0;

                const seed = (hotelIdx + 1) * 1000 + dayOffset * 17;

                // Normal variances
                // Energy: +/- 10-15% (e.g. -14% to +14%)
                const energyVar = getVariance(seed + 1, -0.14, 0.14);
                // Water: +/- 10-12% (e.g. -11% to +11%)
                const waterVar = getVariance(seed + 2, -0.11, 0.11);
                // Food waste: +/- 15% (e.g. -15% to +15%)
                const foodVar = getVariance(seed + 3, -0.15, 0.15);

                let energyKwh = Math.round(ENERGY_BENCHMARK * (1 + energyVar) * weekendMultiplier * 10) / 10;
                const waterLiters = Math.round(WATER_BENCHMARK * (1 + waterVar) * weekendMultiplier);
                const foodWasteKg = Math.round(FOOD_WASTE_BENCHMARK * (1 + foodVar) * weekendMultiplier * 10) / 10;

                let isAnomaly = false;
                let anomalyReason: string | null = null;

                // Inject anomaly 5 days ago for The Tamara Coorg
                if (isTamara && dayOffset === 5) {
                    isAnomaly = true;
                    anomalyReason = 'Significant HVAC continuous operation detected during unbooked banquet hours.';
                    energyKwh = Math.round(ENERGY_BENCHMARK * 1.55 * 10) / 10; // +55% over benchmark
                }

                allUsageRows.push({
                    hotel_id: hotel.id,
                    date: dateStr,
                    energy_kwh: energyKwh,
                    water_liters: waterLiters,
                    food_waste_kg: foodWasteKg,
                    energy_benchmark_kwh: ENERGY_BENCHMARK,
                    water_benchmark_liters: WATER_BENCHMARK,
                    food_waste_benchmark_kg: FOOD_WASTE_BENCHMARK,
                    is_anomaly: isAnomaly,
                    anomaly_reason: anomalyReason
                });
            }
        }

        // Insert hotel_usage in batch
        const { error: usageErr } = await supabaseAdmin
            .from('hotel_usage')
            .insert(allUsageRows);
        if (usageErr) throw new Error(`Failed to insert hotel_usage: ${usageErr.message}`);

        // 4. Insert 3 recommendations per hotel across energy, water, and food_waste
        const allRecos: Array<{
            hotel_id: string;
            category: 'energy' | 'water' | 'food_waste';
            title: string;
            description: string;
            estimated_impact: string;
            status: 'Suggested' | 'In Progress' | 'Verified Complete';
        }> = [];

        for (const hotel of insertedHotels) {
            const recos = HOTEL_RECOMMENDATIONS_MAP[hotel.name] || [
                {
                    category: 'energy' as const,
                    title: 'Smart Thermostats & LED Lighting Upgrades',
                    description: 'Deploy networked occupancy sensors to automate temperature setbacks in vacant rooms.',
                    estimated_impact: 'Conserves 15-20% on guestroom electricity',
                    status: 'In Progress' as const
                },
                {
                    category: 'water' as const,
                    title: 'Aerated Low-Flow Showerheads & Greywater Recycling',
                    description: 'Install aerators in all guest bathrooms and route laundry discharge to irrigation.',
                    estimated_impact: 'Saves 350,000 liters of water annually',
                    status: 'Verified Complete' as const
                },
                {
                    category: 'food_waste' as const,
                    title: 'Commercial Composting & Kitchen Waste Audits',
                    description: 'Implement daily kitchen prep logging and divert organics to landscaping compost.',
                    estimated_impact: 'Diverts 60% of kitchen waste from landfills',
                    status: 'Suggested' as const
                }
            ];

            for (const r of recos) {
                allRecos.push({
                    hotel_id: hotel.id,
                    category: r.category,
                    title: r.title,
                    description: r.description,
                    estimated_impact: r.estimated_impact,
                    status: r.status
                });
            }
        }

        const { error: recoErr } = await supabaseAdmin
            .from('recommendations')
            .insert(allRecos);
        if (recoErr) throw new Error(`Failed to insert recommendations: ${recoErr.message}`);

        // 5. Insert 2 guest stay records in stays for demo properties with actions_completed ('linen', 'ac', 'towel') and redemption codes for the ROI tracker
        const now = new Date();
        const checkInGuest1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const checkOutGuest1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const checkInGuest2 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const checkOutGuest2 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const guest1Actions: GuestAction[] = [
            {
                action_id: 'linen',
                title: 'Declined Daily Linen Change',
                points: 100,
                completed_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                action_id: 'ac',
                title: 'Set Climate Control to Eco-Mode (24°C+)',
                points: 150,
                completed_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                action_id: 'towel',
                title: 'Reused Bath & Pool Towels',
                points: 100,
                completed_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
            }
        ];

        const guest2Actions: GuestAction[] = [
            {
                action_id: 'linen',
                title: 'Declined Daily Linen Change',
                points: 100,
                completed_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                action_id: 'towel',
                title: 'Reused Bath & Pool Towels',
                points: 100,
                completed_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                action_id: 'ac',
                title: 'Set Climate Control to Eco-Mode (24°C+)',
                points: 150,
                completed_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        const staysToInsert = [
            {
                hotel_id: tamaraHotel.id,
                guest_name: 'Aarav Sharma',
                guest_email: 'aarav.sharma@example.com',
                room_number: 'Villa 204',
                check_in: checkInGuest1,
                check_out: checkOutGuest1,
                is_opted_in: true,
                points_accumulated: 350,
                points_redeemed: 200,
                actions_completed: guest1Actions,
                redemption_code: 'GREEN-ROI-2026-COORG',
                status: 'Checked In'
            },
            {
                hotel_id: wildernestHotel.id,
                guest_name: 'Priya Venkatesh',
                guest_email: 'priya.v@example.com',
                room_number: 'Cottage 12',
                check_in: checkInGuest2,
                check_out: checkOutGuest2,
                is_opted_in: true,
                points_accumulated: 350,
                points_redeemed: 350,
                actions_completed: guest2Actions,
                redemption_code: 'ECO-REDEEM-GOA-7842',
                status: 'Checked Out'
            }
        ];

        const { error: stayErr } = await supabaseAdmin
            .from('stays')
            .insert(staysToInsert);
        if (stayErr) throw new Error(`Failed to insert stays: ${stayErr.message}`);

        // 6. Return response
        return NextResponse.json({
            success: true,
            message: 'Successfully seeded 6 Indian eco-hotels, 90 days of telemetry usage (with 5-day HVAC anomaly), 18 recommendations, and guest stays with ROI redemption tracking.',
            demo_hotel_id: tamaraHotel.id,
            hotels_count: insertedHotels.length,
            usage_records_count: allUsageRows.length,
            recommendations_count: allRecos.length,
            stays_count: staysToInsert.length
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Seed API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Internal seed error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return handleSeed();
}

export async function POST() {
    return handleSeed();
}
