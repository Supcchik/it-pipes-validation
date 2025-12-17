import type { ColumnDef } from '@/lib/types/asset-list';

// Mainlines (ML) Column Schema
export const ML_COLUMNS: ColumnDef[] = [
  { id: 'pipeSegment', label: 'Pipe Segment', field: 'pipeSegment', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'street', label: 'Street', field: 'street', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'material', label: 'Material', field: 'material', table: 'asset', type: 'select', sortable: true, filterable: true },
  { id: 'width', label: 'Width', field: 'width', table: 'asset', type: 'number', sortable: true, filterable: true },
  { id: 'upstreamMH', label: 'Upstream MH', field: 'upstreamMH', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'downstreamMH', label: 'Downstream MH', field: 'downstreamMH', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'maxGrade', label: 'Grade', field: 'maxGrade', table: 'observation', type: 'number', sortable: true, filterable: true },
  { id: 'observationCount', label: 'Observations', field: 'observationCount', table: 'observation', type: 'number', sortable: true, filterable: true },
  { id: 'certificateNumber', label: 'Certificate', field: 'certificateNumber', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'date', label: 'Inspection Date', field: 'date', table: 'inspection', type: 'date', sortable: true, filterable: true },
  { id: 'surveyedBy', label: 'Surveyed By', field: 'surveyedBy', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'city', label: 'City', field: 'city', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'project', label: 'Project', field: 'project', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'yearConstructed', label: 'Year Constructed', field: 'yearConstructed', table: 'asset', type: 'number', sortable: true, filterable: true },
  { id: 'yearRenewed', label: 'Year Renewed', field: 'yearRenewed', table: 'asset', type: 'number', sortable: true, filterable: true }
];

// Manholes (MH) Column Schema
export const MH_COLUMNS: ColumnDef[] = [
  { id: 'manholeId', label: 'Manhole ID', field: 'manholeId', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'street', label: 'Street', field: 'street', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'depth', label: 'Depth', field: 'depth', table: 'asset', type: 'number', sortable: true, filterable: true },
  { id: 'coverType', label: 'Cover Type', field: 'coverType', table: 'asset', type: 'select', sortable: true, filterable: true },
  { id: 'frameType', label: 'Frame Type', field: 'frameType', table: 'asset', type: 'select', sortable: true, filterable: true },
  { id: 'condition', label: 'Condition', field: 'condition', table: 'asset', type: 'select', sortable: true, filterable: true },
  { id: 'certificateNumber', label: 'Certificate', field: 'certificateNumber', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'date', label: 'Inspection Date', field: 'date', table: 'inspection', type: 'date', sortable: true, filterable: true },
  { id: 'surveyedBy', label: 'Surveyed By', field: 'surveyedBy', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'city', label: 'City', field: 'city', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'project', label: 'Project', field: 'project', table: 'asset', type: 'text', sortable: true, filterable: true }
];

// Laterals (L) Column Schema
export const L_COLUMNS: ColumnDef[] = [
  { id: 'lateralId', label: 'Lateral ID', field: 'lateralId', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'street', label: 'Street', field: 'street', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'propertyAddress', label: 'Property Address', field: 'propertyAddress', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'length', label: 'Length', field: 'length', table: 'asset', type: 'number', sortable: true, filterable: true },
  { id: 'material', label: 'Material', field: 'material', table: 'asset', type: 'select', sortable: true, filterable: true },
  { id: 'width', label: 'Width', field: 'width', table: 'asset', type: 'number', sortable: true, filterable: true },
  { id: 'connectionPoint', label: 'Connection Point', field: 'connectionPoint', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'serviceType', label: 'Service Type', field: 'serviceType', table: 'asset', type: 'select', sortable: true, filterable: true },
  { id: 'maxGrade', label: 'Grade', field: 'maxGrade', table: 'observation', type: 'number', sortable: true, filterable: true },
  { id: 'observationCount', label: 'Observations', field: 'observationCount', table: 'observation', type: 'number', sortable: true, filterable: true },
  { id: 'certificateNumber', label: 'Certificate', field: 'certificateNumber', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'date', label: 'Inspection Date', field: 'date', table: 'inspection', type: 'date', sortable: true, filterable: true },
  { id: 'surveyedBy', label: 'Surveyed By', field: 'surveyedBy', table: 'inspection', type: 'text', sortable: true, filterable: true },
  { id: 'city', label: 'City', field: 'city', table: 'asset', type: 'text', sortable: true, filterable: true },
  { id: 'project', label: 'Project', field: 'project', table: 'asset', type: 'text', sortable: true, filterable: true }
];

// Helper function to get columns by asset type
export function getColumnsByType(type: 'ML' | 'MH' | 'L'): ColumnDef[] {
  switch (type) {
    case 'ML':
      return ML_COLUMNS;
    case 'MH':
      return MH_COLUMNS;
    case 'L':
      return L_COLUMNS;
    default:
      return ML_COLUMNS; // Fallback to ML
  }
}


