import type {
  ComplexFilter,
  FilterGroup,
  FilterCondition,
  FilterConfig,
  SimpleFilterState,
  GroupFilterState,
  NewFilterGroup,
  AdvancedFilterState,
  AdvancedGroup,
  ConditionWithOperator,
} from '@/lib/types/asset-list';
import type { Asset, NormalizedFilterTree } from '@/lib/types/asset-list';

/**
 * Build query string from ComplexFilter
 * @param filter - Complex filter with groups
 * @returns Query string representation
 */
export function buildQuery(filter: ComplexFilter): string {
  const groupQueries = filter.groups.map(group => {
    const conditions = group.conditions.map(c => {
      const operatorSymbol = getOperatorSymbol(c.operator);
      return `${c.field} ${operatorSymbol} ${formatValue(c.value)}`;
    }).join(` ${group.operator} `);
    return `(${conditions})`;
  });
  
  return groupQueries.join(` ${filter.groupOperator} `);
}

/**
 * Get operator symbol for display
 */
function getOperatorSymbol(operator: FilterCondition['operator']): string {
  switch (operator) {
    case 'equals': return '=';
    case 'contains': return '⊃';
    case 'startsWith': return '⊂';
    case 'greaterThan': return '>';
    case 'lessThan': return '<';
    default: return operator;
  }
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
}

/**
 * Convert ComplexFilter to human-readable description
 */
export function getFilterDescription(filter: ComplexFilter): string {
  if (filter.groups.length === 0) return 'No filters';
  
  const groupDescriptions = filter.groups.map((group, index) => {
    if (group.conditions.length === 0) return '';
    
    const conditions = group.conditions.map(c => {
      const column = mockColumnDefs.find(col => col.field === c.field);
      const fieldName = column?.label || c.field;
      return `${fieldName} ${getOperatorSymbol(c.operator)} ${formatValue(c.value)}`;
    }).join(` ${group.operator} `);
    
    return `(${conditions})`;
  }).filter(Boolean);
  
  if (groupDescriptions.length === 0) return 'No filters';
  if (groupDescriptions.length === 1) return groupDescriptions[0];
  
  return groupDescriptions.join(` ${filter.groupOperator} `);
}

// Import mockColumnDefs for field labels
import { mockColumnDefs } from '@/lib/mock-data/asset-list';

/**
 * Невеликий хелпер: перевіряє, чи значення фільтра вважаємо «заповненим».
 */
function hasNonEmptyValue(filter: Pick<FilterConfig, 'value'>): boolean {
  if (filter.value === null || filter.value === undefined) return false;
  if (typeof filter.value === 'string' && filter.value.trim() === '') return false;
  return true;
}

/**
 * ================================
 *  Конвертери між рівнями фільтрів
 * ================================
 *
 * ВАЖЛИВО:
 *  - усі функції чисті;
 *  - не мутують вхідні масиви;
 *  - повертають нові обʼєкти, щоб уникати нечітких side-effectʼів.
 */

// SIMPLE  ←→  LEGACY

export function simpleFromLegacy(filters: FilterConfig[] | undefined | null): SimpleFilterState {
  const safeFilters = Array.isArray(filters) ? filters : [];

  // Копія масиву, щоб не змінювати оригінал
  const conditions = safeFilters.map((f) => ({ ...f }));

  return {
    type: 'simple',
    conditions,
  };
}

export function legacyFromSimple(state: SimpleFilterState | undefined | null): FilterConfig[] {
  if (!state || !Array.isArray(state.conditions)) {
    return [];
  }

  return state.conditions.map((f) => ({ ...f }));
}

// SIMPLE  →  GROUPS

export function groupsFromSimple(state: SimpleFilterState | undefined | null): GroupFilterState {
  const conditions = state?.conditions ?? [];

  const group: NewFilterGroup = {
    id: 'group-a',
    name: 'Group A',
    conditions: conditions.map((c) => ({ ...c })),
  };

  return {
    type: 'groups',
    groups: [group],
  };
}

// GROUPS  →  SIMPLE (тільки якщо одна група)

export function simpleFromGroups(state: GroupFilterState | undefined | null): SimpleFilterState | null {
  if (!state || !Array.isArray(state.groups) || state.groups.length !== 1) {
    return null;
  }

  const [onlyGroup] = state.groups;

  return {
    type: 'simple',
    conditions: (onlyGroup.conditions ?? []).map((c) => ({ ...c })),
  };
}

// GROUPS  →  ADVANCED (усі звʼязки всередині груп AND за замовчуванням)

