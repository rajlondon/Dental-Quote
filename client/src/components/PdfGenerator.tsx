import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import 'jspdf/dist/polyfills.es.js';

// Type definitions
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

interface TableColumn {
  title: string;
  width: number;
  align: string;
}

interface ColumnPosition {
  x: number;
  width: number;
  align: string;
}

// Function to format treatment names to be more user-friendly
const formatTreatmentName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/(\w)([A-Z])/g, '$1 $2') // Add space between camelCase words
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/-/g, ' - ') // Add spaces around hyphens
    .split(' ')
    .map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter of each word
    )
    .join(' ');
};

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
  
  // Create a professional header with branding colors
  // Add a header bar
  doc.setFillColor(0, 59, 111); // Dark blue color for header background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add a secondary accent strip
  doc.setFillColor(0, 169, 157); // Teal accent color
  doc.rect(0, 40, pageWidth, 3, 'F');
  
  // Add title with white text color for contrast against the blue background
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255); // White text on blue background
  doc.text('Istanbul Dental Smile', margin, 20);
  doc.setFontSize(16);
  doc.text('Treatment Quote', margin, 30);
  
  // Add date on the right side
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220); // Light grey
  const today = new Date().toLocaleDateString('en-GB');
  doc.text(`Quote generated on: ${today}`, pageWidth - margin, 20, { align: 'right' });
  
  // Add a stylized "bridge" icon to represent the logo
  doc.setDrawColor(0, 169, 157); // Teal color for the bridge lines
  doc.setLineWidth(1.5);
  
  // Draw stylized bridge icon
  const iconX = pageWidth - 60;
  const iconY = 15;
  const iconWidth = 30;
  const iconHeight = 15;
  
  // Draw arch (simplified to avoid ellipse error)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  
  // Use arc instead of ellipse which might be causing issues
  const centerX = iconX + iconWidth/2;
  const centerY = iconY + iconHeight/2;
  doc.circle(centerX, centerY, iconWidth/3, 'stroke');
  
  // Draw pillars
  doc.line(iconX, iconY + iconHeight, iconX, iconY + iconHeight - 5);
  doc.line(iconX + iconWidth, iconY + iconHeight, iconX + iconWidth, iconY + iconHeight - 5);
  
  // Reset colors for the rest of the document
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);
  
  // Add patient info if available
  let yPos = 60; // Start below the header and accent strip
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
  
  // Create a professional looking table
  const cols: TableColumn[] = [
    { title: 'Treatment', width: contentWidth * 0.35, align: 'left' },
    { title: 'Price (GBP)', width: contentWidth * 0.15, align: 'center' },
    { title: 'Price (USD)', width: contentWidth * 0.15, align: 'center' },
    { title: 'Qty', width: contentWidth * 0.1, align: 'center' },
    { title: 'Guarantee', width: contentWidth * 0.25, align: 'center' }
  ];
  
  // Calculate column positions
  let colPositions: ColumnPosition[] = [];
  let currentX = margin;
  cols.forEach(col => {
    colPositions.push({
      x: currentX,
      width: col.width,
      align: col.align
    });
    currentX += col.width;
  });
  
  // Draw table header
  doc.setFillColor(0, 59, 111); // Dark blue for header
  doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255); // White text for header
  doc.setFont('helvetica', 'bold');
  
  cols.forEach((col, index) => {
    const position = colPositions[index];
    const xPos = position.align === 'center' 
      ? position.x + position.width / 2 
      : position.x + 5;
    
    doc.text(col.title, xPos, yPos, { 
      align: position.align === 'center' ? 'center' : 'left'
    });
  });
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  
  // Add table rows
  items.forEach((item, index) => {
    // Alternate row colors
    doc.setFillColor(index % 2 === 0 ? 240 : 250, index % 2 === 0 ? 240 : 250, index % 2 === 0 ? 240 : 250);
    doc.rect(margin, yPos - 5, contentWidth, 9, 'F');
    
    // Add subtle border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(margin, yPos - 5, margin + contentWidth, yPos - 5);
    
    // Check if we need a new page
    if (yPos > 260) {
      doc.addPage();
      yPos = 40;
      
      // Draw header on new page
      doc.setFillColor(0, 59, 111);
      doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      
      cols.forEach((col, index) => {
        const position = colPositions[index];
        const xPos = position.align === 'center' 
          ? position.x + position.width / 2 
          : position.x + 5;
        
        doc.text(col.title, xPos, yPos, { 
          align: position.align === 'center' ? 'center' : 'left'
        });
      });
      
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    }
    
    // Draw row content
    doc.setTextColor(0, 0, 0);
    
    // Treatment name (left aligned)
    doc.text(truncateText(formatTreatmentName(item.treatment), 40), colPositions[0].x + 5, yPos);
    
    // Price GBP (center aligned)
    doc.text(`£${item.priceGBP.toLocaleString()}`, colPositions[1].x + colPositions[1].width / 2, yPos, { align: 'center' });
    
    // Price USD (center aligned)
    doc.text(`$${item.priceUSD.toLocaleString()}`, colPositions[2].x + colPositions[2].width / 2, yPos, { align: 'center' });
    
    // Quantity (center aligned)
    doc.text(item.quantity.toString(), colPositions[3].x + colPositions[3].width / 2, yPos, { align: 'center' });
    
    // Guarantee (center aligned)
    doc.text(item.guarantee || 'N/A', colPositions[4].x + colPositions[4].width / 2, yPos, { align: 'center' });
    
    yPos += 9;
  });
  
  // Add totals
  yPos += 2;
  
  // Total background
  doc.setFillColor(245, 250, 255);
  doc.rect(margin, yPos - 5, contentWidth, 12, 'F');
  
  // Total border
  doc.setDrawColor(0, 59, 111);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos - 5, contentWidth, 12, 'S');
  
  yPos += 3;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', margin + 10, yPos);
  
  // Total GBP (center aligned)
  doc.text(`£${totalGBP.toLocaleString()}`, colPositions[1].x + colPositions[1].width / 2, yPos, { align: 'center' });
  
  // Total USD (center aligned)
  doc.text(`$${totalUSD.toLocaleString()}`, colPositions[2].x + colPositions[2].width / 2, yPos, { align: 'center' });
  
  // Add footer
  yPos = 275;
  
  // Add a secondary accent strip before footer
  doc.setFillColor(0, 169, 157); // Teal accent color
  doc.rect(0, yPos - 2, pageWidth, 1, 'F');
  
  // Add footer box
  doc.setFillColor(245, 245, 245); // Light grey background
  doc.rect(0, yPos, pageWidth, 25, 'F');
  
  // Add footer content with professional styling
  yPos += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  
  // Left side - Contact info with icons
  doc.text('📞 +447572445856', margin, yPos);
  yPos += 5;
  doc.text('✉️ info@istanbuldentalsmile.com', margin, yPos);
  
  // Right side - Quote validity
  doc.setFont('helvetica', 'bold');
  doc.text('Note: This quote is valid for 30 days from the issue date.', pageWidth - margin, yPos - 5, { align: 'right' });
  
  // Save the PDF
  const filename = `IstanbulDentalSmile_Quote_${today.replace(/\//g, '-')}.pdf`;
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
      {'Download Your Quote'}
    </button>
  );
}

// Helper function to truncate text for PDF
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}