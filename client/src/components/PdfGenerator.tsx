import { jsPDF } from 'jspdf';
import { useEffect, useState } from 'react';
// Import logo from assets folder
import logoPath from '@/assets/my-dental-fly-logo.png';
import { useTranslation } from 'react-i18next';
import 'jspdf/dist/polyfills.es.js';
import { getFlightEstimateForCity } from '@/services/flightEstimatesService';

// Base64 encoded logo image (converted from PNG for reliable embedding in PDF)
// This ensures the logo appears correctly without external file dependencies
const LOGO_BASE64 = 'data:image/png;base64,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';

// Base64 encoded icons for reliable PDF embedding
const HOTEL_ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVR4nGP8//8/AzqQn8iAKcjAwPAwn4ERXYyJWM245BhhLsCnEZ9rMFxAKmAix3ZkPYxyE7CEIqkuGDWAQgOwJU9iwcN8BkYmGIMczQwMVPACI3puJJQq0V2L4QJ83sEmBwATRSNif10WEAAAAABJRU5ErkJggg==';
const TRANSFER_ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYElEQVR4nO2TOw7AMAhDTS5uODmdIlWQkk871hMCGR4SiLsjysxyEgBJibm2an6qSSeojBVNIthVO5l+94iqbpsTwd/gZYPRea6KpLQenJiBD1aQ+I2zq4y0iaBaZ1S7ABEqKo8q4MyBAAAAAElFTkSuQmCC';
const TRANSLATOR_ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVR4nGP8//8/Azro1nmMKcjAwFB6RZYRXYyJWM245BhhLsCnEZ9rMFxAKmAix3ZkPYxd2o9I1ozhglEDKDQAW/IkFpRekWVkgjHI0czAQAUvMKLnRkKpEt21GC7A5x1scgAnRip4PZOoOQAAAABJRU5ErkJggg==';
const TICK_ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYUlEQVR4nO2TOw7AMAhDbS6V+2/tqdwpUgQp+TRjPSGQ4SEBJcGLN2MSgIroczZrfquxEmTGjCYQrMp2prce4sKyORD8DT426J3nrFREq8GOGTiwAv03jq7S0waCbJ1e7QFi+ytHdKRm7AAAAABJRU5ErkJggg==';

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

