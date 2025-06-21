import { jsPDF } from 'jspdf';
import { useEffect, useState } from 'react';
// Import logo from assets folder
import logoPath from '@/assets/my-dental-fly-logo.png';
// Removed react-i18next
import 'jspdf/dist/polyfills.es.js';
import { getFlightEstimateForCity } from '@/services/flightEstimatesService';

// Base64 encoded logo image (converted from PNG for reliable embedding in PDF)
// This ensures the logo appears correctly without external file dependencies
const LOGO_BASE64 = 'data:image/png;base64,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';

// Base64 encoded icons for reliable PDF embedding - Enhanced 32x32 px quality
const HOTEL_ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAx0lEQVR4nO2UMQrCQBBF30VstbXzBOIZFK9g4RXsvYCVZxA8iJWVpZ03ELyBYGXlBYKVGlgYCEHcZDeVPxCYefP/5O9mgeJfyATwDCxdCZaACn+ywNtHkNVSK8EmQJDV0pNg6kMwUsFLBXMVLHID+JpkCuyBa+CkDWm8AjOXgg5wAR6ZfdYFYJTzAPvMXmvgDrRskhf+FBmGIhgm3L/AlGsZS9B0GbKobCSeN8BYcmMDzhEFUcNs5QRYADdgLAVnuTYV4RNg+d4XpM8CugAAAABJRU5ErkJggg==';
const TRANSFER_ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABJElEQVR4nO2UMUoDQRSGv1VBsLCy9gRewsIbeAjxBNp7glRWXkA9gGKTP4UY0MaYiKRIrGysLNLZTECGMMvs7kycVfLDwDD//O8x+2YG/usXdQ7MgeegzzaA3ZDwFBgBY2Csmz6HBLaAb2Cw5s4Wr3Rt5TcDnm3gA9SARRDyDJwCB8C+7k217q7cKVCNheeq+yLjGg7TkKuQcEXb7gN94BOoK69f5Vm69OeJ5TkLWfqJcBsZpGSfwK4PcA9sOqKbwIPGvIBdH2DuiJ0A7zruRNHZnG+gYU2/qWvkG9hRftMFGAVR3TyAFrAN3ALfSRRNpZ26APYAq/wh4Qm9gDUX4CUIrBWce8WV9JL9PgFwpq9rmuN5bZXfjzcAOvpUfgHIL1Fey0DimgAAAABJRU5ErkJggg==';
const TRANSLATOR_ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABUElEQVR4nO2UMUvDQBTHf1XQwUFX/QSCow5+AsHJD+HgJHRycHVzK6IfQCgiOhSFgqIIFQQHUdTJRRAs2l5pAieSy+UuaboU/MNB3v/9/nfv3uUA/7XCKgEtYA5MtPWAo0UBNeAZGAPPOmbAC1D/LcAB0Afmhs1V8wpsLwpoAH1HOOdpZeNIpQa8ZQDktlA36oW14EXcFxMm1sDaGgFr5wRU1A0Nt5XOG+tK5wDn+gsU4BF4NzyQ+a7SewPnxG4DDWDHsTkGpgaBbXkrNsDYfBzfJc6Tx9onBNt02TvP5kXKPsB3Y/NKymvKB9JcmyHvANvJ1O8oNjZ/0R3/BHC2IjiVeuixbQGfxh59SflW2FQQniSHZ/ClAbMAXGnZDvGK6o5EtAfoGvkA2MwDyOsTbQDJu+gC+4sCMkDU/e2X4hSYqBvpV/oPyR+AqpTvEO0tDnuUh6gAAAAASUVORK5CYII=';
const TICK_ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABNElEQVR4nO2UP07DMBTHX1CZ2gOXYKrE2guAOABiYYCZE1RiQAxI3INLwFrR/Og2MQLqwo04AQMSTZfERIot27WdqlJeYsl+/n3+2c9PABVbRZeYJyC7LuhMdMGVbsQEcABcA31gDBwVYTaAB2AF+Ad8FuVdA7dAJ+QDHAETYKkFnQKXIb4RsADmiYAC0K4B98A8FnQGvCnwEjivATnwCrx7W5QA74llxhL4AJ6AYwXvOL4X5ftWxTYOhp7NV9MQvDVjyVF4AlxsDNI1qPLXHDgsgZ/wPrCt4I0Q0I5isEcsM7oy1KKNIrk+bw14ATx6kX0A9yHgphHUTVjzBJj6AVe4g2tKqeQBfvIElnUJNPJe0B/dCxKqqFgm15xZ5KX/NF80Uv4jc0F/+s9KDvwCvRDM7XrOYPMAAAAASUVORK5CYII=';

