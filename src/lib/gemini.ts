import { GoogleGenAI } from '@google/genai';
import { getCachedData, setCachedData, getFeasibilityKey, MODE_FEASIBILITY_TTL } from '@/lib/redis';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type ViableMode = 'flight' | 'train' | 'bus' | 'car' | 'shared_ev';

/**
 * Normalizes mode string to one of the canonical 5 travel modes.
 */
function normalizeModeName(mode: string): ViableMode | null {
    const m = mode.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (m === 'flight' || m === 'air' || m === 'plane') return 'flight';
    if (m === 'train' || m === 'rail' || m === 'railway') return 'train';
    if (m === 'bus' || m === 'coach') return 'bus';
    if (m === 'car' || m === 'cab' || m === 'automobile' || m === 'drive') return 'car';
    if (m === 'shared_ev' || m === 'ev' || m === 'electric_car' || m === 'electric_vehicle') return 'shared_ev';
    return null;
}

/**
 * Heuristic fallback for determining viable modes based on Indian travel infrastructure and distance.
 */
function getHeuristicModes(distanceKm: number): ViableMode[] {
    if (distanceKm < 75) {
        return ['car', 'shared_ev', 'bus'];
    }
    if (distanceKm < 250) {
        return ['train', 'car', 'shared_ev', 'bus'];
    }
    if (distanceKm < 600) {
        return ['train', 'flight', 'shared_ev', 'car', 'bus'];
    }
    if (distanceKm < 1200) {
        return ['train', 'flight', 'bus', 'car'];
    }
    return ['flight', 'train'];
}

/**
 * Uses Gemini 3.6-Flash to dynamically reason about viable transport modes between
 * two geocoded locations in India, considering distance, regional geography, and transport corridors.
 * Cache-first via Upstash Redis (7 days TTL).
 */
export async function determineViableModes(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number },
    roadDistanceKm: number
): Promise<ViableMode[]> {
    const cacheKey = getFeasibilityKey(origin.name, destination.name);

    // 1. Check Redis cache
    const cached = await getCachedData<ViableMode[]>(cacheKey);
    if (Array.isArray(cached) && cached.length > 0) {
        return cached;
    }

    // 2. Call Gemini if configured
    if (ai) {
        try {
            const prompt = `You are GreenYatra's multimodal transport feasibility engine for Indian travel.
Given the origin and destination details below, reason which transport modes from ["flight", "train", "bus", "car", "shared_ev"] are realistically viable:
- Origin: ${origin.name} (${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)})
- Destination: ${destination.name} (${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)})
- Approximate Road Distance: ${Math.round(roadDistanceKm)} km

Rules for Indian travel context:
1. "flight": Only if distance > 180 km and both points have plausible commercial airport access.
2. "train": Plausible for any route in India with rail connectivity (distances from 40 km to 2500 km).
3. "bus": Practical up to ~1000 km.
4. "car": Practical up to ~1200 km.
5. "shared_ev": Practical along electrified highway corridors up to ~600 km.

Respond ONLY with valid JSON in this exact structure without markdown:
{"viable_modes": ["train", "bus", "car", "shared_ev"]}`;

            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt
            });

            const text = response.text || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed.viable_modes)) {
                    const validModes = parsed.viable_modes
                        .map((m: unknown) => (typeof m === 'string' ? normalizeModeName(m) : null))
                        .filter((m: ViableMode | null): m is ViableMode => m !== null);

                    const uniqueModes = Array.from(new Set(validModes)) as ViableMode[];
                    if (uniqueModes.length > 0) {
                        await setCachedData(cacheKey, uniqueModes, MODE_FEASIBILITY_TTL);
                        return uniqueModes;
                    }
                }
            }
        } catch (err) {
            console.error('[Gemini] Error determining viable modes, using heuristic:', err);
        }
    } else {
        console.warn('[Gemini] GEMINI_API_KEY not configured, using heuristic.');
    }

    // 3. Fallback heuristic
    const fallback = getHeuristicModes(roadDistanceKm);
    await setCachedData(cacheKey, fallback, MODE_FEASIBILITY_TTL);
    return fallback;
}

/**
 * Generates an engaging, relatable carbon impact explanation for the greenest transport option.
 * Cached in Redis for 24h to enable sub-300ms repeat queries.
 */
export async function generateCarbonExplanation(context: {
    origin: string;
    destination: string;
    mode: string;
    co2e_kg: number;
    distance_km: number;
    travelers?: number;
}): Promise<string> {
    const { origin, destination, mode, co2e_kg, distance_km } = context;
    const cacheKey = `explanation:${origin.trim().toLowerCase()}:${destination.trim().toLowerCase()}:${mode.toLowerCase()}`;

    // 1. Check Redis cache
    const cached = await getCachedData<string>(cacheKey);
    if (cached) {
        return cached;
    }

    let explanation: string | null = null;

    // 2. Call Gemini if available
    if (ai) {
        try {
            const prompt = `Provide exactly a 2-sentence conversational explanation of why choosing ${mode} from ${origin} to ${destination} is the greenest option, producing approximately ${co2e_kg} kg CO2e over ${Math.round(distance_km)} km.
Include an engaging, relatable equivalent comparison such as equivalent smartphone charges or days of tree carbon absorption. Keep it friendly, positive, and concise.`;

            const res = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt
            });

            if (res.text && res.text.trim().length > 10) {
                explanation = res.text.trim();
            }
        } catch (err) {
            console.error('[Gemini] Error generating carbon explanation, using fallback:', err);
        }
    }

    // 3. Relatable equivalent fallback if Gemini call fails
    if (!explanation) {
        const phoneCharges = Math.round(co2e_kg * 125);
        const modeLabel = mode === 'shared_ev' ? 'Shared EV' : mode.charAt(0).toUpperCase() + mode.slice(1);
        explanation = `Traveling by ${modeLabel} from ${origin} to ${destination} produces only ${co2e_kg} kg CO2e over ${Math.round(distance_km)} km, making it your lowest-emission travel choice. That is roughly equivalent to charging a smartphone ${phoneCharges.toLocaleString()} times!`;
    }

    // 4. Cache in Redis (24 hours)
    await setCachedData<string>(cacheKey, explanation, 60 * 60 * 24);

    return explanation;
}
