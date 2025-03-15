
import { PropertyData } from '@/types/property';
import { AgencySettings } from '@/types/agency';
import jsPDF from 'jspdf';
import { generatePdfContent } from './pdf/generatePdfContent';
import { generateBottomBar } from './pdf/components/bottomBar';

export const generatePropertyPDF = async (property: PropertyData, settings: AgencySettings, templateId?: string) => {
  try {
    // Create a new PDF document in landscape orientation
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Define dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Generate the main content of the PDF
    await generatePdfContent(pdf, property, settings, pageWidth, pageHeight);
    
    // Add the bottom bar with contact information and QR code
    await generateBottomBar(pdf, property, settings, pageWidth, pageHeight);
    
    // Open PDF in a new window
    window.open(pdf.output('bloburl'), '_blank');
    
    return pdf.output('datauristring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
