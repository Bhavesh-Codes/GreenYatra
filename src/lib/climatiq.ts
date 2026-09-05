// Map internal mode names to Climatiq verified Activity IDs (data_version ^37)
const CLIMATIQ_ACTIVITY_IDS: Record<string, string> = {
    train: 'passenger_train-route_type_intercity-fuel_source_na',
    bus: 'passenger_vehicle-vehicle_type_bus-fuel_source_na-distance_na-engine_size_na',
    flight: 'passenger_flight-route_type_domestic-aircraft_type_na-distance_na-class_na-rf_included-distance_uplift_included',
    car: 'passenger_vehicle-vehicle_type_large_car-fuel_source_petrol-distance_na-engine_size_na',
    shared_ev: 'passenger_vehicle-vehicle_type_car-fuel_source_bev-engine_size_na-vehicle_age_na-vehicle_weight_na',
    ev: 'passenger_vehicle-vehicle_type_car-fuel_source_bev-engine_size_na-vehicle_age_na-vehicle_weight_na'
};

// Fallback emission factors in kg CO2e per passenger-km (derived from Climatiq verified Indian/Global benchmarks)
const FALLBACK_FACTORS_PER_PASSENGER_KM: Record<string, number> = {
    flight: 0.22928,
    car: 0.184,
    shared_ev: 0.06955,
    ev: 0.06955,
    train: 0.06013,
    bus: 0.04141
};

/**
 * Normalizes travel mode identifier to canonical key.
 */
function normalizeMode(mode: string): string {
    const m = mode.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (m === 'ev' || m === 'shared_ev' || m === 'sharedev' || m === 'electric_vehicle') return 'shared_ev';
    if (m === 'rail' || m === 'railway' || m === 'train') return 'train';
    if (m === 'plane' || m === 'airplane' || m === 'flight') return 'flight';
    if (m === 'automobile' || m === 'cab' || m === 'car') return 'car';
    if (m === 'bus' || m === 'coach') return 'bus';
    return m;
}

/**
 * Calculates carbon footprint in kg CO2e for a given transport mode, distance, and passenger count
 * using the official Climatiq API.
 * Includes verified fallback factors to ensure seamless resilience.
 */
export async function calculateEmissions(
    mode: string,
    distanceKm: number,
    travelers: number = 1
): Promise<number> {
    const validDistance = Math.max(1, Math.round(distanceKm * 10) / 10);
    const validPassengers = Math.max(1, travelers);
    const normMode = normalizeMode(mode);

    const activityId = CLIMATIQ_ACTIVITY_IDS[normMode] || CLIMATIQ_ACTIVITY_IDS.car;
    const climatiqKey = process.env.CLIMATIQ_API_KEY;

    if (climatiqKey) {
        try {
            const res = await fetch('https://api.climatiq.io/data/v1/estimate', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${climatiqKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emission_factor: {
                        activity_id: activityId,
                        data_version: '^37'
                    },
                    parameters: {
                        passengers: validPassengers,
                        distance: validDistance,
                        distance_unit: 'km'
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (typeof data.co2e === 'number') {
                    return Math.round(data.co2e * 100) / 100;
                }
            } else {
                const errBody = await res.text();
                console.warn(`[Climatiq] Estimate request returned ${res.status}: ${errBody}`);
            }
        } catch (err) {
            console.error('[Climatiq] Error calling Climatiq API, using fallback factor:', err);
        }
    } else {
        console.warn('[Climatiq] CLIMATIQ_API_KEY is not configured, using fallback factor.');
    }

    // Fallback calculation
    const factor = FALLBACK_FACTORS_PER_PASSENGER_KM[normMode] ?? 0.184;
    const fallbackCo2e = factor * validDistance * validPassengers;
    return Math.round(fallbackCo2e * 100) / 100;
}
