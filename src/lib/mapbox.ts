import { getCachedData, setCachedData, getGeocodeKey, GEOCODE_TTL } from '@/lib/redis';

export interface GeocodedLocation {
    name: string;
    place_name: string;
    lat: number;
    lng: number;
    city?: string;
    region?: string;
    country?: string;
}

export interface RouteDistanceResult {
    distance_km: number;
    duration_mins: number;
    geometry: [number, number][];
}

/**
 * Calculates Great-Circle (Haversine) distance between two coordinate pairs in kilometers.
 */
export function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

/**
 * Geocodes an arbitrary place string into coordinates and place metadata using Mapbox Geocoding API v5.
 * Cache-first via Upstash Redis (30 days TTL).
 */
export async function geocodeLocation(query: string): Promise<GeocodedLocation | null> {
    if (!query || !query.trim()) {
        return null;
    }

    const trimmed = query.trim();
    const cacheKey = getGeocodeKey(trimmed);

    // 1. Check Redis cache
    const cached = await getCachedData<GeocodedLocation>(cacheKey);
    if (cached && typeof cached.lat === 'number' && typeof cached.lng === 'number') {
        return cached;
    }

    // 2. Fetch from Mapbox Geocoding API
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
        console.warn('[Mapbox] NEXT_PUBLIC_MAPBOX_TOKEN is not configured.');
        return null;
    }

    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${token}&limit=1`;
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`[Mapbox] Geocoding error: HTTP ${res.status} ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        const feature = data.features?.[0];
        if (!feature || !feature.center) {
            return null;
        }

        const [lng, lat] = feature.center;
        let city: string | undefined;
        let region: string | undefined;
        let country: string | undefined;

        if (Array.isArray(feature.context)) {
            for (const ctx of feature.context) {
                if (typeof ctx.id === 'string') {
                    if (ctx.id.startsWith('place.')) {
                        city = ctx.text;
                    } else if (ctx.id.startsWith('region.')) {
                        region = ctx.text;
                    } else if (ctx.id.startsWith('country.')) {
                        country = ctx.text;
                    }
                }
            }
        }

        // If city is not in context, fall back to feature.text if place_type contains 'place'
        if (!city && Array.isArray(feature.place_type) && feature.place_type.includes('place')) {
            city = feature.text;
        }

        const location: GeocodedLocation = {
            name: feature.text || trimmed,
            place_name: feature.place_name || trimmed,
            lat,
            lng,
            city: city || feature.text,
            region,
            country
        };

        // 3. Cache in Redis
        await setCachedData<GeocodedLocation>(cacheKey, location, GEOCODE_TTL);

        return location;
    } catch (err) {
        console.error('[Mapbox] Error in geocodeLocation:', err);
        return null;
    }
}

/**
 * Computes baseline road distance (in km), driving duration (in minutes), and full road geometry
 * between two coordinates using Mapbox Directions API v5.
 */
export async function getRouteDistance(
    originCoords: [number, number] | { lat: number; lng: number },
    destCoords: [number, number] | { lat: number; lng: number }
): Promise<RouteDistanceResult> {
    const originArr: [number, number] = Array.isArray(originCoords)
        ? originCoords
        : [originCoords.lat, originCoords.lng];
    const destArr: [number, number] = Array.isArray(destCoords)
        ? destCoords
        : [destCoords.lat, destCoords.lng];

    const haversineDist = calculateHaversineDistance(originArr[0], originArr[1], destArr[0], destArr[1]);
    const fallbackGeometry: [number, number][] = [
        [originArr[1], originArr[0]],
        [destArr[1], destArr[0]]
    ];

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
        console.warn('[Mapbox] NEXT_PUBLIC_MAPBOX_TOKEN not configured, using Haversine estimation.');
        const roadDist = Math.round(haversineDist * 1.28 * 10) / 10;
        return {
            distance_km: roadDist,
            duration_mins: Math.round((roadDist / 60) * 60),
            geometry: fallbackGeometry
        };
    }

    try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originArr[1]},${originArr[0]};${destArr[1]},${destArr[0]}?geometries=geojson&overview=full&access_token=${token}`;
        const res = await fetch(url);

        if (!res.ok) {
            console.warn(`[Mapbox] Directions API returned ${res.status}. Falling back to estimated distance.`);
            const roadDist = Math.round(haversineDist * 1.28 * 10) / 10;
            return {
                distance_km: roadDist,
                duration_mins: Math.round((roadDist / 60) * 60),
                geometry: fallbackGeometry
            };
        }

        const data = await res.json();
        const route = data.routes?.[0];

        if (!route || typeof route.distance !== 'number' || typeof route.duration !== 'number') {
            const roadDist = Math.round(haversineDist * 1.28 * 10) / 10;
            return {
                distance_km: roadDist,
                duration_mins: Math.round((roadDist / 60) * 60),
                geometry: fallbackGeometry
            };
        }

        const geometry = (route.geometry?.coordinates as [number, number][]) || fallbackGeometry;

        return {
            distance_km: Math.round((route.distance / 1000) * 10) / 10,
            duration_mins: Math.round(route.duration / 60),
            geometry
        };
    } catch (err) {
        console.error('[Mapbox] Directions API error, using fallback:', err);
        const roadDist = Math.round(haversineDist * 1.28 * 10) / 10;
        return {
            distance_km: roadDist,
            duration_mins: Math.round((roadDist / 60) * 60),
            geometry: fallbackGeometry
        };
    }
}
