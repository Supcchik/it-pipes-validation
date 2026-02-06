/**
 * Типи для Activity Log (глобальний лог змін).
 */

export type ActivityUser = 'Roxie Robertson' | 'Michaela McCue' | 'Illia Suprun' | 'System';

export type ActivityActionType =
  | 'Created'
  | 'Edited'
  | 'Deleted'
  | 'Validated'
  | 'Status Changed'
  | 'added observation'
  | 'edited asset'
  | 'edited inspection'
  | 'edited observation'
  | 'deleted observation'
  | 'completed validation'
  | 'bulk edited'
  | 'imported'
  | 'changed grade'
  | 'changed status'
  | 'created asset';

export type ActivityEntityType = 'Asset' | 'Inspection' | 'Observation';

/** Один рядок diff: old → new або опис зміни */
export interface ActivityDiffRow {
  field?: string;
  old?: string;
  new?: string;
  /** Вільний текст (наприклад "New observation: ...", "Deleted: ...") */
  text?: string;
}

export interface ActivityEntry {
  id: string;
  userName: ActivityUser;
  actionType: string;
  entityType: ActivityEntityType;
  assetIds: string[];
  /** ISO date for grouping and filtering */
  dateKey: string;
  /** Display timestamp: "2 hours ago", "yesterday at 3:45 PM", "February 4 at 4:30 PM" */
  timestampDisplay: string;
  description?: string;
  diffRows: ActivityDiffRow[];
}
