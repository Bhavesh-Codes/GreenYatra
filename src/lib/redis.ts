import { Redis } from '@upstash/redis';

// TTL constants in seconds
export const GEOCODE_TTL = 60 * 60 * 24 * 30; // 30 days
export const MODE_FEASIBILITY_TTL = 60 * 60 * 24 * 7; // 7 days
export const ROUTE_EMISSIONS_TTL = 60 * 60 * 24 * 1; // 24 hours

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client if environment variables are available
export const redis =
    redisUrl && redisToken
        ? new Redis({
              url: redisUrl,
              token: redisToken
          })
        : null;

/**
 * Normalizes input strings by trimming whitespace, lowercasing, and collapsing multiple spaces.
 */
function normalizeKeyPart(str: string): string {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Generates a standardized cache key for geocode queries.
 * Format: "geocode:{normalized_query}"
 */
export function getGeocodeKey(query: string): string {
    return `geocode:${normalizeKeyPart(query)}`;
}

/**
 * Generates a standardized cache key for travel mode feasibility between origin and destination.
 * Format: "mode_feasibility:{normalized_origin}:{normalized_dest}"
 */
export function getFeasibilityKey(origin: string, dest: string): string {
    return `mode_feasibility:${normalizeKeyPart(origin)}:${normalizeKeyPart(dest)}`;
}

/**
 * Generates a standardized cache key for route emissions calculations.
 * Format: "route:{normalized_origin}:{normalized_dest}:{normalized_mode}"
 */
export function getRouteKey(origin: string, dest: string, mode: string): string {
    return `route:${normalizeKeyPart(origin)}:${normalizeKeyPart(dest)}:${normalizeKeyPart(mode)}`;
}

/**
 * Retrieves strongly-typed cached data from Redis.
 * Gracefully handles missing credentials or Redis connection errors by returning null.
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
    if (!redis) {
        console.warn(`[Redis] Skipping getCachedData for "${key}": Upstash Redis credentials not configured.`);
        return null;
    }

    try {
        const data = await redis.get<T>(key);
        return data ?? null;
    } catch (error) {
        console.warn(`[Redis] Warning: Failed to retrieve cached data for "${key}":`, error);
        return null;
    }
}

/**
 * Stores strongly-typed data in Redis with an expiration time in seconds.
 * Gracefully handles missing credentials or Redis connection errors without throwing.
 */
export async function setCachedData<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    if (!redis) {
        console.warn(`[Redis] Skipping setCachedData for "${key}": Upstash Redis credentials not configured.`);
        return;
    }

    try {
        await redis.set(key, data, { ex: ttlSeconds });
    } catch (error) {
        console.warn(`[Redis] Warning: Failed to set cached data for "${key}":`, error);
    }
}

/**
 * Deletes a cached entry from Redis.
 */
export async function deleteCachedData(key: string): Promise<void> {
    if (!redis) {
        return;
    }

    try {
        await redis.del(key);
    } catch (error) {
        console.warn(`[Redis] Warning: Failed to delete cached data for "${key}":`, error);
    }
}