// Still keeping the Unicode symbols as fallback
const TICK_ICON = "✓";             // Checkmark for list items
const HOTEL_ICON = "■";            // Hotel icon (solid square symbol)
const TRANSFER_ICON = "►";         // Transfer/taxi icon (triangle symbol)
const TRANSLATOR_ICON = "●";       // Translator/specialist icon (solid circle symbol)

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

// Interface for dental chart data
interface ToothData {
  id: number;
  name: string;
  position: string;
  section: string;
  selected: boolean;
  treatments: string[];
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
  dentalChart?: ToothData[];
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

// PDF generation function
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
  dentalChart = [],
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
  
  // Create a modern, clean header with branding colors
  doc.setFillColor(0, 104, 139); // #00688B Strong teal blue
  doc.rect(0, 0, pageWidth, 40, 'F'); // Top header bar
  
  // Add a secondary accent strip
  doc.setFillColor(178, 144, 79); // #B2904F Elegant gold
  doc.rect(0, 40, pageWidth, 3, 'F');
  
  // Generate date variables that will be used in multiple places
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  // Add title with white text color for contrast against the blue background
  doc.setFontSize(24); // Larger text
  doc.setTextColor(255, 255, 255); // White text on blue background
  doc.setFont('helvetica', 'bold');
  doc.text('Your Personalized Smile Journey', pageWidth / 2, 25, { align: 'center' });
  
