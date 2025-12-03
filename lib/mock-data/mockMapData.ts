// Mock Map Data for Interactive Map Panel
// Manholes and Pipe Segments derived from Assets

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Manhole {
  id: string;
  name: string;
  coordinates: Coordinate;
  type: 'upstream' | 'downstream';
  elevation?: number;
  material?: string;
  lastInspected?: string;
}

export interface PipeSegment {
  id: string;
  name: string; // e.g., "111-008_111-005"
  upstreamManholeId: string;
  downstreamManholeId: string;
  coordinates: Coordinate[]; // Array of points forming the line
  material: string;
  diameter: number;
  length: number;
  lastInspected?: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  assetId: string; // Link to Asset
}

// Generate mock manholes based on common MH names from assets
// Using NYC area coordinates as base (40.7580, -73.9860)
const BASE_LAT = 40.7580;
const BASE_LNG = -73.9860;

// Generate unique manholes from MH-100 to MH-130 (30 manholes)
export const MOCK_MANHOLES: Manhole[] = Array.from({ length: 31 }, (_, i) => {
  const mhNumber = 100 + i;
  const mhName = `MH-${mhNumber}`;
  
  // Create a grid pattern for manholes
  const row = Math.floor(i / 6);
  const col = i % 6;
  
  return {
    id: `mh-${mhNumber}`,
    name: mhName,
    coordinates: {
      lat: BASE_LAT + (row * 0.0015),
      lng: BASE_LNG + (col * 0.0015),
    },
    type: i % 2 === 0 ? 'upstream' : 'downstream',
    elevation: 240 + (i * 2),
    material: ['Concrete', 'Brick', 'PVC'][i % 3],
    lastInspected: i % 3 === 0 ? '2024-11-15' : i % 3 === 1 ? '2024-10-20' : undefined,
  };
});

// Generate pipe segments connecting manholes
// Each pipe connects MH-100+i to MH-101+i (creating a chain)
export const MOCK_PIPE_SEGMENTS: PipeSegment[] = Array.from({ length: 30 }, (_, i) => {
  const upstreamMH = MOCK_MANHOLES[i];
  const downstreamMH = MOCK_MANHOLES[i + 1];
  
  if (!upstreamMH || !downstreamMH) {
    // Return a placeholder pipe segment if manholes are missing
    return {
      id: `pipe-${i + 1}`,
      name: `MH-${100 + i}_MH-${101 + i}`,
      upstreamManholeId: `mh-${100 + i}`,
      downstreamManholeId: `mh-${101 + i}`,
      coordinates: [],
      material: 'Unknown',
      diameter: 0,
      length: 0,
      assetId: `asset-${i + 1}`,
    };
  }
  
  // Create curved path between manholes (3 points for smooth curve)
  const midLat = (upstreamMH.coordinates.lat + downstreamMH.coordinates.lat) / 2;
  const midLng = (upstreamMH.coordinates.lng + downstreamMH.coordinates.lng) / 2;
  
  // Add slight curve
  const curveOffset = 0.0003;
  const coordinates: Coordinate[] = [
    upstreamMH.coordinates,
    {
      lat: midLat + (i % 2 === 0 ? curveOffset : -curveOffset),
      lng: midLng,
    },
    downstreamMH.coordinates,
  ];
  
  // Calculate approximate length (simplified)
  const latDiff = downstreamMH.coordinates.lat - upstreamMH.coordinates.lat;
  const lngDiff = downstreamMH.coordinates.lng - upstreamMH.coordinates.lng;
  const length = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // Convert to meters, then to feet
  const lengthFeet = Math.round(length * 3.28084);
  
  const materials = ['PVC', 'Clay', 'Concrete', 'HDPE'];
  const diameters = [8, 10, 12, 15, 18];
  const grades: ('A' | 'B' | 'C' | 'D' | 'F')[] = ['A', 'B', 'C', 'D', 'F'];
  
  return {
    id: `pipe-${i + 1}`,
    name: `${upstreamMH.name}_${downstreamMH.name}`,
    upstreamManholeId: upstreamMH.id,
    downstreamManholeId: downstreamMH.id,
    coordinates,
    material: materials[i % materials.length],
    diameter: diameters[i % diameters.length],
    length: lengthFeet,
    lastInspected: i % 3 === 0 ? '2024-11-15' : i % 3 === 1 ? '2024-10-20' : undefined,
    grade: grades[i % grades.length],
    assetId: `asset-${i + 1}`, // Link to asset
  };
}).filter(Boolean);

// Helper function to get manhole by name (e.g., "MH-100")
export function getManholeByName(name: string): Manhole | undefined {
  return MOCK_MANHOLES.find(mh => mh.name === name);
}

// Helper function to get pipe segment by asset ID
export function getPipeSegmentByAssetId(assetId: string): PipeSegment | undefined {
  return MOCK_PIPE_SEGMENTS.find(pipe => pipe.assetId === assetId);
}

// Helper function to get all manholes for an asset (upstream + downstream)
export function getManholesForAsset(upstreamMHName: string, downstreamMHName: string): Manhole[] {
  const upstream = getManholeByName(upstreamMHName);
  const downstream = getManholeByName(downstreamMHName);
  return [upstream, downstream].filter(Boolean) as Manhole[];
}

