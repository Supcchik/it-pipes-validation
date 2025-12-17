import type { FilterConfig, AssetType } from '@/lib/types/asset-list';

// Mapping які фільтри застосовні до якого типу активів
export const FILTER_APPLICABILITY: Record<string, AssetType[]> = {
  // Mainlines (ML) and Laterals (L) specific
  'width': ['ML', 'L'],
  'material': ['ML', 'L'],
  'maxGrade': ['ML', 'L'],
  'grade': ['ML', 'L'], // Alias for maxGrade
  'observationCount': ['ML', 'L'],
  'hasDefects': ['ML', 'L'],
  'pipeSegment': ['ML'],
  'upstreamMH': ['ML'],
  'downstreamMH': ['ML'],
  
  // Manholes (MH) specific
  'depth': ['MH'],
  'coverType': ['MH'],
  'frameType': ['MH'],
  'condition': ['MH'],
  'manholeId': ['MH'],
  
  // Laterals (L) specific
  'lateralId': ['L'],
  'propertyAddress': ['L'],
  'length': ['L'], // For laterals, length is more relevant than for mainlines
  'connectionPoint': ['L'],
  'serviceType': ['L'],
  
  // Universal fields (apply to all types)
  'street': ['ML', 'MH', 'L'],
  'city': ['ML', 'MH', 'L'],
  'project': ['ML', 'MH', 'L'],
  'certificateNumber': ['ML', 'MH', 'L'],
  'date': ['ML', 'MH', 'L'], // Inspection date
  'surveyedBy': ['ML', 'MH', 'L'],
  'purpose': ['ML', 'MH', 'L'],
  'yearConstructed': ['ML', 'MH', 'L'],
  'yearRenewed': ['ML', 'MH', 'L']
};

/**
 * Перевіряє чи фільтр застосовний до даного типу активу
 */
export function isFilterApplicable(filter: FilterConfig, assetType: AssetType): boolean {
  const applicableTypes = FILTER_APPLICABILITY[filter.field];
  if (!applicableTypes) {
    // Якщо поле не знайдено в mapping, вважаємо що воно universal (для безпеки)
    return true;
  }
  return applicableTypes.includes(assetType);
}

/**
 * Фільтрує список фільтрів, залишаючи тільки ті що застосовні до даного типу
 */
export function getApplicableFilters(filters: FilterConfig[], assetType: AssetType): FilterConfig[] {
  return filters.filter(filter => isFilterApplicable(filter, assetType));
}

/**
 * Знаходить фільтри які не застосовні до даного типу
 */
export function getInapplicableFilters(filters: FilterConfig[], assetType: AssetType): FilterConfig[] {
  return filters.filter(filter => !isFilterApplicable(filter, assetType));
}

/**
 * Отримує назву типу активу для відображення
 */
export function getAssetTypeLabel(type: AssetType): string {
  switch (type) {
    case 'ML':
      return 'Mainlines';
    case 'MH':
      return 'Manholes';
    case 'L':
      return 'Laterals';
    default:
      return 'Unknown';
  }
}

/**
 * Отримує коротку назву типу активу
 */
export function getAssetTypeShortLabel(type: AssetType): string {
  return type;
}

/**
 * Перевіряє чи є валідним тип активу
 */
export function isValidAssetType(type: string): type is AssetType {
  return type === 'ML' || type === 'MH' || type === 'L';
}

/**
 * Конвертує тип з URL (lowercase) до AssetType (uppercase)
 */
export function normalizeAssetTypeFromUrl(type: string | null): AssetType {
  if (!type) return 'ML'; // Default to Mainlines
  
  const upperType = type.toUpperCase();
  if (isValidAssetType(upperType)) {
    return upperType;
  }
  
  return 'ML'; // Fallback to Mainlines
}

/**
 * Конвертує AssetType до URL format (lowercase)
 */
export function assetTypeToUrl(type: AssetType): string {
  return type.toLowerCase();
}


