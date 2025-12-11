// TypeScript типи для Asset List Screen

// View Configuration
export interface View {
  id: string;
  name: string;
  isFavorite: boolean;
  isDefault: boolean;
  icon?: string;
  displayedColumns: string[];
  columnOrder: string[];
  columnWidths?: Record<string, number>;
  filters: FilterConfig[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  mapRatio: number; // 30-70, default 40
  itemsPerPage: number; // 25, 50, 100, 200
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Filter Configuration
export interface FilterConfig {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan';
  value: unknown;
  table: 'asset' | 'inspection' | 'observation';
}

// Filter Condition (for advanced grouping)
export interface FilterCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan';
  value: unknown;
}

// Filter Group (for AND/OR grouping)
export interface FilterGroup {
  id: string;
  conditions: FilterCondition[];
  operator: 'AND' | 'OR'; // between conditions within group
}

// Complex Filter (with groups)
export interface ComplexFilter {
  groups: FilterGroup[];
  groupOperator: 'AND' | 'OR'; // between groups
}

// Column Definition
export interface ColumnDef {
  id: string;
  label: string;
  field: string;
  table: 'asset' | 'inspection' | 'observation';
  type: 'text' | 'number' | 'date' | 'select';
  sortable: boolean;
  filterable: boolean;
  width?: number;
  minWidth?: number;
}

// Asset Data
export interface Asset {
  id: string;
  pipeSegment: string;
  project: string;
  city: string;
  locationCode?: string;
  locationDetails?: string;
  street: string;
  upstreamMH: string;
  downstreamMH: string;
  pipeUse?: string;
  drainageArea?: string;
  yearConstructed?: number;
  yearRenewed?: number;
  material: string;
  width: number;
  latestInspection?: {
    id: string;
    certificateNumber: string;
    date: string;
    purpose: string;
    preCleaning: boolean;
    direction: string;
    mediaLabel: string;
    weather: string;
    poNumber?: string;
    workOrder?: string;
    surveyedBy: string;
  };
  observationCount: number;
  hasDefects: boolean;
  maxGrade?: number;
  geometry?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

// Plot Point for defects on map
export interface PlotPoint {
  id: string;
  distance: number; // Distance along pipe in feet
  code: string;
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  lat: number; // Calculated from pipe geometry + distance
  lng: number;
  observationId: string;
}
