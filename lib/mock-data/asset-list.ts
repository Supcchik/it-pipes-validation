import type { View, Asset, ColumnDef } from '@/lib/types/asset-list';
import { generateFilterTestAssets } from './asset-list-filter-test';

// Mock Views
export const mockViews: View[] = [
  {
    id: 'view-1',
    name: 'NASCO Check',
    isFavorite: true,
    isDefault: true,
    displayedColumns: [
      'pipeSegment', 'street', 'upstreamMH', 'downstreamMH',
      'material', 'width', 'certificateNumber', 'surveyedBy'
    ],
    columnOrder: ['pipeSegment', 'street', 'upstreamMH', 'downstreamMH', 'material', 'width', 'certificateNumber', 'surveyedBy'],
    filters: [],
    mapRatio: 40,
    itemsPerPage: 100,
    createdAt: '2025-01-01',
    updatedAt: '2025-11-27',
    createdBy: 'system'
  },
  {
    id: 'view-2',
    name: 'Report Ready',
    isFavorite: true,
    isDefault: false,
    displayedColumns: [
      'pipeSegment', 'date', 'certificateNumber', 'observationCount', 'maxGrade'
    ],
    columnOrder: ['pipeSegment', 'date', 'certificateNumber', 'observationCount', 'maxGrade'],
    filters: [
      {
        id: 'f1',
        field: 'hasDefects',
        operator: 'equals',
        value: true,
        table: 'asset'
      }
    ],
    mapRatio: 30,
    itemsPerPage: 50,
    createdAt: '2025-01-15',
    updatedAt: '2025-11-20',
    createdBy: 'user-1'
  },
  {
    id: 'view-3',
    name: 'Daily Check',
    isFavorite: true,
    isDefault: false,
    displayedColumns: [
      'pipeSegment', 'street', 'material', 'width', 'date', 'surveyedBy'
    ],
    columnOrder: ['pipeSegment', 'street', 'material', 'width', 'date', 'surveyedBy'],
    filters: [],
    mapRatio: 50,
    itemsPerPage: 100,
    createdAt: '2025-02-01',
    updatedAt: '2025-11-25',
    createdBy: 'user-2'
  },
  {
    id: 'view-4',
    name: 'Material Check',
    isFavorite: false,
    isDefault: false,
    displayedColumns: ['pipeSegment', 'material', 'width', 'yearConstructed', 'yearRenewed'],
    columnOrder: ['pipeSegment', 'material', 'width', 'yearConstructed', 'yearRenewed'],
    filters: [
      {
        id: 'f2',
        field: 'material',
        operator: 'equals',
        value: 'Clay',
        table: 'asset'
      }
    ],
    mapRatio: 60,
    itemsPerPage: 200,
    createdAt: '2025-03-10',
    updatedAt: '2025-10-15',
    createdBy: 'user-1'
  },
  {
    id: 'view-5',
    name: 'Inspection Review',
    isFavorite: false,
    isDefault: false,
    displayedColumns: [
      'pipeSegment', 'certificateNumber', 'date', 'purpose', 'preCleaning', 'direction'
    ],
    columnOrder: ['pipeSegment', 'certificateNumber', 'date', 'purpose', 'preCleaning', 'direction'],
    filters: [],
    mapRatio: 40,
    itemsPerPage: 100,
    createdAt: '2025-04-01',
    updatedAt: '2025-11-15',
    createdBy: 'user-3'
  }
];

