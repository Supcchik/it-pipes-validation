import type { Asset, ColumnDef } from '../types/asset-list';

export async function exportToExcel(
  assets: Asset[],
  columns: ColumnDef[],
  filename: string
) {
  if (typeof window === 'undefined') {
    throw new Error('Export is only available in the browser');
  }

  // Dynamic import to avoid SSR issues
  // xlsx exports as a namespace object
  const XLSX = await import('xlsx');

  // Prepare data for export
  const exportData = assets.map(asset => {
    const row: Record<string, unknown> = {};
    columns.forEach(col => {
      let value: unknown;
      
      if (col.table === 'asset') {
        value = (asset as unknown as Record<string, unknown>)[col.field] || '';
      } else if (col.table === 'inspection' && asset.latestInspection) {
        value = (asset.latestInspection as unknown as Record<string, unknown>)[col.field] || '';
      } else if (col.table === 'observation') {
        if (col.field === 'observationCount') value = asset.observationCount;
        else if (col.field === 'hasDefects') value = asset.hasDefects ? 'Yes' : 'No';
        else if (col.field === 'maxGrade') value = asset.maxGrade ?? '';
        else value = '';
      } else {
        value = '';
      }
      
      row[col.label] = value;
    });
    return row;
  });

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const maxWidths: number[] = [];
  columns.forEach((col, idx) => {
    const headerWidth = col.label.length;
    const dataWidths = exportData.map(row => 
      String(row[col.label] || '').length
    );
    maxWidths[idx] = Math.max(headerWidth, ...dataWidths, 10);
  });

  ws['!cols'] = maxWidths.map(w => ({ wch: w }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Assets');

  // Generate file
  XLSX.writeFile(wb, filename);
}

export async function exportToCSV(
  assets: Asset[],
  columns: ColumnDef[],
  filename: string
) {
  if (typeof window === 'undefined') {
    throw new Error('Export is only available in the browser');
  }

  // Prepare CSV content
  const headers = columns.map(col => col.label).join(',');
  
  const rows = assets.map(asset => {
    return columns.map(col => {
      let value: unknown;
      
      if (col.table === 'asset') {
        value = (asset as unknown as Record<string, unknown>)[col.field] || '';
      } else if (col.table === 'inspection' && asset.latestInspection) {
        value = (asset.latestInspection as unknown as Record<string, unknown>)[col.field] || '';
      } else if (col.table === 'observation') {
        if (col.field === 'observationCount') value = asset.observationCount;
        else if (col.field === 'hasDefects') value = asset.hasDefects ? 'Yes' : 'No';
        else if (col.field === 'maxGrade') value = asset.maxGrade ?? '';
        else value = '';
      } else {
        value = '';
      }
      
      // Escape commas and quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csv = [headers, ...rows].join('\n');

  // Download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

