import type { Asset, FilterConfig, NormalizedFilterTree } from '@/lib/types/asset-list';
import { assetMatchesFilter } from '@/lib/utils/filter-utils';

const MIN_VISIBLE = 3;

/**
 * Збирає умови фільтрів у один список (AND).
 * Для groups/advanced береться перша група — синтетичний актив, що її задовольняє, пройде фільтр (OR між групами).
 */
function collectConditions(
  tree: NormalizedFilterTree,
  temporaryFilters: FilterConfig[]
): FilterConfig[] {
  const conditions: FilterConfig[] = [];

  if (tree.mode === 'simple' && tree.simple?.conditions) {
    conditions.push(...tree.simple.conditions.filter((c) => c.value !== '' && c.value !== undefined && c.value !== null));
  }
  if (tree.mode === 'groups' && tree.groups?.groups?.[0]?.conditions) {
    conditions.push(...tree.groups.groups[0].conditions.filter((c) => c.value !== '' && c.value !== undefined && c.value !== null));
  }
  if (tree.mode === 'advanced' && tree.advanced?.groups?.[0]?.conditions) {
    conditions.push(...tree.advanced.groups[0].conditions.filter((c) => c.value !== '' && c.value !== undefined && c.value !== null));
  }

  temporaryFilters.forEach((f) => {
    if (f.value !== '' && f.value !== undefined && f.value !== null) conditions.push(f);
  });

  return conditions;
}

/**
 * Повертає значення, яке задовольняє умову фільтра (для підстановки в актив).
 */
function valueSatisfyingCondition(filter: FilterConfig): unknown {
  const v = filter.value;
  switch (filter.operator) {
    case 'equals':
      return v;
    case 'contains':
      return typeof v === 'string' ? v : `${v}`;
    case 'startsWith':
      return typeof v === 'string' ? v : `${v}`;
    case 'greaterThan':
      return typeof v === 'number' ? v + 1 : Number(v) + 1;
    case 'lessThan':
      return typeof v === 'number' ? v - 1 : Number(v) - 1;
    default:
      return v;
  }
}

/** Варіації для візуальної відмінності рядків у таблиці */
const SYNTHETIC_STREETS = ['Synthetic Test St', 'Demo Filter Match', 'Placeholder Row'];

/**
 * Збирає один синтетичний актив, що задовольняє всі умови.
 */
function buildSyntheticAsset(conditions: FilterConfig[], idSuffix: number): Asset {
  const base: Asset = {
    id: `synthetic-${idSuffix}`,
    asset_type: 'ML',
    pipeSegment: `ML-SYN-${String(idSuffix).padStart(3, '0')}`,
    project: 'CityTestQA',
    city: 'Springfield',
    street: SYNTHETIC_STREETS[(idSuffix - 1) % SYNTHETIC_STREETS.length],
    upstreamMH: `MH-${900 + idSuffix}`,
    downstreamMH: `MH-${901 + idSuffix}`,
    material: 'PVC',
    width: 12,
    yearConstructed: 2020,
    yearRenewed: 2023,
    latestInspection: {
      id: `insp-syn-${idSuffix}`,
      certificateNumber: `CERT-SYN-${idSuffix}`,
      date: '2025-01-15',
      purpose: 'Routine Inspection',
      preCleaning: true,
      direction: 'Downstream',
      mediaLabel: `SYN${idSuffix}_2025`,
      weather: 'Clear',
      surveyedBy: 'System',
    },
    observationCount: 2,
    hasDefects: false,
    maxGrade: 2,
  };

  const assetPatch: Record<string, unknown> = {};
  const inspectionPatch: Record<string, unknown> = {};
  const observationFields: Record<string, unknown> = {};

  conditions.forEach((c) => {
    const value = valueSatisfyingCondition(c);
    if (c.table === 'asset') assetPatch[c.field] = value;
    else if (c.table === 'inspection') inspectionPatch[c.field] = value;
    else if (c.table === 'observation') {
      if (c.field === 'observationCount') observationFields.observationCount = value;
      else if (c.field === 'hasDefects') observationFields.hasDefects = value;
      else if (c.field === 'maxGrade') observationFields.maxGrade = value;
    }
  });

  const asset: Asset = {
    ...base,
    ...assetPatch,
    ...observationFields,
  } as Asset;

  if (Object.keys(inspectionPatch).length > 0 && asset.latestInspection) {
    asset.latestInspection = { ...asset.latestInspection, ...inspectionPatch } as Asset['latestInspection'];
  }

  return asset;
}

/**
 * Генерує мінімум 3 синтетичних активів, що задовольняють поточні фільтри (view + temporary).
 * Якщо реальних результатів уже >= 3, повертає порожній масив.
 */
export function padWithSyntheticAssets(
  filtered: Asset[],
  tree: NormalizedFilterTree,
  temporaryFilters: FilterConfig[]
): Asset[] {
  if (filtered.length >= MIN_VISIBLE) return filtered;
  if (tree.mode === 'none' && temporaryFilters.length === 0) return filtered;

  const conditions = collectConditions(tree, temporaryFilters);
  if (conditions.length === 0) return filtered;

  const need = MIN_VISIBLE - filtered.length;
  const synthetic: Asset[] = [];

  for (let i = 0; i < need; i++) {
    const asset = buildSyntheticAsset(conditions, i + 1);
    const passesView = tree.mode === 'none' || (() => {
      if (tree.mode === 'simple') {
        return (tree.simple.conditions || []).every((f) => assetMatchesFilter(asset, f));
      }
      if (tree.mode === 'groups' && tree.groups.groups) {
        return tree.groups.groups.some((group) =>
          (group.conditions || []).every((f) => assetMatchesFilter(asset, f))
        );
      }
      if (tree.mode === 'advanced' && tree.advanced.groups) {
        return tree.advanced.groups.some((group) => {
          if (group.conditions.length === 0) return false;
          let current = assetMatchesFilter(asset, group.conditions[0]);
          for (let j = 1; j < group.conditions.length; j++) {
            const op = group.conditions[j - 1].nextOperator || 'AND';
            const next = assetMatchesFilter(asset, group.conditions[j]);
            current = op === 'AND' ? current && next : current || next;
          }
          return current;
        });
      }
      return true;
    })();
    const passesTemp = temporaryFilters.every((f) => assetMatchesFilter(asset, f));
    if (passesView && passesTemp) synthetic.push(asset);
  }

  return [...filtered, ...synthetic];
}