  // Reset colors for the rest of the document
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);
  
  // Add patient info and date in a clean format
  let yPos = 60;
  
  // Create columns for patient info
  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;
  
  // Left column: Patient info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared for:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(patientName || 'Valued Patient', leftColX + 28, yPos);
  
  // Right column: Date
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formattedDate, rightColX + 15, yPos);
  
  yPos += 12;
  
  // Treatment requested
  doc.setFont('helvetica', 'bold');
  doc.text('Treatment Requested:', leftColX, yPos);
  yPos += 7;
  
  // Create treatment summary text by combining multiple treatments
  let treatmentSummary = '';
  if (items.length > 0) {
    treatmentSummary = items.map(item => `${item.quantity} ${item.treatment}`).join(' + ');
  } else {
    treatmentSummary = 'Dental consultation and treatment plan';
  }
  
  doc.setFont('helvetica', 'normal');
  doc.text(treatmentSummary, leftColX, yPos);
  
  yPos += 15;
  
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
  doc.setFillColor(0, 104, 139); // #00688B Strong teal blue
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
      doc.setFillColor(0, 104, 139); // #00688B Strong teal blue
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
  doc.setDrawColor(0, 104, 139); // #00688B Strong teal blue
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
  
  // Add dental chart visualization if available
  if (dentalChart && dentalChart.length > 0) {
    // Check if we need a new page (if close to bottom)
    if (yPos > 200) {
      doc.addPage();
      yPos = 40;
    } else {
      yPos += 25;
    }
    
    // Add dental chart section title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
    doc.text('Dental Treatment Visualization', margin, yPos);
    
    yPos += 10;
    
    // Section background
    doc.setFillColor(245, 250, 255); // Light blue background
    doc.rect(margin, yPos - 5, contentWidth, 80, 'F');
    doc.setDrawColor(178, 144, 79); // #B2904F Elegant gold
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos - 5, contentWidth, 80, 'S');
    
    // Create a simplified visual representation of the dental chart
    const selectedTeeth = dentalChart.filter(tooth => tooth.selected);
    
    // Add descriptive text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    if (selectedTeeth.length > 0) {
      doc.text('The following teeth will receive treatment:', margin + 5, yPos);
      
      yPos += 8;
      
      // Group teeth by section (Upper/Lower)
      const upperTeeth = selectedTeeth.filter(tooth => tooth.section === 'Upper');
      const lowerTeeth = selectedTeeth.filter(tooth => tooth.section === 'Lower');
      
      // Upper teeth section
      if (upperTeeth.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Upper Teeth:', margin + 10, yPos);
        doc.setFont('helvetica', 'normal');
        
        yPos += 6;
        
        // Create a nicely formatted list of upper teeth with their treatments
        upperTeeth.forEach(tooth => {
          const treatments = tooth.treatments.join(', ');
          doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 10, yPos - 4, 4, 4);
          doc.text(`Tooth ${tooth.id} (${tooth.name}): ${treatments}`, margin + 20, yPos);
          yPos += 6;
        });
      }
      
      // Lower teeth section
      if (lowerTeeth.length > 0) {
        yPos += 2;
        doc.setFont('helvetica', 'bold');
        doc.text('Lower Teeth:', margin + 10, yPos);
        doc.setFont('helvetica', 'normal');
        
        yPos += 6;
        
        // Create a nicely formatted list of lower teeth with their treatments
        lowerTeeth.forEach(tooth => {
          const treatments = tooth.treatments.join(', ');
          doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 10, yPos - 4, 4, 4);
          doc.text(`Tooth ${tooth.id} (${tooth.name}): ${treatments}`, margin + 20, yPos);
          yPos += 6;
        });
      }
    } else {
      doc.text('No specific teeth have been selected for treatment.', margin + 5, yPos);
      doc.text('Your dental plan may include general procedures that apply to all teeth,', margin + 5, yPos + 8);
      doc.text('or your dentist will determine the specific teeth during your consultation.', margin + 5, yPos + 16);
    }
  }
  
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
    doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
    doc.text('Clinic Comparison', margin, yPos);
    yPos += 10;
    
    // Create clinic comparison table with improved headers
    const clinicCols = [
      { title: 'Clinic Name', width: contentWidth * 0.4, align: 'left' },
      { title: 'Special Price (GBP)', width: contentWidth * 0.3, align: 'center' },
      { title: 'Package Includes', width: contentWidth * 0.3, align: 'left' }
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
    doc.setFillColor(0, 104, 139); // #00688B Strong teal blue
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
      
      // Clinic name with better styling (left aligned)
      doc.setFont('helvetica', 'bold');
      doc.text(clinic.name, clinicColPos[0].x + 5, yPos);
      doc.setFont('helvetica', 'normal');
      
      // Price GBP (center aligned) with discount highlight
      const discount = Math.round(100 - (clinic.priceGBP / totalGBP * 100));
      doc.text(`£${clinic.priceGBP.toLocaleString()}`, clinicColPos[1].x + clinicColPos[1].width / 2, yPos, { align: 'center' });
      
      // Show discount percentage in smaller text
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(178, 144, 79); // #B2904F Elegant gold
      doc.text(`(${discount}% off)`, clinicColPos[1].x + clinicColPos[1].width / 2, yPos + 4, { align: 'center' });
      
      // Reset for next line
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Use emoji icons for hotel, transfer, and translator
      let extrasText = '';
      
      // Get position information for the extras column
      const position = clinicColPos[2];
      
      // Check for specific extras and add icons with text
      const extrasArray = clinic.extras.split(',').map(e => e.trim());
      let xOffset = 5; // Initial offset
      const yOffset = yPos;
      
      // Check for hotel in extras
      if (extrasArray.includes('Hotel')) {
        doc.addImage(HOTEL_ICON_BASE64, 'PNG', position.x + 5, yPos - 4, 4, 4);
        doc.text('Hotel Included', position.x + 15, yPos);
        
        // If both hotel and transfer, we need to adjust positioning
        if (extrasArray.includes('Transfer')) {
          doc.addImage(TRANSFER_ICON_BASE64, 'PNG', position.x + 85, yPos - 4, 4, 4);
          doc.text('Transfer', position.x + 95, yPos);
        } else {
          doc.addImage(TRANSFER_ICON_BASE64, 'PNG', position.x + 5, yPos + 6, 4, 4);
          doc.text('Transfer', position.x + 15, yPos + 10);
        }
      } else if (extrasArray.includes('Transfer')) {
        // Only transfer included
        doc.addImage(TRANSFER_ICON_BASE64, 'PNG', position.x + 5, yPos - 4, 4, 4);
        doc.text('Transfer Included', position.x + 15, yPos);
      }
      
      // Check for translator in extras
      if (extrasArray.includes('Translator')) {
        // Position based on what's already shown
        if (extrasArray.includes('Hotel') && extrasArray.includes('Transfer')) {
          doc.addImage(TRANSLATOR_ICON_BASE64, 'PNG', position.x + 5, yPos + 6, 4, 4);
          doc.text('Translator', position.x + 15, yPos + 10);
        } else if (extrasArray.includes('Hotel') || extrasArray.includes('Transfer')) {
          doc.addImage(TRANSLATOR_ICON_BASE64, 'PNG', position.x + 85, yPos - 4, 4, 4);
          doc.text('Translator', position.x + 95, yPos);
        } else {
          doc.addImage(TRANSLATOR_ICON_BASE64, 'PNG', position.x + 5, yPos - 4, 4, 4);
          doc.text('Translator Included', position.x + 15, yPos);
        }
      }
      
      // Move to next row
      yPos += 12;
    });
  }
  
  // Add final information page with summary of benefits, savings, and links to WhatsApp
  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 40;
  } else {
    yPos += 20;
  }
  
  // Add summary section title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
  doc.text('Summary of Benefits', margin, yPos);
  yPos += 12;
  
  // Reset text attributes
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Highlight key points of the service with bullet points
  yPos += 5;
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 5, yPos + 1, 4, 4);
  doc.text(`Save up to ${totalGBP > 0 ? Math.round(100 - (totalGBP / (totalGBP * 3) * 100)) : 65}% compared to UK dental prices`, margin + 15, yPos + 5);
  
  yPos += 10;
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 5, yPos + 1, 4, 4);
  doc.text('Comprehensive treatment plan with quality guarantees', margin + 15, yPos + 5);
  
  yPos += 10;
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 5, yPos + 1, 4, 4);
  doc.text('All-inclusive package with accommodation and transfers available', margin + 15, yPos + 5);
  
  // Add information about how to proceed
  yPos += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
  doc.text('Next Steps', margin, yPos);
  yPos += 12;
  
  // Reset text attributes
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Steps to proceed with numbered list
  doc.text('1. Review your treatment plan and clinic options', margin + 5, yPos);
  yPos += 8;
  doc.text('2. Login to your Patient Portal to approve your treatment plan', margin + 5, yPos);
  yPos += 8;
  doc.text('3. Secure your booking with a £200 refundable deposit', margin + 5, yPos);
  yPos += 8;
  doc.text('4. Our team will contact you to schedule your consultation and travel dates', margin + 5, yPos);
  
  // Add contact information
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Have Questions?', margin, yPos);
  yPos += 8;
  
  // Reset text attributes
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Contact our patient coordinator:', margin, yPos);
  yPos += 8;
  doc.text('WhatsApp: +44 7700 900123', margin, yPos);
  yPos += 6;
  doc.text('Email: care@mydentalfly.com', margin, yPos);
  yPos += 6;
  doc.text('Website: www.mydentalfly.com', margin, yPos);
  
  // Add footer with URL and quote ID
  const footerYPos = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated for ${patientName || 'Valued Patient'} on ${formattedDate} | Quote ID: MDF-${datePart}-${Math.floor(Math.random() * 1000)}`, pageWidth / 2, footerYPos, { align: 'center' });
  
  // Generate and download the PDF
  const pdfFilename = `MyDentalFly_Quote_${datePart}.pdf`;
  doc.save(pdfFilename);
  
  // Call completion callback if provided
  if (onComplete) {
    onComplete();
  }
};

// Component for displaying the PDF generation UI
export default function PdfGenerator(props: PdfGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  // Translation removed
  
  const handleGenerate = () => {
    setGenerating(true);
    
    try {
      generateQuotePdf({
        ...props,
        onComplete: () => {
          setCompleted(true);
          setGenerating(false);
          if (props.onComplete) {
            props.onComplete();
          }
        }
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      setGenerating(false);
    }
  };
  
  // This can be a UI component for the PDF generation button/progress
  return (
    <div className="pdf-generator">
      <button 
        onClick={handleGenerate}
        disabled={generating}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {generating ? 'Generating...' : completed ? 'Download Again' : 'Download PDF'}
      </button>
      {generating && (
        <p className="text-sm text-gray-600 mt-2">
          {t('quotes.generating_pdf', 'Generating your personalized PDF...')}
        </p>
      )}
      {completed && (
        <p className="text-sm text-green-600 mt-2">
          {t('quotes.pdf_ready', 'Your PDF has been generated and downloaded!')}
        </p>
      )}
    </div>
  );
}

// Helper function to truncate text if it's too long
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}