import { supabase } from '../lib/supabase';
import { Station, FuelType } from '../types';

// Points configuration
const POINTS = {
    MANUAL_REPORT: 50,
    SCAN_REPORT: 50,
    VOICE_REPORT: 50,
    CONFIRM: 10,
    PIONEER: 200,
} as const;

// XP thresholds per level (level -> xp needed for next level)
function getNextLevelXp(level: number): number {
    return 100 + (level - 1) * 50; // Level 1: 100, Level 2: 150, Level 3: 200, etc.
}

export interface SubmitPriceParams {
    userId: string;
    stationId: string;
    fuelType: string;
    price: number;
    reportType: 'manual' | 'scan' | 'voice' | 'confirm' | 'pioneer';
    userName?: string;
    userLevel?: number;
}

export interface AddStationParams {
    userId: string;
    userName: string;
    userLevel: number;
    brand: string;
    location: { lat: number; lng: number };
    fuelType: string;
    price: number;
}

export interface SubmitResult {
    success: boolean;
    pointsEarned: number;
    error?: string;
    stationId?: string;
}

/**
 * Submit a price report for an existing station.
 * Updates the station price, logs the report, and awards points to the user.
 * Now using an atomic RPC for data integrity.
 */
export async function submitPriceReport(params: SubmitPriceParams): Promise<SubmitResult> {
    const { userId, stationId, fuelType, price, reportType, userLevel } = params;

    const pointsMap: Record<string, number> = {
        manual: POINTS.MANUAL_REPORT,
        scan: POINTS.SCAN_REPORT,
        voice: POINTS.VOICE_REPORT,
        confirm: POINTS.CONFIRM,
        pioneer: POINTS.PIONEER,
    };
    const pointsEarned = pointsMap[reportType] || POINTS.MANUAL_REPORT;

    try {
        const { data, error } = await supabase.rpc('submit_price_report_rpc', {
            p_user_id: userId,
            p_station_id: stationId,
            p_fuel_type: fuelType,
            p_price: price,
            p_report_type: reportType,
            p_points_earned: pointsEarned,
            p_user_level: userLevel || 1
        });

        if (error) {
            console.error('RPC Error submitting price report:', error);
            return { success: false, pointsEarned: 0, error: error.message };
        }

        return { success: true, pointsEarned };
    } catch (err: any) {
        console.error('submitPriceReport failed:', err);
        return { success: false, pointsEarned: 0, error: err.message };
    }
}

/**
 * Confirm existing prices on a station (the 👍 button).
 */
export async function confirmPrice(
    stationId: string,
    userId: string,
    fuelType: string = 'Diesel',
    currentPrice: number = 0
): Promise<SubmitResult> {
    try {
        // 1. Prevent users from confirming a price they just reported/added
        const { data: station } = await supabase
            .from('stations')
            .select('verified_by')
            .eq('id', stationId)
            .single();

        if (station?.verified_by === userId) {
            return { success: false, pointsEarned: 0, error: 'You cannot confirm a price you just reported.' };
        }

        // 2. Prevent users from reporting/confirming the same station twice in one day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: recentReports } = await supabase
            .from('price_reports')
            .select('id')
            .eq('station_id', stationId)
            .eq('user_id', userId)
            .gte('created_at', startOfDay.toISOString());

        if (recentReports && recentReports.length > 0) {
            return { success: false, pointsEarned: 0, error: 'You have already reported or confirmed this station today.' };
        }

        return submitPriceReport({
            userId,
            stationId,
            fuelType,
            price: currentPrice,
            reportType: 'confirm',
        });
    } catch (err: any) {
        console.error('Error confirming price:', err);
        return { success: false, pointsEarned: 0, error: err.message };
    }
}

/**
 * Add a brand new station and submit its first price (Pioneer reward).
 */
