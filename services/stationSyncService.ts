import { supabase } from '../lib/supabase';
import { Station } from '../types';
import { calculateDistance } from '../utils/distance';
import { isInsideMorocco } from '../utils/location';
import { getBrandFromName, isValidStation } from '../utils/brands';

const ADMIN_ID = 'cd735655-7db6-4e45-838b-aa3b8cf10e51';

export async function syncNewStations(discoveredStations: Station[], dbStations: Station[]) {
    // Filter stations that don't exist in the database based on proximity (within 50 meters)
    const newStations = discoveredStations.filter(dyn => {
        const brand = getBrandFromName(dyn.name);
        return isInsideMorocco(dyn.location.lat, dyn.location.lng) &&
            isValidStation(dyn.name, brand) &&
            !dbStations.some(db => {
                const dist = calculateDistance(dyn.location.lat, dyn.location.lng, db.location.lat, db.location.lng);
                return dist < 50;
            });
    });

    if (newStations.length === 0) return;

    console.log(`[StationSync] Found ${newStations.length} new stations to capture.`);

    const stationsToInsert = newStations.map(s => ({
        name: s.name,
        brand: getBrandFromName(s.name),
        location: s.location,
        lat: s.location.lat,
        lng: s.location.lng,
        prices: {},
        last_updated: new Date().toISOString(),
        last_updated_timestamp: Date.now(),
        verified_by: process.env.VITE_ADMIN_USER_ID || ADMIN_ID,
        status: 'Open',
        trust_score: 0,
        is_ghost: true
    }));

    try {
        const { error } = await supabase
            .from('stations')
            .insert(stationsToInsert);

        if (error) {
            console.error('[StationSync] Error inserting new stations:', error);
        } else {
            console.log(`[StationSync] Successfully captured ${newStations.length} new stations.`);
        }
    } catch (err) {
        console.error('[StationSync] Unexpected error:', err);
    }
}
