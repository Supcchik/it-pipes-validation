import type { Asset, ColumnDef } from '../types/asset-list';

export interface ReportConfig {
  scope: 'selected' | 'all';
  inspections: 'newest' | 'all';
  includeMap: boolean;
  includePhotos: boolean;
}

export async function generatePDF(
  assets: Asset[],
  columns: ColumnDef[],
  config: ReportConfig,
  viewName: string
): Promise<void> {
  // Only run in browser
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in the browser');
  }

  // Validate inputs
  if (!assets || assets.length === 0) {
    throw new Error('No assets to include in report');
  }

  if (!columns || columns.length === 0) {
    throw new Error('No columns to display in report');
  }

  try {
    // Dynamic imports for client-side only
    const jsPDFModule = await import('jspdf');
    await import('jspdf-autotable');
    
    const jsPDF = jsPDFModule.default || jsPDFModule;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const maxWidth = pageWidth - (margin * 2);

    // Add header with Core Vision branding
    doc.setFillColor(249, 115, 22); // Orange
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Core Vision', margin, 20);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Asset Inspection Report', margin, 28);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Report metadata
    let yPos = 40;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(viewName || 'Asset List', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, margin, yPos);
    
    yPos += 6;
    doc.text(`Total Assets: ${assets.length}`, margin, yPos);
    
    if (config.scope === 'selected') {
      yPos += 6;
      doc.text(`Scope: Selected Assets Only`, margin, yPos);
    } else {
      yPos += 6;
      doc.text(`Scope: All Assets in View`, margin, yPos);
    }

    if (config.inspections === 'newest') {
      yPos += 6;
      doc.text(`Inspections: Newest Only`, margin, yPos);
    } else {
      yPos += 6;
      doc.text(`Inspections: All Inspections`, margin, yPos);
    }

    // Prepare table data
    const tableData = assets.map(asset => 
      columns.map(col => {
        let value: unknown;
        
        try {
          if (col.table === 'asset') {
            value = (asset as unknown as Record<string, unknown>)[col.field] || '';
          } else if (col.table === 'inspection' && asset.latestInspection) {
            value = (asset.latestInspection as unknown as Record<string, unknown>)[col.field] || '';
          } else if (col.table === 'observation') {
            if (col.field === 'observationCount') value = asset.observationCount ?? 0;
            else if (col.field === 'hasDefects') value = asset.hasDefects ? 'Yes' : 'No';
            else if (col.field === 'maxGrade') value = asset.maxGrade ?? '';
            else value = '';
          } else {
            value = '';
          }
        } catch (error) {
          console.warn(`Error getting value for column ${col.field}:`, error);
          value = '';
        }
        
        return String(value);
      })
    );

    // Add table using autoTable
    const startY = yPos + 10;
    
    // @ts-expect-error - autoTable is added to jsPDF prototype by jspdf-autotable
    doc.autoTable({
      head: [columns.map(col => col.label)],
      body: tableData,
      startY: startY,
      margin: { left: margin, right: margin },
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: { 
        fillColor: [249, 115, 22], // Orange brand color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // neutral-50
      },
      columnStyles: columns.reduce((acc, col, index) => {
        // Auto-adjust column widths based on content
        acc[index] = { cellWidth: 'auto' };
        return acc;
      }, {} as Record<number, { cellWidth: string }>),
      theme: 'striped',
      showHead: 'everyPage',
      showFoot: 'never'
    });

    // Add footer on each page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Core Vision Asset Management System`,
        margin,
        pageHeight - 10,
        { align: 'left' }
      );
    }

    // Generate filename
    const sanitizedViewName = (viewName || 'AssetList').replace(/[^a-z0-9]/gi, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `CoreVision_Report_${sanitizedViewName}_${dateStr}.pdf`;
    
    // Save PDF
    doc.save(filename);
    
    console.log(`PDF report generated successfully: ${filename}`);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate PDF: ${error.message}`
        : 'Failed to generate PDF. Please try again.'
    );
  }
}