export function advancedFromGroups(state: GroupFilterState | undefined | null): AdvancedFilterState {
  const groups: AdvancedGroup[] = [];

  if (state && Array.isArray(state.groups)) {
    for (const g of state.groups) {
      const conditions: ConditionWithOperator[] = [];

      g.conditions.forEach((c, index) => {
        const isLast = index === g.conditions.length - 1;
        const condition: ConditionWithOperator = {
          ...c,
          // За замовчуванням звʼязуємо AND, окрім останньої умови.
          nextOperator: isLast ? undefined : 'AND',
        };
        conditions.push(condition);
      });

      groups.push({
        id: g.id,
        name: g.name,
        conditions,
      });
    }
  }

  return {
    type: 'advanced',
    groups,
  };
}

// ADVANCED  →  GROUPS (ігноруємо within-group OR, використовуємо лише сам факт умов)

export function groupsFromAdvanced(state: AdvancedFilterState | undefined | null): GroupFilterState {
  const groups: NewFilterGroup[] = [];

  if (state && Array.isArray(state.groups)) {
    for (const g of state.groups) {
      const conditions: FilterConfig[] = g.conditions.map((c) => {
        // Видаляємо службове поле nextOperator
        const { nextOperator: _ignored, ...rest } = c;
        return { ...rest };
      });

      groups.push({
        id: g.id,
        name: g.name,
        conditions,
      });
    }
  }

  return {
    type: 'groups',
    groups,
  };
}

/**
 * ===============================
 *  Нормалізація та застосування
 * ===============================
 */

/**
 * Побудувати NormalizedFilterTree з View.
 * Підтримує legacy `filters` і нові стани simple/groups/advanced.
 */
export function normalizeFilters(view: { filters: FilterConfig[] } & Partial<{
  filterMode: unknown;
  simpleFilters: SimpleFilterState;
  groupFilters: GroupFilterState;
  advancedFilters: AdvancedFilterState;
}> | null | undefined): NormalizedFilterTree {
  if (!view) {
    return { mode: 'none' };
  }

  const legacyFilters = Array.isArray(view.filters) ? view.filters : [];
  const hasLegacy = legacyFilters.length > 0;

  const hasSimple = !!view.simpleFilters && Array.isArray(view.simpleFilters.conditions);
  const hasGroups = !!view.groupFilters && Array.isArray(view.groupFilters.groups);
  const hasAdvanced = !!view.advancedFilters && Array.isArray(view.advancedFilters.groups);

  // Визначаємо режим, з пріоритетом: advanced → groups → simple → legacy
  let mode: 'simple' | 'groups' | 'advanced' | 'none' = 'none';

  if (view.filterMode === 'advanced' && (hasAdvanced || hasGroups || hasLegacy)) {
    mode = 'advanced';
  } else if (view.filterMode === 'groups' && (hasGroups || hasSimple || hasLegacy)) {
    mode = 'groups';
  } else if (view.filterMode === 'simple' && (hasSimple || hasLegacy)) {
    mode = 'simple';
  } else if (hasAdvanced) {
    mode = 'advanced';
  } else if (hasGroups) {
    mode = 'groups';
  } else if (hasSimple || hasLegacy) {
    mode = 'simple';
  }

  if (mode === 'none') {
    return { mode: 'none' };
  }

  if (mode === 'simple') {
    const simpleState: SimpleFilterState = hasSimple
      ? {
          type: 'simple',
          conditions: view.simpleFilters!.conditions.map((f) => ({ ...f })),
        }
      : simpleFromLegacy(legacyFilters);

    return {
      mode: 'simple',
      simple: simpleState,
    };
  }

  if (mode === 'groups') {
    let groupsState: GroupFilterState;

    if (hasGroups) {
      groupsState = {
        type: 'groups',
        groups: view.groupFilters!.groups.map((g) => ({
          id: g.id,
          name: g.name,
          conditions: g.conditions.map((c) => ({ ...c })),
        })),
      };
    } else {
      // Будуємо групи з simple/legacy
      const simpleState = hasSimple
        ? view.simpleFilters!
        : simpleFromLegacy(legacyFilters);
      groupsState = groupsFromSimple(simpleState);
    }

    return {
      mode: 'groups',
      groups: groupsState,
    };
  }

  // mode === 'advanced'
  let advancedState: AdvancedFilterState;

  if (hasAdvanced) {
    advancedState = {
      type: 'advanced',
      groups: view.advancedFilters!.groups.map((g) => ({
        id: g.id,
        name: g.name,
        conditions: g.conditions.map((c) => ({ ...c })),
      })),
    };
  } else if (hasGroups) {
    advancedState = advancedFromGroups(view.groupFilters!);
  } else {
    // Будуємо через simple/legacy → groups → advanced
    const simpleState = hasSimple
      ? view.simpleFilters!
      : simpleFromLegacy(legacyFilters);
    const groupsState = groupsFromSimple(simpleState);
    advancedState = advancedFromGroups(groupsState);
  }

  return {
    mode: 'advanced',
    advanced: advancedState,
  };
}

