import { jsPDF } from 'jspdf';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFlightEstimateForCity } from '@/services/flightEstimatesService';

// Base64 encoded icons for reliable PDF embedding
const LOGO_BASE64 = 'data:image/png;base64,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';

// PDF generation function
const generateSmileJourneyPdf = ({
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
}: {
  items: Array<{
    treatment: string;
    priceGBP: number;
    priceUSD: number;
    quantity: number;
    subtotalGBP: number;
    subtotalUSD: number;
    guarantee: string;
  }>,
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  clinics?: Array<{name: string, priceGBP: number, extras: string}>;
  onComplete?: () => void;
}) => {
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

  // Calculate UK comparison price (usually 3x higher)
  const ukPriceMin = Math.round(totalGBP * 3);
  
  // Estimate flight prices based on departure city and travel month
  const flightEstimate = departureCity && travelMonth 
    ? getFlightEstimateForCity(departureCity, travelMonth) 
    : (departureCity ? 200 : null); // Default value if we have city but no matching month

  // Set up document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Generate date for the quote
  const currentDate = new Date();
  const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')} ${
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;
  
  // Add logo at the top center
  try {
    doc.addImage(LOGO_BASE64, 'PNG', pageWidth / 2 - 30, margin, 60, 60);
  } catch (error) {
    console.error('Error adding logo:', error);
  }
  
  let yPos = margin + 65;
  
  // Add title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 104, 139); // #00688B blue
  doc.text('Your Personalized Smile Journey', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Add basic information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Prepared for: ${patientName || 'Valued Customer'}`, margin, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formattedDate}`, margin, yPos);
  yPos += 15;
  
  // Treatment requested section
  doc.setFont('helvetica', 'bold');
  doc.text('Treatment Requested:', margin, yPos);
  yPos += 8;
  
  // Summarize treatments
  doc.setFont('helvetica', 'normal');
  
  // Group items by treatment name and sum quantities
  const groupedItems: Record<string, number> = {};
  items.forEach(item => {
    const name = formatTreatmentName(item.treatment);
    if (groupedItems[name]) {
      groupedItems[name] += item.quantity;
    } else {
      groupedItems[name] = item.quantity;
    }
  });
  
  // Create a treatment summary string
  let treatmentSummary = '';
  Object.entries(groupedItems).forEach(([name, quantity]) => {
    if (treatmentSummary) treatmentSummary += ' + ';
    treatmentSummary += `${quantity} ${name}`;
  });
  
  doc.setFontSize(12);
  doc.text(treatmentSummary, margin, yPos);
  yPos += 15;
  
  // Add disclaimer about the quote
  doc.setFontSize(10);
  doc.text('This quote outlines your selected treatment, travel services, and estimated pricing.', margin, yPos);
  yPos += 6;
  doc.text('Final costs will be confirmed after in-person consultation and diagnostics (X-rays/topography).', margin, yPos);
  yPos += 15;
  
  // Add quote details section header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B blue
  doc.text('Treatment + Travel Quote', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Clinic treatment prices section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Clinic Treatment Prices:', margin, yPos);
  yPos += 10;
  
  // Display clinic options (if provided)
  doc.setFont('helvetica', 'normal');
  if (clinics && clinics.length > 0) {
    clinics.forEach((clinic, index) => {
      doc.text(`Clinic ${index + 1}: £${clinic.priceGBP.toLocaleString()}`, margin, yPos);
      yPos += 7;
    });
  } else {
    // Use the total price as the default if no clinics are specified
    doc.text(`Clinic 1: £${totalGBP.toLocaleString()}`, margin, yPos);
    const clinic2Price = Math.round(totalGBP * 1.1); // 10% more expensive
    yPos += 7;
    doc.text(`Clinic 2: £${clinic2Price.toLocaleString()}`, margin, yPos);
    const clinic3Price = Math.round(totalGBP * 0.95); // 5% less expensive
    yPos += 7;
    doc.text(`Clinic 3: £${clinic3Price.toLocaleString()}`, margin, yPos);
  }
  
  yPos += 10;
  
  // Travel services section
  doc.setFont('helvetica', 'bold');
  doc.text('Travel Services:', margin, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text('4★ hotel for 3 nights – £210', margin, yPos);
  yPos += 7;
  doc.text('VIP Airport Pickup + Clinic Transfers – £80', margin, yPos);
  yPos += 7;
  
  // Add flight estimates if available
  if (departureCity) {
    const flightCost = flightEstimate 
      ? `£${flightEstimate}-£${flightEstimate + 100}`
      : '£150-£250';
    doc.text(`Estimate from ${departureCity} – ${flightCost}`, margin, yPos);
  } else {
    doc.text('Flights – Varies by departure city', margin, yPos);
  }
  
  yPos += 15;
  
  // UK vs Istanbul cost comparison
  doc.setFont('helvetica', 'bold');
  doc.text('UK vs Istanbul Cost Comparison:', margin, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text('■■ UK Average: £' + ukPriceMin.toLocaleString() + '+', margin, yPos);
  yPos += 7;
  
  // Calculate total cost including hotel and transfers
  const minTotalCost = totalGBP + 210 + 80; // Treatment + hotel + transfers
  const maxTotalCost = minTotalCost + (flightEstimate ? flightEstimate + 100 : 250);
  
  doc.text(`■■ Istanbul Estimate: £${minTotalCost.toLocaleString()} – £${maxTotalCost.toLocaleString()}`, margin, yPos);
  yPos += 20;
  
  // Results and reviews section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B blue
  doc.text('Real Results & Reviews', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Placeholder for before/after photos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Before & After (sample):', margin, yPos);
  yPos += 10;
  
  // Draw placeholder for images
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('[Before/After Images Will Appear Here]', pageWidth / 2, yPos + 30, { align: 'center' });
  yPos += 70;
  
  // Testimonials
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('■■■■■■■■■■ "I\'m over the moon with my new smile. The team was amazing from start to finish!" – Sarah K', margin, yPos);
  yPos += 7;
  doc.text('■■■■■■■■■■ "Super professional, and the savings were massive compared to the UK." – James T', margin, yPos);
  yPos += 20;
  
  // Next steps section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 104, 139); // #00688B blue
  doc.text('Next Steps', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('1. Book your FREE video consultation:', margin, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 255); // Blue for links
  doc.text('https://calendly.com/istanbuldentalsmile/consultation', margin + 10, yPos);
  yPos += 12;
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('2. Pay your £200 fully refundable deposit to reserve your spot:', margin, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 255); // Blue for links
  doc.text('https://paylink.example.com', margin + 10, yPos);
  yPos += 15;
  
  doc.setTextColor(0, 0, 0);
  doc.text('You won\'t be asked to pay anything else until after your full clinical consultation in Istanbul.', margin, yPos);
  yPos += 7;
  doc.text('Our team will be with you every step of the way.', margin, yPos);
  yPos += 15;
  
  // Disclaimer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Disclaimer: Your final treatment quote will be confirmed by your chosen clinic after they\'ve reviewed your dental information. Payment for treatment is only made in-person at the clinic.', margin, yPos);
  
  // Footer
  const footerPosition = pageHeight - 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 104, 139); // #00688B blue
  doc.text('Istanbul Dental Smile | +44 7572 445856 | www.istanbuldentalsmile.com', pageWidth / 2, footerPosition, { align: 'center' });
  
  // Save the PDF
  const formattedDateForFile = formattedDate.replace(/\s/g, '-');
  const filename = `IstanbulDentalSmile_Quote_${formattedDateForFile}.pdf`;
  doc.save(filename);
  
  if (onComplete) {
    onComplete();
  }
};

// Component for React usage
export default function NewPdfGenerator(props: {
  items: Array<{
    treatment: string;
    priceGBP: number;
    priceUSD: number;
    quantity: number;
    subtotalGBP: number;
    subtotalUSD: number;
    guarantee: string;
  }>,
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  clinics?: Array<{name: string, priceGBP: number, extras: string}>;
  onComplete?: () => void;
}) {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={() => generateSmileJourneyPdf(props)}
      className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 font-medium text-lg transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      {'Download Your Smile Journey Quote'}
    </button>
  );
}