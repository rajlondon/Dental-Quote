import { jsPDF } from 'jspdf';
// Removed react-i18next
import { getFlightEstimateForCity } from '@/services/flightEstimatesService';

// PDF generation function that matches exactly the requested format
const generateJourneyPdf = ({
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

  // Set up document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  
  // Generate date for the quote
  const currentDate = new Date();
  const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')} ${
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;
  
  let yPos = 10;
  
  // Patient Info Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Prepared for: ${patientName || 'Valued Customer'}`, margin, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formattedDate}`, margin, yPos);
  yPos += 20;
  
  // Treatment requested section
  doc.setFont('helvetica', 'bold');
  doc.text('Treatment Requested:', margin, yPos);
  yPos += 10;
  
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
  
  doc.text(treatmentSummary, margin, yPos);
  yPos += 15;
  
  // Add disclaimer about the quote
  doc.setFontSize(10);
  doc.text('This quote outlines your selected treatment, travel services, and estimated pricing.', margin, yPos);
  yPos += 6;
  doc.text('Final costs will be confirmed after in-person consultation and diagnostics (X-rays/topography).', margin, yPos);
  yPos += 15;
  
  // Add quote details section header
  doc.setFontSize(14);
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
    yPos += 7;
    const clinic2Price = Math.round(totalGBP * 0.9); // 10% less expensive
    doc.text(`Clinic 2: £${clinic2Price.toLocaleString()}`, margin, yPos);
    yPos += 7;
    const clinic3Price = Math.round(totalGBP * 0.8); // 20% less expensive 
    doc.text(`Clinic 3: £${clinic3Price.toLocaleString()}`, margin, yPos);
  }
  
  yPos += 15;
  
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
    const flightEstimate = getFlightEstimateForCity(departureCity, travelMonth || 'May');
    const flightCost = flightEstimate 
      ? `£${flightEstimate}-£${flightEstimate + 100}`
      : '£220-£320';
    doc.text(`Estimate from ${departureCity} – ${flightCost}`, margin, yPos);
  } else {
    doc.text('Estimate from London – £220-£320', margin, yPos);
  }
  
  yPos += 15;
  
  // UK vs Istanbul cost comparison
  doc.setFont('helvetica', 'bold');
  doc.text('UK vs Istanbul Cost Comparison:', margin, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  // Calculate UK comparison price (usually 3x higher)
  const ukPrice = Math.round(totalGBP * 1.2);
  doc.text(`■■ UK Average: £${ukPrice}+`, margin, yPos);
  yPos += 7;
  
  // Calculate total cost including hotel and transfers
  const minTotalCost = Math.round(totalGBP * 0.8) + 210 + 80; // Treatment + hotel + transfers
  const maxTotalCost = minTotalCost + 100;
  
  doc.text(`■■ Istanbul Estimate: £${minTotalCost} – £${maxTotalCost}`, margin, yPos);
  
  // Footer
  const footerPosition = 280;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 104, 139); // #00688B blue
  doc.text('MyDentalFly.com | +44 7572 445856 | www.mydentalfly.com', pageWidth / 2, footerPosition, { align: 'center' });
  
  // Save the PDF
  const formattedDateForFile = formattedDate.replace(/\s/g, '-');
  const filename = `MyDentalFly_Quote_${formattedDateForFile}.pdf`;
  doc.save(filename);
  
  if (onComplete) {
    onComplete();
  }
};

// Component for React usage
export default function JourneyPdf(props: {
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
  // Translation removed
  
  return (
    <button
      onClick={() => generateJourneyPdf(props)}
      className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 font-medium text-lg transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      {'Download Your Smile Journey Quote'}
    </button>
  );
}