// PDF generation function
const generateQuotePdf = ({
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
      
      // Format extras text to match HTML template with icons and proper spacing
      if (clinic.extras.includes('Hotel')) {
        // Add base64 hotel image
        doc.addImage(HOTEL_ICON_BASE64, 'PNG', position.x + 5, yPos - 4, 4, 4);
        extrasText += '    Hotel';
      }
      if (clinic.extras.includes('Transfer')) {
        // Add base64 transfer/car image
        if (extrasText) {
          doc.addImage(TRANSFER_ICON_BASE64, 'PNG', position.x + 45, yPos - 4, 4, 4);
          extrasText += ' ·     Transfer';
        } else {
          doc.addImage(TRANSFER_ICON_BASE64, 'PNG', position.x + 5, yPos - 4, 4, 4);
          extrasText += '    Transfer';
        }
      }
      if (clinic.extras.includes('Translator')) {
        // Add base64 translator/chat image
        if (extrasText) {
          doc.addImage(TRANSLATOR_ICON_BASE64, 'PNG', extrasText.includes('Transfer') ? position.x + 85 : position.x + 45, yPos - 4, 4, 4);
          extrasText += ' ·     Translator';
        } else {
          doc.addImage(TRANSLATOR_ICON_BASE64, 'PNG', position.x + 5, yPos - 4, 4, 4);
          extrasText += '    Translator';
        }
      }
      
      // If nothing was added, just use the original extras text
      if (!extrasText) {
        extrasText = clinic.extras;
      }
      
      // Center align the extras text for better readability
      const xPos = position.align === 'center' 
        ? position.x + position.width / 2 
        : position.x + 5;
      
      doc.text(extrasText, xPos, yPos, { align: 'center' });
      
      yPos += 9;
    });
  }
  
  // Add UK cost comparison section
  yPos += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
  doc.text('UK Cost Comparison', margin, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Add savings callout with background
  doc.setFillColor(245, 250, 255); // Light blue background
  doc.rect(margin, yPos - 5, contentWidth, 25, 'F');
  doc.setDrawColor(178, 144, 79); // #B2904F Elegant gold
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos - 5, contentWidth, 25, 'S');
  
  doc.text(`The same treatment in the UK would typically cost between £${ukPriceMin.toLocaleString()} and £${ukPriceMax.toLocaleString()}.`, margin + 5, yPos);
  
  // Calculate percentage of savings
  const avgUkPrice = (ukPriceMin + ukPriceMax) / 2;
  const savingsAmount = avgUkPrice - totalGBP;
  const savingsPercent = Math.round((savingsAmount / avgUkPrice) * 100);
  
  // Add savings text
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(178, 144, 79); // #B2904F Elegant gold
  doc.text(`By choosing Istanbul, you save approximately £${savingsAmount.toLocaleString()} (${savingsPercent}% savings)`, margin + 5, yPos);
  
  // Add a testimonial section
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B Strong teal blue 
  doc.text('What Our Patients Say', margin, yPos);
  
  yPos += 10;
  // Testimonial background
  doc.setFillColor(245, 250, 255); // Light blue background
  doc.rect(margin, yPos - 5, contentWidth, 35, 'F');
  doc.setDrawColor(178, 144, 79); // #B2904F Elegant gold
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos - 5, contentWidth, 35, 'S');
  
  // Quote marks - using standard quotes
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(178, 144, 79); // #B2904F Elegant gold
  doc.setFontSize(18);
  doc.text('"', margin + 5, yPos);
  
  // Testimonial text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(70, 70, 70);
  doc.text('MyDentalFly.com made the whole process simple and stress-free.', margin + 15, yPos);
  yPos += 8;
  doc.text('The quality of care was exceptional, and I couldn\'t be happier with my new smile!', margin + 15, yPos);
  
  // Author info
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
  doc.text('James T., UK — Hollywood Smile Package', margin + 15, yPos);
  
  // Star rating - use text instead of symbols for better compatibility
  doc.setTextColor(255, 215, 0); // Gold color for stars
  doc.text('[5/5 Rating]', margin + contentWidth - 40, yPos);
  
  // Add Why Book With Us section - check if we need a new page
  // The section needs more space, so add a new page if we're below midway point
  if (yPos > 160) {
    doc.addPage();
    yPos = 40;
  }
  
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
  doc.text('Why Book With Us?', margin, yPos);
  
  yPos += 10;
  // Add background box for Why Book With Us section - using light cream color like in HTML
  doc.setFillColor(255, 253, 240); // Very light gold tint (cream color)
  doc.rect(margin, yPos - 5, contentWidth, 50, 'F');
  doc.setDrawColor(178, 144, 79); // #B2904F Elegant gold
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos - 5, contentWidth, 50, 'S');
  
  // Add checklist items with checkmark symbols - matching HTML template format exactly
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // First item with spacing that matches HTML
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 5, yPos + 1, 4, 4);
  doc.text(`   Vetted, Trusted Clinics`, margin + 10, yPos + 5);
  
  // Second item
  yPos += 10;
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 5, yPos + 1, 4, 4);
  doc.text(`   Concierge Support from Start to Finish`, margin + 10, yPos + 5);
  
  // Third item
  yPos += 10;
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 5, yPos + 1, 4, 4);
  doc.text(`   Safe Payment & Transparent Pricing`, margin + 10, yPos + 5);
  
  // Fourth item
  yPos += 10;
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin + 5, yPos + 1, 4, 4);
  doc.text(`   Enjoy Istanbul While Enhancing Your Smile`, margin + 10, yPos + 5);
  
  // Increment yPos to account for the box height
  yPos += 15;
  
  // Add next steps section - check if we need a new page
  if (yPos > 200) {
    doc.addPage();
    yPos = 40;
  }
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
  doc.text('Next Steps', margin, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Using standard characters instead of special symbols like checkmarks
  doc.text('1. Contact Istanbul Dental Smile to confirm your treatment plan', margin, yPos);
  
  yPos += 7;
  doc.text('2. Book your flight to Istanbul for your chosen dates', margin, yPos);
  
  yPos += 7;
  doc.text('3. We will arrange airport transfer and accommodation options', margin, yPos);
  
  // Add a call-to-action block - check if we need a new page
  if (yPos > 200) {
    doc.addPage();
    yPos = 40;
  }
  
  yPos += 15;
  // CTA background
  doc.setFillColor(0, 104, 139); // #00688B Strong teal blue
  doc.rect(margin, yPos - 5, contentWidth, 30, 'F');
  
  // CTA text
  doc.setTextColor(255, 255, 255); // White text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Ready to Book?', margin + 5, yPos + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Email us at info@istanbuldentalsmile.com or message us on WhatsApp: +447572445856', margin + 5, yPos + 15);
  doc.text('We\'ll handle your travel, treatment, and care — all you do is show up and smile!', margin + 5, yPos + 25);
  
  // Add footer - check if we need a new page
  // If we're too close to the bottom of the page, add a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 40;
  }
  
  // Position footer at the bottom of the page while ensuring it's fully visible
  yPos = 260;
  
  // Add a secondary accent strip before footer
  doc.setFillColor(178, 144, 79); // #B2904F Elegant gold
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
  
  // Add second page with clinic info and materials details
  doc.addPage();
  
  // Reset yPos for new page
  yPos = 20;
  
  // Add blue header on second page too
  doc.setFillColor(0, 104, 139); // #00688B Strong teal blue
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Add a secondary accent strip
  doc.setFillColor(178, 144, 79); // #B2904F Elegant gold
  doc.rect(0, 30, pageWidth, 3, 'F');
  
  // Add white text for the header
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Additional Information', pageWidth / 2, 20, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Materials and Laboratory section
  yPos = 50;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Materials and Laboratory', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const materialsText = 
  "When choosing your perfect provider, the materials and laboratory the clinic uses are sometimes overlooked. Premium " +
  "materials and a top laboratory are essential for achieving the most natural and aesthetic look. At Istanbul Dental Smile, " +
  "your maximum satisfaction and natural look is our top priority. This is why we only work with the best laboratories in " +
  "Istanbul and use only premium products, such as a Zirconium Premium system. This is based on a unique shading " +
  "technology, meaning that its color is not on the surface but comes from within. This unique technology helps to preserve " +
  "translucency after shading, without compromising strength. It enables the creation of highly aesthetic restorations.";
  
  doc.setFont('helvetica', 'normal');
  
  // Create a text wrapping function
  const wrapText = (text: string, maxWidth: number) => {
    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = doc.getStringUnitWidth(testLine) * doc.getFontSize() / doc.internal.scaleFactor;
      
      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    
    lines.push(line);
    return lines;
  };
  
  // Wrap and print the materials text
  const wrappedMaterialsText = wrapText(materialsText, contentWidth);
  wrappedMaterialsText.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  
  // Clinic Information section
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Our Partner Clinics', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const clinicText = 
  "Our partner clinics are situated just a short walk away from your recommended hotel. The clinics are bright and airy with state " +
  "of the art treatment rooms and comfy waiting areas. We have a longstanding relationship and chose these clinics based on the " +
  "clinics' fantastic reputation, excellent work and friendly, patient approach.";
  
  // Wrap and print the clinic text
  const wrappedClinicText = wrapText(clinicText, contentWidth);
  wrappedClinicText.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });
  
  // Hotel and Neighborhood section
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel and Neighborhood', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const hotelText = 
  "Our clinics are in the lively neighborhood of Şişli situated in the center of Istanbul within a stone's throw of the exclusive " +
  "Nişantaşı neighborhood, Maçka Park and is near to all transport links. It is within easy reach of all places of interest and " +
  "the top tourist attractions. The seaside is only a 15-minute bus or taxi ride away.\n\n" +
  "You can choose to check out the shops, listen to music or a live concert and sip cocktails in the one of the districts " +
  "glorious parks, or bars hip cafes.\n\n" +
  "Our recommended hotel is a very convenient 5 minutes' walk from our clinics within easy reach of supermarkets, " +
  "restaurants, pharmacies and public transport. The staff speak great English and are happy to accommodate guests who " +
  "may need softer foods to enjoy in the restaurant / bar downstairs.";
  
  // Wrap and print the hotel text
  const hotelLines = hotelText.split('\n\n');
  hotelLines.forEach(paragraph => {
    const wrappedParagraph = wrapText(paragraph, contentWidth);
    wrappedParagraph.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 5; // Extra spacing between paragraphs
  });
  
  // Package inclusions section
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Package Includes:', margin, yPos);
  yPos += 10;
  
  // Add package inclusions with icons
  doc.addImage(HOTEL_ICON_BASE64, 'PNG', margin, yPos - 4, 5, 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('3 nights hotel accommodation (additional nights available at reduced rates)', margin + 8, yPos);
  yPos += 7;
  
  doc.addImage(TRANSFER_ICON_BASE64, 'PNG', margin, yPos - 4, 5, 5);
  doc.text('Airport transfers to and from your hotel', margin + 8, yPos);
  yPos += 7;
  
  doc.addImage(TRANSLATOR_ICON_BASE64, 'PNG', margin, yPos - 4, 5, 5);
  doc.text('English-speaking patient coordinator to assist throughout your stay', margin + 8, yPos);
  yPos += 7;
  
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin, yPos - 4, 5, 5);
  doc.text('Complimentary panoramic x-ray and dental examination', margin + 8, yPos);
  yPos += 7;
  
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin, yPos - 4, 5, 5);
  doc.text('Bosphorus dinner cruise experience', margin + 8, yPos);
  yPos += 7;
  
  doc.addImage(TICK_ICON_BASE64, 'PNG', margin, yPos - 4, 5, 5);
  doc.text('Personalized treatment plan with full cost transparency', margin + 8, yPos);
  
  // Add footer with contact information
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 104, 139); // #00688B Strong teal blue
  doc.text('www.istanbuldentalsmile.com', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('+447572445856 | Istanbul, Turkey', pageWidth / 2, yPos, { align: 'center' });
  
  // Save the PDF with a formatted date in the filename
  const formattedDateForFile = formattedDate.replace(/\//g, '-');
  const filename = `IstanbulDentalSmile_Quote_${formattedDateForFile}.pdf`;
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