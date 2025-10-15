// Типи для inspection модуля

export interface Observation {
  id: number;
  timestamp: string;
  distance: number;
  code: string;
  description: string;
  grade: number;
  status: 'new' | 'same' | 'modified';
  // New fields from screenshot
  continuous: 'Yes' | 'No';
  value1: string;
  value2: string;
  percent: string;
  joint: boolean;
  clock1: string;
  clock2: string;
  remarks: string;
}

export interface QuickCode {
  id: number;
  name: string;
  code: string;
  icon: string;
  description?: string;
  grade?: number;
  usageCount?: number;
}

export interface EditingCell {
  id: number;
  field: string;
}

export interface ContextMenuState {
  x: number;
  y: number;
  observation: Observation;
}

export interface ToastState {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface PipeSegmentInfo {
  reference: string;
  material: string;
  diameter: string;
  upstreamManhole: string;
  downstreamManhole: string;
}

export interface ChangeLogEntry {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Inspection {
  id: number;
  date: string;
  observations: Observation[];
  videoUrl?: string;
}

export type ComparisonLayout = 'vertical' | 'horizontal' | 'slider';

export interface ComparisonState {
  isActive: boolean;
  selectedInspection: Inspection | null;
  layout: 'vertical' | 'horizontal'; // Changed from ComparisonLayout for simplicity
  syncedPlayback: boolean;
  currentVideoTime: number;
  previousVideoTime: number;
  currentVideoPlaying: boolean;
  previousVideoPlaying: boolean;
}