// Mock Assets (Mainlines - ML)
export const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    asset_type: 'ML',
    pipeSegment: 'ML-001',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Main Street',
    upstreamMH: 'MH-100',
    downstreamMH: 'MH-101',
    material: 'PVC',
    width: 12,
    yearConstructed: 2018,
    yearRenewed: 2022,
    latestInspection: {
      id: 'insp-1',
      certificateNumber: 'CERT-2025-001',
      date: '2025-11-15',
      purpose: 'Routine Inspection',
      preCleaning: true,
      direction: 'Downstream',
      mediaLabel: 'ML001_2025',
      weather: 'Clear',
      surveyedBy: 'John Smith'
    },
    observationCount: 3,
    hasDefects: true,
    maxGrade: 3
  },
  {
    id: 'asset-2',
    asset_type: 'ML',
    pipeSegment: 'ML-002',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Oak Avenue',
    upstreamMH: 'MH-101',
    downstreamMH: 'MH-102',
    material: 'Clay',
    width: 8,
    yearConstructed: 2015,
    yearRenewed: 2013,
    latestInspection: {
      id: 'insp-2',
      certificateNumber: 'CERT-2025-002',
      date: '2025-11-16',
      purpose: 'Post-Repair',
      preCleaning: false,
      direction: 'Upstream',
      mediaLabel: 'ML002_2025',
      weather: 'Rainy',
      surveyedBy: 'Jane Doe'
    },
    observationCount: 5,
    hasDefects: true,
    maxGrade: 4
  },
  {
    id: 'asset-3',
    asset_type: 'ML',
    pipeSegment: 'ML-003',
    project: 'CityTestQA',
    city: 'Springfield',
    street: 'Elm Street',
    upstreamMH: 'MH-102',
    downstreamMH: 'MH-103',
    material: 'Concrete',
    width: 15,
    yearConstructed: 2013,
    yearRenewed: 2020,
    latestInspection: {
      id: 'insp-3',
      certificateNumber: 'CERT-2025-003',
      date: '2025-11-17',
      purpose: 'Routine Inspection',
      preCleaning: true,
      direction: 'Downstream',
      mediaLabel: 'ML003_2025',
      weather: 'Clear',
      surveyedBy: 'John Smith'
    },
    observationCount: 1,
    hasDefects: false,
    maxGrade: 1
  },
  // Моки з різними варіаціями для тестування фільтрів (завжди є хоч кілька записів під будь-який фільтр)
  ...generateFilterTestAssets(57, 3),
];

// Mock Column Definitions
export const mockColumnDefs: ColumnDef[] = [
  // Asset Fields
  { id: 'pipeSegment', label: 'Pipe Segment', field: 'pipeSegment', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'project', label: 'Project', field: 'project', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'city', label: 'City', field: 'city', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'locationCode', label: 'Location Code', field: 'locationCode', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'street', label: 'Street', field: 'street', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'upstreamMH', label: 'Upstream MH', field: 'upstreamMH', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'downstreamMH', label: 'Downstream MH', field: 'downstreamMH', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'material', label: 'Material', field: 'material', table: 'asset', type: 'select', sortable: true, filterable: true },
  { id: 'width', label: 'Width', field: 'width', table: 'asset', type: 'number', sortable: true, filterable: true },
  { id: 'yearConstructed', label: 'Year Constructed', field: 'yearConstructed', table: 'asset', type: 'number', sortable: true, filterable: true },
  { id: 'yearRenewed', label: 'Year Renewed', field: 'yearRenewed', table: 'asset', type: 'number', sortable: true, filterable: true },
  
  // Inspection Fields
  { id: 'certificateNumber', label: 'Certificate Number', field: 'certificateNumber', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'date', label: 'Date', field: 'date', table: 'inspection', type: 'date', sortable: true, filterable: true },
  { id: 'purpose', label: 'Purpose', field: 'purpose', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'preCleaning', label: 'Pre Cleaning', field: 'preCleaning', table: 'inspection', type: 'select', sortable: true, filterable: true },
  { id: 'direction', label: 'Direction', field: 'direction', table: 'inspection', type: 'select', sortable: true, filterable: true },
  { id: 'mediaLabel', label: 'Media Label', field: 'mediaLabel', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'weather', label: 'Weather', field: 'weather', table: 'inspection', type: 'select', sortable: true, filterable: true },
  { id: 'surveyedBy', label: 'Surveyed By', field: 'surveyedBy', table: 'inspection', type: 'text', sortable: true, filterable: true },
  
  // Observation Summary Fields
  { id: 'observationCount', label: 'Observation Count', field: 'observationCount', table: 'observation', type: 'number', sortable: true, filterable: true },
  { id: 'hasDefects', label: 'Has Defects', field: 'hasDefects', table: 'observation', type: 'select', sortable: true, filterable: true },
  { id: 'maxGrade', label: 'Max Grade', field: 'maxGrade', table: 'observation', type: 'number', sortable: true, filterable: true }
];
