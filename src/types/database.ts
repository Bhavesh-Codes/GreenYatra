export type GreenTag = 'None' | 'Bronze' | 'Silver' | 'Gold';

export interface ScoreBreakdown {
    resource_efficiency: number;       // 40% weight
    recommendation_completion: number; // 30% weight
    guest_behavior: number;            // 20% weight
    accessibility_baseline: number;    // 10% weight
}

export interface AccessibilityFeatures {
    step_free_access: boolean;
    wheelchair_accessible: boolean;
    visual_assistance: boolean;
    hearing_assistance: boolean;
}

export interface Hotel {
    id: string;
    created_at: string;
    name: string;
    city: string;
    address?: string;
    latitude: number;
    longitude: number;
    description?: string;
    price_per_night: number;
    image_url?: string;
    baseline_audit: Record<string, any>;
    accessibility_features: AccessibilityFeatures;
    green_score: number;
    green_tag: GreenTag;
    score_breakdown: ScoreBreakdown;
    owner_user_id?: string | null;
}

export interface HotelUsage {
    id: string;
    hotel_id: string;
    date: string;
    energy_kwh: number;
    water_liters: number;
    food_waste_kg: number;
    energy_benchmark_kwh: number;
    water_benchmark_liters: number;
    food_waste_benchmark_kg: number;
    is_anomaly: boolean;
    anomaly_reason?: string;
    created_at: string;
}

export interface Recommendation {
    id: string;
    hotel_id: string;
    category: 'energy' | 'water' | 'food_waste';
    title: string;
    description: string;
    estimated_impact: string;
    status: 'Suggested' | 'In Progress' | 'Verified Complete';
    created_at: string;
    updated_at: string;
}

export interface GuestAction {
    action_id: string;
    title: string;
    points: number;
    completed_at: string;
}

export interface Stay {
    id: string;
    hotel_id: string;
    guest_name: string;
    guest_email?: string;
    room_number?: string;
    check_in: string;
    check_out: string;
    is_opted_in: boolean;
    points_accumulated: number;
    points_redeemed: number;
    actions_completed: GuestAction[];
    redemption_code?: string;
    status: 'Checked In' | 'Checked Out';
    created_at: string;
}