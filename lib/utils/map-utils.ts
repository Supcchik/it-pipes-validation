import type { PlotPoint } from '@/lib/types/asset-list';

/**
 * Calculate plot point position along a pipe segment
 * @param pipeStartCoords - Starting coordinates of the pipe
 * @param pipeEndCoords - Ending coordinates of the pipe
 * @param pipeLength - Total length of the pipe in feet
 * @param observationDistance - Distance of observation along pipe in feet
 * @returns Calculated lat/lng position
 */
export function calculatePlotPosition(
  pipeStartCoords: { lat: number; lng: number },
  pipeEndCoords: { lat: number; lng: number },
  pipeLength: number,
  observationDistance: number
): { lat: number; lng: number } {
  if (pipeLength === 0) {
    return pipeStartCoords;
  }

  // Linear interpolation along pipe segment
  const ratio = observationDistance / pipeLength;
  
  return {
    lat: pipeStartCoords.lat + (pipeEndCoords.lat - pipeStartCoords.lat) * ratio,
    lng: pipeStartCoords.lng + (pipeEndCoords.lng - pipeStartCoords.lng) * ratio
  };
}

/**
 * Calculate pipe length from coordinates
 * @param coordinates - Array of [lat, lng] coordinates
 * @returns Length in feet (approximate)
 */
export function calculatePipeLength(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;

  let totalLength = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const [lat1, lng1] = coordinates[i - 1];
    const [lat2, lng2] = coordinates[i];
    
    // Haversine formula for distance (simplified for small distances)
    const R = 20902231; // Earth radius in feet
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalLength += R * c;
  }

  return totalLength;
}


