export interface GpsTrackingResponse {
  type: string;
  features: GpsFeature[];
}

export interface GpsFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  properties: Record<string, any>;
}

export interface TrackingStats {
  totalPoints: number;
  distanceTraveled: string;
  currentLocation: [number, number] | null;
  lastTimestamp: string;
}

export async function fetchTrackingData(fastApiBase?: string): Promise<GpsTrackingResponse> {
  const timestamp = Date.now();
  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache',
  };
  
  if (fastApiBase) {
    headers['X-FastAPI-Base'] = fastApiBase;
  }
  
  const response = await fetch(
    `/api/track?device_id=car01&start=0&end=9999999999999&format=geojson&_cb=${timestamp}`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function convertCoordinates(coordinates: number[][]): [number, number][] {
  // Convert from [lng, lat] to [lat, lng] format
  return coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
}

export function calculateStats(data: GpsTrackingResponse | null): TrackingStats {
  if (!data || !data.features || data.features.length === 0) {
    return {
      totalPoints: 0,
      distanceTraveled: '0 km',
      currentLocation: null,
      lastTimestamp: new Date().toLocaleTimeString(),
    };
  }

  const feature = data.features.find(f => f.geometry.type === 'LineString');
  if (!feature) {
    return {
      totalPoints: 0,
      distanceTraveled: '0 km',
      currentLocation: null,
      lastTimestamp: new Date().toLocaleTimeString(),
    };
  }

  const coordinates = convertCoordinates(feature.geometry.coordinates);
  const totalPoints = coordinates.length;
  
  // Simple distance calculation (this could be improved with proper haversine formula)
  let distance = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const lat1 = coordinates[i-1][0];
    const lon1 = coordinates[i-1][1];
    const lat2 = coordinates[i][0];
    const lon2 = coordinates[i][1];
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    distance += R * c;
  }

  return {
    totalPoints,
    distanceTraveled: `${distance.toFixed(1)} km`,
    currentLocation: coordinates.length > 0 ? coordinates[coordinates.length - 1] : null,
    lastTimestamp: new Date().toLocaleTimeString(),
  };
}