/** View-подібний об'єкт для збору полів фільтрів */
type ViewLikeForFilterFields = { filters?: FilterConfig[] } & Partial<{
  simpleFilters: SimpleFilterState;
  groupFilters: GroupFilterState;
  advancedFilters: AdvancedFilterState;
}>;

/**
 * Зібрати всі унікальні field ID з фільтрів view (для A/B Variant A: перевірка прихованих колонок).
 */
export function getFilterFieldsFromView(view: ViewLikeForFilterFields | null | undefined): string[] {
  if (!view) return [];
  const legacy = Array.isArray(view.filters) ? view.filters : [];
  const fromLegacy = legacy.map((c) => c.field);
  const fromSimple = view.simpleFilters?.conditions?.map((c) => c.field) ?? [];
  const fromGroups = view.groupFilters?.groups?.flatMap((g) => g.conditions.map((c) => c.field)) ?? [];
  const fromAdvanced = view.advancedFilters?.groups?.flatMap((g) => g.conditions.map((c) => c.field)) ?? [];
  const all = [...fromLegacy, ...fromSimple, ...fromGroups, ...fromAdvanced];
  return Array.from(new Set(all));
}

/**
 * Перевіряє, чи один Asset задовольняє конкретний FilterConfig.
 * Ця логіка повторює поточну у app/page.tsx та ViewSettingsDialog.
 */
export function assetMatchesFilter(asset: Asset, filter: FilterConfig): boolean {
  // Дрібний guard: якщо немає значення – фільтр ігноруємо
  if (!hasNonEmptyValue(filter)) {
    return true;
  }

  let value: unknown;

  if (filter.table === 'asset') {
    value = (asset as unknown as Record<string, unknown>)[filter.field];
  } else if (filter.table === 'inspection' && asset.latestInspection) {
    value = (asset.latestInspection as unknown as Record<string, unknown>)[filter.field];
  } else if (filter.table === 'observation') {
    if (filter.field === 'observationCount') {
      value = asset.observationCount;
    } else if (filter.field === 'hasDefects') {
      value = asset.hasDefects;
    } else if (filter.field === 'maxGrade') {
      value = asset.maxGrade;
    } else {
      value = undefined;
    }
  } else {
    // Якщо немає відповідних даних – не проходимо фільтр
    return false;
  }

  if (value === null || value === undefined) {
    return false;
  }

  switch (filter.operator) {
    case 'equals': {
      if (typeof value === 'boolean' || typeof filter.value === 'boolean') {
        return value === filter.value;
      }
      if (typeof value === 'number' || typeof filter.value === 'number') {
        return Number(value) === Number(filter.value);
      }
      return String(value).toLowerCase() === String(filter.value).toLowerCase();
    }
    case 'contains': {
      return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
    }
    case 'startsWith': {
      return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
    }
    case 'greaterThan': {
      return Number(value) > Number(filter.value);
    }
    case 'lessThan': {
      return Number(value) < Number(filter.value);
    }
    default:
      return true;
  }
}

/**
 * Застосувати NormalizedFilterTree до списку Asset.
 * Повертає НОВИЙ масив (оригінал не мутується).
 */
export function applyFilters(assets: Asset[], tree: NormalizedFilterTree): Asset[] {
  if (!Array.isArray(assets) || assets.length === 0) {
    return [];
  }

  if (!tree || tree.mode === 'none') {
    return [...assets];
  }

  if (tree.mode === 'simple') {
    const filters = (tree.simple.conditions || []).filter(hasNonEmptyValue);
    if (filters.length === 0) return [...assets];

    return assets.filter((asset) =>
      filters.every((filter) => assetMatchesFilter(asset, filter))
    );
  }

  if (tree.mode === 'groups') {
    const groups = tree.groups.groups || [];
    if (groups.length === 0) return [...assets];

    return assets.filter((asset) => {
      // Asset підходить, якщо задовольняє хоча б одну групу (OR між групами)
      return groups.some((group) => {
        const conditions = (group.conditions || []).filter(hasNonEmptyValue);
        if (conditions.length === 0) return false;
        // Всередині групи – AND між умовами
        return conditions.every((filter) => assetMatchesFilter(asset, filter));
      });
    });
  }

  // Advanced mode
  const groups = tree.advanced.groups || [];
  if (groups.length === 0) return [...assets];

  return assets.filter((asset) => {
    // OR між групами
    return groups.some((group) => {
      const conditions = group.conditions || [];
      if (conditions.length === 0) return false;

      // Обчислюємо вираз з урахуванням nextOperator
      let current = assetMatchesFilter(asset, conditions[0]);

      for (let i = 1; i < conditions.length; i += 1) {
        const prevOp = conditions[i - 1].nextOperator || 'AND';
        const nextResult = assetMatchesFilter(asset, conditions[i]);

        if (prevOp === 'AND') {
          current = current && nextResult;
        } else {
          current = current || nextResult;
        }
      }

      return current;
    });
  });
}

