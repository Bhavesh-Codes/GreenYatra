import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { supabaseAdmin } from '@/lib/supabase';

interface GeneratedRecommendation {
    category: 'energy' | 'water' | 'food_waste';
    title: string;
    description: string;
    estimated_impact: string;
}

interface GeminiRecommendationsResponse {
    recommendations: GeneratedRecommendation[];
}

const MODELS_TO_TRY = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];

export async function POST(
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

        // 1. Fetch the hotel record from Supabase
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

        // 2. Fetch the last 14 days of telemetry from 'hotel_usage'
        const { data: recentUsage, error: usageErr } = await supabaseAdmin
            .from('hotel_usage')
            .select('*')
            .eq('hotel_id', id)
            .order('date', { ascending: false })
            .limit(14);

        if (usageErr) {
            return NextResponse.json(
                { success: false, error: `Failed to fetch telemetry: ${usageErr.message}` },
                { status: 500 }
            );
        }

        // 3. Fetch any flagged anomalies from 'hotel_usage'
        const { data: anomalies } = await supabaseAdmin
            .from('hotel_usage')
            .select('*')
            .eq('hotel_id', id)
            .eq('is_anomaly', true)
            .order('date', { ascending: false });

        // Build telemetry and anomaly summary for the prompt
        const telemetrySample = recentUsage && recentUsage.length > 0 ? recentUsage : [];
        const avgEnergy =
            telemetrySample.length > 0
                ? Math.round((telemetrySample.reduce((s, r) => s + (Number(r.energy_kwh) || 0), 0) / telemetrySample.length) * 10) / 10
                : 420;
        const avgWater =
            telemetrySample.length > 0
                ? Math.round(telemetrySample.reduce((s, r) => s + (Number(r.water_liters) || 0), 0) / telemetrySample.length)
                : 3100;
        const avgWaste =
            telemetrySample.length > 0
                ? Math.round((telemetrySample.reduce((s, r) => s + (Number(r.food_waste_kg) || 0), 0) / telemetrySample.length) * 10) / 10
                : 45;

        const benchEnergy = telemetrySample[0]?.energy_benchmark_kwh || 420;
        const benchWater = telemetrySample[0]?.water_benchmark_liters || 3100;
        const benchWaste = telemetrySample[0]?.food_waste_benchmark_kg || 45;

        const anomalyDescriptions =
            anomalies && anomalies.length > 0
                ? anomalies
                      .map(
                          a =>
                              `- Date: ${a.date}, Energy: ${a.energy_kwh} kWh (Benchmark: ${a.energy_benchmark_kwh} kWh), Reason: "${a.anomaly_reason || 'Power spike'}"`
                      )
                      .join('\n')
                : 'No explicit anomalies logged in the system.';

        // Prompt formatting
        const prompt = `You are an expert hospitality sustainability engineer and energy auditor for eco-hotels in India.
Hotel: "${hotel.name}" in ${hotel.city}, India
Current Green Score: ${hotel.green_score || 75} / 100 (${hotel.green_tag || 'Silver'} tier)

Recent 14-Day Resource Telemetry Summary:
- Average Daily Energy: ${avgEnergy} kWh/day (Peer Benchmark: ${benchEnergy} kWh/day)
- Average Daily Water: ${avgWater} L/day (Peer Benchmark: ${benchWater} L/day)
- Average Daily Food Waste: ${avgWaste} kg/day (Peer Benchmark: ${benchWaste} kg/day)

Flagged Sensor Anomalies:
${anomalyDescriptions}

TASK:
Analyze the data above and generate exactly 2 to 3 specific, low-effort, high-impact actionable recommendations.
If anomalies exist (such as HVAC running continuously during unbooked banquet hours), at least one recommendation MUST directly address that root cause.
Assign each item to one of: "energy", "water", or "food_waste".
Provide an estimated quantified impact (e.g., "% savings" or "kWh/liters saved per year").

Respond strictly with valid JSON conforming to the requested schema.`;

        let generatedRecos: GeneratedRecommendation[] = [];

        // 4. Generate recommendations using Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });

            for (const modelName of MODELS_TO_TRY) {
                try {
                    const response = await ai.models.generateContent({
                        model: modelName,
                        contents: prompt,
                        config: {
                            responseMimeType: 'application/json',
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    recommendations: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                category: {
                                                    type: Type.STRING,
                                                    enum: ['energy', 'water', 'food_waste']
                                                },
                                                title: { type: Type.STRING },
                                                description: { type: Type.STRING },
                                                estimated_impact: { type: Type.STRING }
                                            },
                                            required: ['category', 'title', 'description', 'estimated_impact']
                                        }
                                    }
                                },
                                required: ['recommendations']
                            }
                        }
                    });

                    let rawText = response.text || '';
                    // Strip accidental markdown wrappers if any
                    rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

                    const parsed = JSON.parse(rawText) as GeminiRecommendationsResponse;
                    if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
                        generatedRecos = parsed.recommendations.filter(
                            r =>
                                ['energy', 'water', 'food_waste'].includes(r.category) &&
                                r.title &&
                                r.description &&
                                r.estimated_impact
                        );
                        if (generatedRecos.length > 0) {
                            break; // Successfully generated with current model
                        }
                    }
                } catch (geminiErr) {
                    console.warn(`[RecommendationsAPI] Failed with model ${modelName}:`, geminiErr);
                }
            }
        }

        // Fallback recommendations if Gemini call fails or is unconfigured
        if (generatedRecos.length === 0) {
            generatedRecos = [
                {
                    category: 'energy',
                    title: 'Automated Banquet Hall HVAC Setback Control',
                    description: 'Deploy smart schedule integration with the event calendar to maintain 28°C setback mode during unbooked banquet and ballroom hours.',
                    estimated_impact: 'Eliminates standby cooling waste, saving ~14,200 kWh/yr (~$1,450/yr)'
                },
                {
                    category: 'water',
                    title: 'Smart Ultrasonic Irrigation Flow Restrictors',
                    description: 'Install pulsed flow meters on guest garden irrigation lines to detect underground line fractures and throttle delivery during daytime heat.',
                    estimated_impact: 'Conserves ~320,000 liters of treated water annually'
                },
                {
                    category: 'food_waste',
                    title: 'Banquet Prep Batching & Composting Streamline',
                    description: 'Transition banquet catering kitchens from bulk batching to phased replenishment and route 100% of vegetable trimmings to the on-site vermicomposter.',
                    estimated_impact: 'Reduces buffet overproduction by 25% (~5.4 tons/yr)'
                }
            ];
        }

        // 5. Insert the newly generated recommendations into Supabase
        const rowsToInsert = generatedRecos.map(r => ({
            hotel_id: id,
            category: r.category,
            title: r.title,
            description: r.description,
            estimated_impact: r.estimated_impact,
            status: 'Suggested' as const
        }));

        const { data: insertedData, error: insertErr } = await supabaseAdmin
            .from('recommendations')
            .insert(rowsToInsert)
            .select();

        if (insertErr || !insertedData) {
            throw new Error(`Failed to insert recommendations: ${insertErr?.message || 'Unknown database error'}`);
        }

        // 6. Return response
        return NextResponse.json({
            success: true,
            recommendations: insertedData
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[RecommendationsAPI] Error generating recommendations:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Internal server error while generating recommendations'
            },
            { status: 500 }
        );
    }
}
