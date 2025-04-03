import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import 'jspdf/dist/polyfills.es.js';

interface QuoteItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
}

interface PdfGeneratorProps {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  onComplete?: () => void;
}

export const generateQuotePdf = ({
  items,
  totalGBP,
  totalUSD,
  patientName = '',
  patientEmail = '',
  patientPhone = '',
  onComplete,
}: PdfGeneratorProps) => {
  const doc = new jsPDF();
  
  // Set up document properties
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(0, 59, 111); // Dark blue color
  doc.text('DentalMatch - Treatment Quote', pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Grey
  const today = new Date().toLocaleDateString('en-GB');
  doc.text(`Quote generated on: ${today}`, pageWidth / 2, 27, { align: 'center' });
  
  // Add patient info if available
  let yPos = 40;
  if (patientName || patientEmail || patientPhone) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Patient Information:', margin, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    if (patientName) {
      doc.text(`Name: ${patientName || 'Not provided'}`, margin, yPos);
      yPos += 5;
    }
    if (patientEmail) {
      doc.text(`Email: ${patientEmail || 'Not provided'}`, margin, yPos);
      yPos += 5;
    }
    if (patientPhone) {
      doc.text(`Phone: ${patientPhone || 'Not provided'}`, margin, yPos);
      yPos += 5;
    }
    
    yPos += 7; // Space before treatments
  }
  
  // Add treatments table header
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Selected Treatments:', margin, yPos);
  yPos += 10;
  
  // Create table headers
  doc.setFillColor(240, 240, 240); // Light grey background
  doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const cols = [
    { text: 'Treatment', x: margin + 5, width: contentWidth * 0.35 },
    { text: 'Price (GBP)', x: margin + contentWidth * 0.35 + 5, width: contentWidth * 0.15 },
    { text: 'Price (USD)', x: margin + contentWidth * 0.5 + 5, width: contentWidth * 0.15 },
    { text: 'Qty', x: margin + contentWidth * 0.65 + 5, width: contentWidth * 0.1 },
    { text: 'Guarantee', x: margin + contentWidth * 0.75 + 5, width: contentWidth * 0.25 },
  ];
  
  cols.forEach(col => {
    doc.text(col.text, col.x, yPos);
  });
  yPos += 8;
  
  // Add table rows
  items.forEach((item, index) => {
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
    }
    
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(truncateText(item.treatment, 40), cols[0].x, yPos);
    doc.text(`£${item.priceGBP.toLocaleString()}`, cols[1].x, yPos);
    doc.text(`$${item.priceUSD.toLocaleString()}`, cols[2].x, yPos);
    doc.text(item.quantity.toString(), cols[3].x, yPos);
    doc.text(item.guarantee || 'N/A', cols[4].x, yPos);
    
    yPos += 8;
  });
  
  // Add totals
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos - 2, margin + contentWidth, yPos - 2);
  yPos += 5;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', margin + 5, yPos);
  doc.text(`£${totalGBP.toLocaleString()}`, cols[1].x, yPos);
  doc.text(`$${totalUSD.toLocaleString()}`, cols[2].x, yPos);
  
  // Add footer
  yPos = 275;
  doc.setDrawColor(0, 59, 111);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Note: This quote is valid for 30 days from the issue date.', margin, yPos);
  yPos += 5;
  doc.text('Contact us at info@dentalmatch.com or +447572445856 for more information.', margin, yPos);
  
  // Save the PDF
  const filename = `DentalMatch_Quote_${today.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
  
  if (onComplete) {
    onComplete();
  }
};

// Component for React usage
export default function PdfGenerator(props: PdfGeneratorProps) {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={() => generateQuotePdf(props)}
      className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 font-medium text-lg transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      {t('download_quote') || 'Download Your Quote'}
    </button>
  );
}

// Helper function to truncate text for PDF
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}