// Geolocation and Proximity Radius Utilities for Forced Broadcast Transmission

export interface Coordinates {
  lat: number;
  lng: number;
  name?: string;
  accuracy?: number;
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @returns distance in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats kilometers into readable string (e.g., '850 m' or '12.4 km')
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Checks whether a given client coordinate is within the broadcast radius.
 * If radiusKm is 0 or undefined, returns true (global broadcast for all users & non-users).
 */
export function isWithinRadius(
  clientCoords: { lat: number; lng: number } | null,
  epicenter: { lat: number; lng: number } | undefined,
  radiusKm?: number
): { inRadius: boolean; distanceKm: number | null; isGlobal: boolean } {
  // If radius is 0 or not specified, it's a global transmission
  if (!radiusKm || radiusKm <= 0) {
    const distanceKm =
      clientCoords && epicenter
        ? calculateDistanceKm(
            clientCoords.lat,
            clientCoords.lng,
            epicenter.lat,
            epicenter.lng
          )
        : null;
    return { inRadius: true, distanceKm, isGlobal: true };
  }

  // If no epicenter specified, broadcast defaults to global
  if (!epicenter) {
    return { inRadius: true, distanceKm: null, isGlobal: true };
  }

  // If client coordinates are not yet available, default to in-radius so no visitor is missed
  if (!clientCoords) {
    return { inRadius: true, distanceKm: null, isGlobal: false };
  }

  const distance = calculateDistanceKm(
    clientCoords.lat,
    clientCoords.lng,
    epicenter.lat,
    epicenter.lng
  );

  return {
    inRadius: distance <= radiusKm,
    distanceKm: distance,
    isGlobal: false,
  };
}
