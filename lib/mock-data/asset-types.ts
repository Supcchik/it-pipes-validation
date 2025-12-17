import type { Asset } from '@/lib/types/asset-list';

// Asset counts per type (мокові дані)
export const mockAssetCounts = {
  ML: 156,
  MH: 24,
  L: 89
};

// Mock Mainlines (ML) - використовуємо існуючі mockAssets з asset-list.ts
// Вони будуть оновлені з asset_type: 'ML'

// Mock Manholes (MH)
export const mockManholes: Asset[] = [
  {
    id: 'mh-1',
    asset_type: 'MH',
    manholeId: 'MH-104',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Main Street',
    depth: 8.5,
    coverType: 'Solid',
    frameType: 'Heavy Duty',
    condition: 'Fair',
    latestInspection: {
      id: 'insp-mh-1',
      certificateNumber: 'CERT-MH-2025-001',
      date: '2025-10-15',
      purpose: 'Structural Inspection',
      preCleaning: false,
      direction: 'N/A',
      mediaLabel: 'MH104_2025',
      weather: 'Clear',
      surveyedBy: 'John Smith'
    },
    geometry: {
      type: 'Point',
      // Use NYC area coordinates to match manholes (40.7580, -73.9860)
      coordinates: [40.7580, -73.9860]
    }
  },
  {
    id: 'mh-2',
    asset_type: 'MH',
    manholeId: 'MH-105',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Oak Avenue',
    depth: 12.0,
    coverType: 'Vented',
    frameType: 'Standard',
    condition: 'Good',
    latestInspection: {
      id: 'insp-mh-2',
      certificateNumber: 'CERT-MH-2025-002',
      date: '2025-10-20',
      purpose: 'Routine Inspection',
      preCleaning: false,
      direction: 'N/A',
      mediaLabel: 'MH105_2025',
      weather: 'Clear',
      surveyedBy: 'Jane Doe'
    },
    geometry: {
      type: 'Point',
      // Use NYC area coordinates to match manholes (40.7580, -73.9860)
      coordinates: [40.7585, -73.9865]
    }
  },
  {
    id: 'mh-3',
    asset_type: 'MH',
    manholeId: 'MH-106',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Elm Street',
    depth: 6.5,
    coverType: 'Keyed',
    frameType: 'Heavy Duty',
    condition: 'Excellent',
    latestInspection: {
      id: 'insp-mh-3',
      certificateNumber: 'CERT-MH-2025-003',
      date: '2025-11-01',
      purpose: 'Post-Repair',
      preCleaning: false,
      direction: 'N/A',
      mediaLabel: 'MH106_2025',
      weather: 'Clear',
      surveyedBy: 'Bob Johnson'
    },
    geometry: {
      type: 'Point',
      // Use NYC area coordinates to match manholes (40.7580, -73.9860)
      coordinates: [40.7590, -73.9870]
    }
  },
  // Generate more manholes
  ...Array.from({ length: 21 }, (_, i) => ({
    id: `mh-${i + 4}`,
    asset_type: 'MH' as const,
    manholeId: `MH-${107 + i}`,
    project: 'CityTestQA',
    city: 'Springfield',
    street: `Street ${i + 4}`,
    depth: [6, 8, 10, 12, 14][i % 5] + (i % 2 === 0 ? 0 : 0.5),
    coverType: (['Solid', 'Vented', 'Keyed'] as const)[i % 3],
    frameType: (['Standard', 'Heavy Duty', 'Custom'] as const)[i % 3],
    condition: (['Excellent', 'Good', 'Fair', 'Poor', 'Failed'] as const)[i % 5],
    latestInspection: {
      id: `insp-mh-${i + 4}`,
      certificateNumber: `CERT-MH-2025-${String(i + 4).padStart(3, '0')}`,
      date: new Date(2025, 9, 15 + (i % 20)).toISOString().split('T')[0],
      purpose: 'Structural Inspection',
      preCleaning: false,
      direction: 'N/A',
      mediaLabel: `MH${107 + i}_2025`,
      weather: (['Clear', 'Rainy', 'Cloudy'] as const)[i % 3],
      surveyedBy: (['John Smith', 'Jane Doe', 'Bob Johnson'] as const)[i % 3]
    },
    geometry: {
      type: 'Point' as const,
      // Use NYC area coordinates to match manholes (40.7580, -73.9860)
      coordinates: [40.7580 + (Math.floor(i / 6) * 0.0015), -73.9860 + ((i % 6) * 0.0015)]
    }
  }))
];

