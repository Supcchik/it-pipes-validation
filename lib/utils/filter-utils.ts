import type { ComplexFilter, FilterGroup, FilterCondition } from '@/lib/types/asset-list';

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
