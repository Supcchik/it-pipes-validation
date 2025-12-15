import type { PlotPoint } from '@/lib/types/asset-list';

/**
 * Calculate plot point position along a pipe segment with multiple coordinates
 * @param pipeCoordinates - Array of all coordinates along the pipe segment
 * @param pipeLength - Total length of the pipe in feet
 * @param observationDistance - Distance of observation along pipe in feet
 * @returns Calculated lat/lng position
 */
export function calculatePlotPosition(
  pipeCoordinates: { lat: number; lng: number }[],
  pipeLength: number,
  observationDistance: number
): { lat: number; lng: number } {
  if (pipeLength === 0 || pipeCoordinates.length === 0) {
    return pipeCoordinates[0] || { lat: 0, lng: 0 };
  }

  if (pipeCoordinates.length === 1) {
    return pipeCoordinates[0];
  }

  // Calculate cumulative distances for each segment
  let cumulativeDistance = 0;
  const segmentDistances: number[] = [0];
  
  for (let i = 1; i < pipeCoordinates.length; i++) {
    const [lat1, lng1] = [pipeCoordinates[i - 1].lat, pipeCoordinates[i - 1].lng];
    const [lat2, lng2] = [pipeCoordinates[i].lat, pipeCoordinates[i].lng];
    
    // Haversine formula for distance (simplified for small distances)
    const R = 20902231; // Earth radius in feet
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const segmentLength = R * c;
    
    cumulativeDistance += segmentLength;
    segmentDistances.push(cumulativeDistance);
  }

  // Find which segment contains the observation distance
  for (let i = 1; i < segmentDistances.length; i++) {
    if (observationDistance <= segmentDistances[i]) {
      // Interpolate within this segment
      const segmentStart = segmentDistances[i - 1];
      const segmentEnd = segmentDistances[i];
      const segmentLength = segmentEnd - segmentStart;
      
      if (segmentLength === 0) {
        return pipeCoordinates[i - 1];
      }
      
      const ratio = (observationDistance - segmentStart) / segmentLength;
      const startCoords = pipeCoordinates[i - 1];
      const endCoords = pipeCoordinates[i];
      
      return {
        lat: startCoords.lat + (endCoords.lat - startCoords.lat) * ratio,
        lng: startCoords.lng + (endCoords.lng - startCoords.lng) * ratio
      };
    }
  }

  // If observation distance exceeds pipe length, return last coordinate
  return pipeCoordinates[pipeCoordinates.length - 1];
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