// Mock Laterals (L)
export const mockLaterals: Asset[] = [
  {
    id: 'l-1',
    asset_type: 'L',
    lateralId: 'LAT-104-A',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Main Street',
    propertyAddress: '123 Main St',
    length: 45,
    material: 'PVC',
    width: 6,
    connectionPoint: 'MH-104',
    serviceType: 'Residential',
    latestInspection: {
      id: 'insp-l-1',
      certificateNumber: 'CERT-L-2025-001',
      date: '2025-10-10',
      purpose: 'Routine Inspection',
      preCleaning: true,
      direction: 'Downstream',
      mediaLabel: 'LAT104A_2025',
      weather: 'Clear',
      surveyedBy: 'John Smith'
    },
    observationCount: 2,
    hasDefects: true,
    maxGrade: 2,
    geometry: {
      type: 'LineString',
      // Use NYC area coordinates to match manholes (40.7580, -73.9860)
      coordinates: [
        [40.7580, -73.9860],
        [40.7583, -73.9863]
      ]
    }
  },
  {
    id: 'l-2',
    asset_type: 'L',
    lateralId: 'LAT-104-B',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Main Street',
    propertyAddress: '125 Main St',
    length: 60,
    material: 'Clay',
    width: 8,
    connectionPoint: 'MH-104',
    serviceType: 'Residential',
    latestInspection: {
      id: 'insp-l-2',
      certificateNumber: 'CERT-L-2025-002',
      date: '2025-10-12',
      purpose: 'Post-Repair',
      preCleaning: false,
      direction: 'Downstream',
      mediaLabel: 'LAT104B_2025',
      weather: 'Rainy',
      surveyedBy: 'Jane Doe'
    },
    observationCount: 1,
    hasDefects: false,
    maxGrade: 1,
    geometry: {
      type: 'LineString',
      // Use NYC area coordinates to match manholes (40.7580, -73.9860)
      coordinates: [
        [40.7580, -73.9860],
        [40.7584, -73.9864]
      ]
    }
  },
  {
    id: 'l-3',
    asset_type: 'L',
    lateralId: 'LAT-105-A',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Oak Avenue',
    propertyAddress: '200 Oak Ave',
    length: 35,
    material: 'HDPE',
    width: 6,
    connectionPoint: 'MH-105',
    serviceType: 'Commercial',
    latestInspection: {
      id: 'insp-l-3',
      certificateNumber: 'CERT-L-2025-003',
      date: '2025-10-18',
      purpose: 'Routine Inspection',
      preCleaning: true,
      direction: 'Downstream',
      mediaLabel: 'LAT105A_2025',
      weather: 'Clear',
      surveyedBy: 'Bob Johnson'
    },
    observationCount: 3,
    hasDefects: true,
    maxGrade: 3,
    geometry: {
      type: 'LineString',
      // Use NYC area coordinates to match manholes (40.7580, -73.9860)
      coordinates: [
        [40.7585, -73.9865],
        [40.7586, -73.9866]
      ]
    }
  },
  // Generate more laterals
  ...Array.from({ length: 86 }, (_, i) => ({
    id: `l-${i + 4}`,
    asset_type: 'L' as const,
    lateralId: `LAT-${105 + Math.floor(i / 2)}-${String.fromCharCode(65 + (i % 26))}`,
    project: 'CityTestQA',
    city: 'Springfield',
    street: `Street ${Math.floor(i / 3) + 1}`,
    propertyAddress: `${100 + i} ${['Main St', 'Oak Ave', 'Elm St'][i % 3]}`,
    length: [30, 40, 50, 60, 70][i % 5],
    material: (['PVC', 'Clay', 'HDPE', 'Concrete'] as const)[i % 4],
    width: [4, 6, 8][i % 3],
    connectionPoint: `MH-${104 + Math.floor(i / 3)}`,
    serviceType: (['Residential', 'Commercial', 'Industrial'] as const)[i % 3],
    latestInspection: {
      id: `insp-l-${i + 4}`,
      certificateNumber: `CERT-L-2025-${String(i + 4).padStart(3, '0')}`,
      date: new Date(2025, 9, 10 + (i % 30)).toISOString().split('T')[0],
      purpose: (['Routine Inspection', 'Post-Repair', 'Emergency'] as const)[i % 3],
      preCleaning: i % 2 === 0,
      direction: 'Downstream',
      mediaLabel: `LAT${105 + Math.floor(i / 2)}${String.fromCharCode(65 + (i % 26))}_2025`,
      weather: (['Clear', 'Rainy', 'Cloudy'] as const)[i % 3],
      surveyedBy: (['John Smith', 'Jane Doe', 'Bob Johnson'] as const)[i % 3]
    },
    observationCount: (i % 5) + 1,
    hasDefects: i % 3 !== 0,
    maxGrade: (i % 5) + 1,
    geometry: {
      type: 'LineString' as const,
      // Use NYC area coordinates to match manholes and pipes (40.7580, -73.9860)
      coordinates: [
        [40.7580 + (Math.floor(i / 6) * 0.0015) + (i * 0.0001), -73.9860 + ((i % 6) * 0.0015) + (i * 0.0001)],
        [40.7580 + (Math.floor(i / 6) * 0.0015) + (i * 0.0001) + 0.0003, -73.9860 + ((i % 6) * 0.0015) + (i * 0.0001) + 0.0003]
      ]
    }
  }))
];

// Helper function to get all assets by type
export function getAssetsByType(type: 'ML' | 'MH' | 'L', allMainlines: Asset[]): Asset[] {
  switch (type) {
    case 'ML':
      return allMainlines;
    case 'MH':
      return mockManholes;
    case 'L':
      return mockLaterals;
    default:
      return [];
  }
}

// Helper function to get asset count by type
export function getAssetCountByType(type: 'ML' | 'MH' | 'L'): number {
  return mockAssetCounts[type];
}


