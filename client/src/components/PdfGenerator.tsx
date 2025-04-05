import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import 'jspdf/dist/polyfills.es.js';
import { getFlightEstimateForCity } from '@/services/flightEstimatesService';

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

interface ClinicComparison {
  name: string;
  priceGBP: number;
  extras: string;
}

interface PdfGeneratorProps {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  clinics?: ClinicComparison[];
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
  travelMonth = '',
  departureCity = '',
  clinics = [],
  onComplete,
}: PdfGeneratorProps) => {
  // Calculate UK comparison price (usually 2.5-3x higher)
  const ukPriceMin = Math.round(totalGBP * 2.5);
  const ukPriceMax = Math.round(totalGBP * 3);
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
  
  // Add a contact phone number instead of an icon
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220); // Light grey
  doc.text('Contact: +447572445856', pageWidth - margin, 30, { align: 'right' });
  
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
  
  // Add treatments section title with subsection for medical treatments
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('YOUR QUOTE DETAILS', margin, yPos);
  yPos += 8;
  
  // Add subsection for dental treatments
  doc.setFontSize(11);
  doc.text('Dental Treatments:', margin, yPos);
  yPos += 8;
  
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
  
  // Get flight estimate if provided
  let flightEstimate: number | undefined;
  if (travelMonth && departureCity) {
    flightEstimate = getFlightEstimateForCity(departureCity, travelMonth);
  }
  
  // Add flight cost row if available
  if (flightEstimate) {
    yPos += 12;
    
    // Add travel section title
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Costs:', margin, yPos);
    yPos += 8;
    
    // Flight cost background (slightly different color)
    doc.setFillColor(240, 245, 255);
    doc.rect(margin, yPos - 5, contentWidth, 9, 'F');
    
    // Flight cost border
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);
    doc.rect(margin, yPos - 5, contentWidth, 9, 'S');
    
    // Flight description
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Return flight from ${departureCity} (${travelMonth})`, margin + 5, yPos);
    
    // Flight cost GBP (center aligned)
    doc.text(`£${flightEstimate.toLocaleString()}`, colPositions[1].x + colPositions[1].width / 2, yPos, { align: 'center' });
    
    // Flight cost USD (center aligned) - approximate conversion
    const flightUSD = Math.round(flightEstimate * 1.3); // Simple GBP to USD conversion
    doc.text(`$${flightUSD.toLocaleString()}`, colPositions[2].x + colPositions[2].width / 2, yPos, { align: 'center' });
  }
  
  // Add grand total row
  yPos += 12;
  
  // Total background
  doc.setFillColor(245, 250, 255);
  doc.rect(margin, yPos - 5, contentWidth, 12, 'F');
  
  // Total border
  doc.setDrawColor(0, 59, 111);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos - 5, contentWidth, 12, 'S');
  
  yPos += 3;
  
  // Calculate grand total with flight if applicable
  const grandTotalGBP = flightEstimate ? totalGBP + flightEstimate : totalGBP;
  const grandTotalUSD = flightEstimate ? totalUSD + Math.round(flightEstimate * 1.3) : totalUSD;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', margin + 10, yPos);
  
  // Total GBP (center aligned)
  doc.text(`£${grandTotalGBP.toLocaleString()}`, colPositions[1].x + colPositions[1].width / 2, yPos, { align: 'center' });
  
  // Total USD (center aligned)
  doc.text(`$${grandTotalUSD.toLocaleString()}`, colPositions[2].x + colPositions[2].width / 2, yPos, { align: 'center' });
  
  // Add clinic comparison section if clinics are provided
  if (clinics && clinics.length > 0) {
    // Check if we need a new page (if close to bottom)
    if (yPos > 200) {
      doc.addPage();
      yPos = 40;
    }

    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 59, 111); // Blue text for section headers
    doc.text('Clinic Comparison', margin, yPos);
    yPos += 10;
    
    // Create clinic comparison table
    const clinicCols = [
      { title: 'Clinic', width: contentWidth * 0.4, align: 'left' },
      { title: 'Price (GBP)', width: contentWidth * 0.3, align: 'center' },
      { title: 'Extras Included', width: contentWidth * 0.3, align: 'left' }
    ];
    
    // Calculate column positions for clinic table
    let clinicColPos: ColumnPosition[] = [];
    let clinicX = margin;
    clinicCols.forEach(col => {
      clinicColPos.push({
        x: clinicX,
        width: col.width,
        align: col.align
      });
      clinicX += col.width;
    });
    
    // Draw table header
    doc.setFillColor(0, 59, 111); // Dark blue for header
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); // White text for header
    doc.setFont('helvetica', 'bold');
    
    clinicCols.forEach((col, index) => {
      const position = clinicColPos[index];
      const xPos = position.align === 'center' 
        ? position.x + position.width / 2 
        : position.x + 5;
      
      doc.text(col.title, xPos, yPos, { 
        align: position.align === 'center' ? 'center' : 'left'
      });
    });
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    
    // Add clinic rows
    clinics.forEach((clinic, index) => {
      // Alternate row colors
      doc.setFillColor(index % 2 === 0 ? 240 : 250, index % 2 === 0 ? 240 : 250, index % 2 === 0 ? 240 : 250);
      doc.rect(margin, yPos - 5, contentWidth, 9, 'F');
      
      // Add subtle border
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.1);
      doc.line(margin, yPos - 5, margin + contentWidth, yPos - 5);
      
      // Draw row content
      doc.setTextColor(0, 0, 0);
      
      // Clinic name (left aligned)
      doc.text(clinic.name, clinicColPos[0].x + 5, yPos);
      
      // Price GBP (center aligned)
      doc.text(`£${clinic.priceGBP.toLocaleString()}`, clinicColPos[1].x + clinicColPos[1].width / 2, yPos, { align: 'center' });
      
      // Extras (left aligned)
      doc.text(clinic.extras, clinicColPos[2].x + 5, yPos);
      
      yPos += 9;
    });
  }
  
  // Add UK cost comparison section
  yPos += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 59, 111); // Blue text for section headers
  doc.text('UK Cost Comparison', margin, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`The same treatment in the UK would typically cost between £${ukPriceMin.toLocaleString()} and £${ukPriceMax.toLocaleString()}.`, margin, yPos);
  
  // Add next steps section
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 59, 111); // Blue text for section headers
  doc.text('Next Steps', margin, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('✓ Contact Istanbul Dental Smile to confirm your treatment plan', margin, yPos);
  
  yPos += 7;
  doc.text('✓ Book your flight to Istanbul for your chosen dates', margin, yPos);
  
  yPos += 7;
  doc.text('✓ We will arrange airport transfer and accommodation options', margin, yPos);
  
  // Add footer
  yPos = 275;
  
  // Add a secondary accent strip before footer
  doc.setFillColor(0, 169, 157); // Teal accent color
  doc.rect(0, yPos - 2, pageWidth, 1, 'F');
  
  // Add footer box
  doc.setFillColor(245, 245, 245); // Light grey background
  doc.rect(0, yPos, pageWidth, 35, 'F');
  
  // Add footer content with professional styling
  yPos += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  
  // Left side - Contact info
  doc.text('Phone: +447572445856', margin, yPos);
  yPos += 5;
  doc.text('Email: info@istanbuldentalsmile.com', margin, yPos);
  yPos += 5;
  doc.text('Web: www.istanbuldentalsmile.com', margin, yPos);
  
  // Right side - Quote validity
  doc.setFont('helvetica', 'bold');
  doc.text('Note: This quote is valid for 30 days from the issue date.', pageWidth - margin, yPos - 10, { align: 'right' });
  
  // Add disclaimers
  yPos += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  
  // Cost disclaimer
  doc.text('* Prices may vary depending on the required treatment details after clinical assessment.', margin, yPos);
  
  // Flight price disclaimer if flight estimate is included
  if (flightEstimate) {
    yPos += 4;
    doc.text('* Flight prices are general estimates and may vary based on booking date, airline, and availability.', margin, yPos);
  }
  
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