/**
 * Побудувати текстове превʼю для AdvancedFilterState.
 * Використовується у Advanced Builder та в chips/popover.
 */
export function buildAdvancedFilterPreview(state: AdvancedFilterState): string {
  const lines: string[] = [];

  const translateOperator = (op: FilterConfig['operator']): string => {
    switch (op) {
      case 'equals':
        return 'is';
      case 'contains':
        return 'contains';
      case 'startsWith':
        return 'starts with';
      case 'greaterThan':
        return 'greater than';
      case 'lessThan':
        return 'less than';
      default:
        return op;
    }
  };

  const describeCondition = (c: ConditionWithOperator): string => {
    const column = mockColumnDefs.find((col) => col.field === c.field && col.table === c.table);
    const label = column?.label || c.field;
    const op = translateOperator(c.operator);
    const value =
      typeof c.value === 'string' || typeof c.value === 'number'
        ? `"${String(c.value)}"`
        : String(c.value ?? '');
    return `${label} ${op} ${value}`;
  };

  state.groups.forEach((group, groupIndex) => {
    if (!group.conditions || group.conditions.length === 0) {
      return;
    }

    const groupLines: string[] = [];

    // Побудова рядків всередині групи з урахуванням nextOperator
    const conds = group.conditions;
    if (conds.length === 1) {
      groupLines.push(describeCondition(conds[0]));
    } else {
      let currentLine = describeCondition(conds[0]);
      for (let i = 1; i < conds.length; i += 1) {
        const prev = conds[i - 1];
        const op = prev.nextOperator || 'AND';
        const opText = op === 'AND' ? 'AND' : 'OR';
        const nextText = describeCondition(conds[i]);
        currentLine = `${currentLine} ${opText} ${nextText}`;
      }
      groupLines.push(currentLine);
    }

    // Додаємо групу з дужками, якщо більше однієї умови
    if (groupLines.length === 1 && group.conditions.length > 1) {
      lines.push(`(${groupLines[0]})`);
    } else {
      lines.push(...groupLines);
    }

    // OR між групами
    if (groupIndex < state.groups.length - 1) {
      lines.push('');
      lines.push('OR');
      lines.push('');
    }
  });

  if (lines.length === 0) {
    return 'No advanced filters';
  }

  return lines.join('\n');
}

/**
 * Побудувати текстове превʼю для GroupFilterState (Filter Sets).
 * Використовується у табі Saved Filters для тултіпу.
 */
export function buildGroupFilterPreview(state: GroupFilterState): string {
  const lines: string[] = [];

  const translateOperator = (op: FilterConfig['operator']): string => {
    switch (op) {
      case 'equals':
        return 'is';
      case 'contains':
        return 'contains';
      case 'startsWith':
        return 'starts with';
      case 'greaterThan':
        return 'greater than';
      case 'lessThan':
        return 'less than';
      default:
        return op;
    }
  };

  const describeCondition = (c: FilterConfig): string => {
    const column = mockColumnDefs.find((col) => col.field === c.field && col.table === c.table);
    const label = column?.label || c.field;
    const op = translateOperator(c.operator);
    const value =
      typeof c.value === 'string' || typeof c.value === 'number'
        ? `"${String(c.value)}"`
        : String(c.value ?? '');
    return `${label} ${op} ${value}`;
  };

  state.groups.forEach((group, groupIndex) => {
    if (!group.conditions || group.conditions.length === 0) {
      return;
    }
    const parts = group.conditions.map((c) => describeCondition(c));
    const groupText = parts.length > 1 ? `(${parts.join(' and ')})` : parts[0];
    lines.push(groupText);

    if (groupIndex < state.groups.length - 1) {
      lines.push('');
      lines.push('or');
      lines.push('');
    }
  });

  if (lines.length === 0) {
    return 'No filter sets';
  }

  return lines.join('\n');
}





