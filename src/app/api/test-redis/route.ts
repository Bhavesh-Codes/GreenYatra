import { NextResponse } from 'next/server';
import { getCachedData, setCachedData } from '@/lib/redis';

interface HealthData {
    status: string;
    timestamp: number;
}

async function handleTestRedis() {
    try {
        const testKey = 'test:health';
        const payload: HealthData = {
            status: 'ok',
            timestamp: Date.now()
        };

        // Write test key with 60-second TTL
        await setCachedData<HealthData>(testKey, payload, 60);

        // Read the value back from Redis
        const cached = await getCachedData<HealthData>(testKey);

        if (!cached) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unable to retrieve test value from Redis. Ensure Upstash credentials are configured.'
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            cached
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Redis test API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Unknown error occurred while testing Redis'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return handleTestRedis();
}

export async function POST() {
    return handleTestRedis();
}