export async function addNewStation(params: AddStationParams): Promise<SubmitResult> {
    const { userId, userName, userLevel, brand, location, fuelType, price } = params;

    try {
        // 1. Insert the new station
        const { data: newStation, error: insertError } = await supabase
            .from('stations')
            .insert({
                name: `${brand} Station`,
                brand: brand,
                location: {
                    lat: location.lat,
                    lng: location.lng,
                    address: 'User Added',
                    city: 'Morocco',
                },
                prices: { [fuelType]: price },
                last_updated: new Date().toISOString(),
                last_updated_timestamp: Date.now(),
                verified_by: userId,
                verified_by_level: userLevel || 1,
                distance: 'Nearby',
                amenities: [],
                status: 'Open',
                trust_score: 50,
                is_ghost: false,
            })
            .select('id')
            .single();

        if (insertError || !newStation) {
            console.error('Error inserting station:', insertError);
            return { success: false, pointsEarned: 0, error: insertError?.message || 'Failed to create station' };
        }

        // 2. Submit the price report with Pioneer bonus
        const result = await submitPriceReport({
            userId,
            stationId: newStation.id,
            fuelType: fuelType,
            price: price,
            reportType: 'pioneer',
            userName,
            userLevel,
        });

        return { ...result, stationId: newStation.id };
    } catch (err: any) {
        console.error('addNewStation failed:', err);
        return { success: false, pointsEarned: 0, error: err.message };
    }
}

/**
 * Award points and XP to a user, handling level-up logic.
 */
async function awardPoints(
    userId: string,
    points: number,
    reportType: string
): Promise<void> {
    // Fetch current user data
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('total_points, xp, next_level_xp, level, reports_count, verified_count')
        .eq('id', userId)
        .single();

    if (fetchError || !user) {
        console.error('Error fetching user for point award:', fetchError);
        return;
    }

    let newXp = (user.xp || 0) + points;
    let newLevel = user.level || 1;
    let newNextLevelXp = user.next_level_xp || 100;

    // Check for level-up
    while (newXp >= newNextLevelXp) {
        newXp -= newNextLevelXp;
        newLevel += 1;
        newNextLevelXp = getNextLevelXp(newLevel);
    }

    const isReport = ['manual', 'scan', 'voice', 'pioneer'].includes(reportType);
    const isConfirm = reportType === 'confirm';

    const { error: updateError } = await supabase
        .from('users')
        .update({
            total_points: (user.total_points || 0) + points,
            xp: newXp,
            level: newLevel,
            next_level_xp: newNextLevelXp,
            reports_count: (user.reports_count || 0) + (isReport ? 1 : 0),
            verified_count: (user.verified_count || 0) + (isConfirm ? 1 : 0),
        })
        .eq('id', userId);

    if (updateError) {
        console.error('Error awarding points:', updateError);
    }
}

/**
 * Helper to map Supabase snake_case station data to camelCase Station interface.
 */
export function mapStation(raw: any): Station {
    return {
        id: raw.id,
        name: raw.name,
        brand: raw.brand,
        location: raw.location,
        prices: raw.prices || {},
        lastUpdated: raw.last_updated ? new Date(raw.last_updated).toLocaleString() : 'Recently',
        lastUpdatedTimestamp: raw.last_updated_timestamp || (raw.last_updated ? new Date(raw.last_updated).getTime() : 0),
        verifiedBy: raw.verified_by,
        verifiedByLevel: raw.verified_by_level,
        distance: raw.distance || 'Nearby',
        amenities: raw.amenities || [],
        status: raw.status || 'Open',
        trustScore: raw.trust_score || 0,
        isGhost: raw.is_ghost || false,
    };
}

/**
 * Refresh stations from Supabase — returns all stations.
 */
export async function fetchAllStations(): Promise<Station[]> {
    const { data, error } = await supabase.from('stations').select('*');
    if (error) {
        console.error('Error fetching stations:', error);
        return [];
    }
    return (data || []).map(mapStation);
}
