import { Station } from '../types';
import { getBrandFromName, isValidStation } from '../utils/brands';
import { isInsideMorocco } from '../utils/location';

const BBOX_CACHE: Record<string, Station[]> = {};

export async function fetchStationsInBounds(bounds: {
  south: number;
  west: number;
  north: number;
  east: number;
}): Promise<Station[]> {
  // SAFEGUARD: Prevent fetching if the area is too huge to avoid Overpass timeout
  const latDiff = Math.abs(bounds.north - bounds.south);
  const lngDiff = Math.abs(bounds.east - bounds.west);

  if (latDiff > 0.3 || lngDiff > 0.3) {
    return []; // Map is zoomed out too far. Return empty, let user zoom in.
  }

  // Cache key rounded to 2 decimal places to group nearby calls
  const cacheKey = `${bounds.south.toFixed(2)},${bounds.west.toFixed(2)},${bounds.north.toFixed(2)},${bounds.east.toFixed(2)}`;

  if (BBOX_CACHE[cacheKey]) {
    return BBOX_CACHE[cacheKey];
  }

  // Ensure exact ordering for Overpass: (south, west, north, east)
  const query = `
    [out:json][timeout:15];
    node["amenity"="fuel"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
    out body;
  `;

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.elements) return [];

    const ghostStations: Station[] = data.elements.map((node: any) => {
      const tags = node.tags || {};
      const rawName = tags.name || tags.operator || tags.brand || 'Unknown Station';

      const brand = getBrandFromName(rawName);

      // Skip stations outside Morocco or with invalid name
      if (!isInsideMorocco(node.lat, node.lon)) return null;
      if (!isValidStation(rawName, brand)) return null;

      return {
        id: `osm-${node.id}`,
        name: rawName === 'Unknown Station' ? `${brand} Station` : rawName,
        brand: brand,
        location: {
          lat: node.lat,
          lng: node.lon,
          address: tags['addr:street'] || tags['addr:full'] || 'Address unknown',
          city: tags['addr:city'] || 'Morocco'
        },
        prices: {},
        lastUpdated: 'Needs Verification',
        lastUpdatedTimestamp: 0,
        distance: 'Nearby',
        amenities: [],
        status: 'Open',
        trustScore: 0,
        isGhost: true
      };
    }).filter(Boolean) as Station[];

    BBOX_CACHE[cacheKey] = ghostStations;
    return ghostStations;

  } catch (error) {
    console.warn("Failed to fetch from Overpass API:", error);
    return [];
  }
}