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
  /**
   * Новий трирівневий режим фільтрів.
   *
   * simple  – прості фільтри (усі AND).
   * groups  – групи з OR між групами.
   * advanced – розширений конструктор з AND/OR усередині груп.
   *
   * Це значення опційне, щоб не ламати існуючі в'юхи.
   */
  filterMode?: FilterMode;
  /**
   * Стан simple-рівня. Якщо не заданий, можна побудувати з legacy `filters`.
   */
  simpleFilters?: SimpleFilterState;
  /**
   * Стан групового рівня (Filter Groups).
   */
  groupFilters?: GroupFilterState;
  /**
   * Стан розширеного рівня (Advanced Builder).
   */
  advancedFilters?: AdvancedFilterState;
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

// Filter Condition (для старого ComplexFilter, використовується у buildQuery)
export interface FilterCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan';
  value: unknown;
}

// Filter Group (старий тип для ComplexFilter, не плутати з новими GroupFilterState)
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

/**
 * Нові типи для трирівневої системи фільтрів
 */

// Режим фільтрів для View
export type FilterMode = 'simple' | 'groups' | 'advanced';

// Simple level – список умов (усі AND між собою)
export interface SimpleFilterState {
  type: 'simple';
  conditions: FilterConfig[];
}

// Група для нового групового рівня
export interface NewFilterGroup {
  id: string;
  name: string;
  conditions: FilterConfig[];
}

// Groups level – кілька груп з OR між ними
export interface GroupFilterState {
  type: 'groups';
  groups: NewFilterGroup[];
}

// Умова з оператором до наступної (для Advanced рівня)
export interface ConditionWithOperator extends FilterConfig {
  /**
   * Оператор до наступної умови в межах групи.
   * Якщо undefined – умова остання в групі.
   */
  nextOperator?: 'AND' | 'OR';
}

// Група для Advanced рівня
export interface AdvancedGroup {
  id: string;
  name: string;
  conditions: ConditionWithOperator[];
}

// Advanced level – повна схема AND/OR усередині груп, OR між групами
export interface AdvancedFilterState {
  type: 'advanced';
  groups: AdvancedGroup[];
}

/**
 * Нормалізоване дерево фільтрів, яке використовує таблиця/бекенд.
 *
 * Для PoC зручно тримати окремі гілки під кожен режим, але застосування
 * працює через єдину функцію applyFilters.
 */
export type NormalizedFilterTree =
  | { mode: 'none' }
  | { mode: 'simple'; simple: SimpleFilterState }
  | { mode: 'groups'; groups: GroupFilterState }
  | { mode: 'advanced'; advanced: AdvancedFilterState };

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
