import { jsPDF } from 'jspdf';

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
  extras?: string;
}

interface QuoteData {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  clinics?: ClinicComparison[];
}

export function generateQuotePdf(quoteData: QuoteData): Buffer {
  const {
    items,
    totalGBP,
    totalUSD,
    patientName = 'Valued Customer',
    patientEmail,
    patientPhone,
    travelMonth,
    departureCity,
    clinics
  } = quoteData;

  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Generate a quote ID
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const quoteId = `IDS-${datePart}-${randomPart}`;

  // Document title and styling
  const primaryColor = "#007ba7";
  const secondaryColor = "#b2904f";
  const darkTextColor = "#333333";

  // Add header
  doc.setDrawColor(primaryColor);
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Istanbul Dental Smile', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote ID: ${quoteId} | Date: ${now.toLocaleDateString('en-GB')}`, 105, 23, { align: 'center' });

  // Greeting
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`Hello ${patientName},`, 20, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Here is your personalized quote for dental treatment in Istanbul.', 20, 52);

  // Add patient details if available
  let yPos = 60;
  if (patientEmail || patientPhone || travelMonth || departureCity) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Your Details:', 20, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    if (patientEmail) {
      doc.text(`Email: ${patientEmail}`, 20, yPos);
      yPos += 6;
    }
    
    if (patientPhone) {
      doc.text(`Phone: ${patientPhone}`, 20, yPos);
      yPos += 6;
    }
    
    if (travelMonth) {
      doc.text(`Travel Month: ${travelMonth}`, 20, yPos);
      yPos += 6;
    }
    
    if (departureCity) {
      doc.text(`Departure City: ${departureCity}`, 20, yPos);
      yPos += 6;
    }
    
    yPos += 6;
  }

  // Treatment Details Table
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Treatment Details', 20, yPos);
  yPos += 8;

  // Table headers
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Treatment', 22, yPos+5.5);
  doc.text('Qty', 95, yPos+5.5);
  doc.text('Price (GBP)', 110, yPos+5.5);
  doc.text('Price (USD)', 145, yPos+5.5);
  yPos += 8;

  // Table rows
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      const isAlternateRow = index % 2 !== 0;
      if (isAlternateRow) {
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos, 170, 7, 'F');
      }
      
      doc.text(item.treatment, 22, yPos+5);
      doc.text(item.quantity.toString(), 95, yPos+5);
      doc.text(`£${item.priceGBP.toFixed(2)}`, 110, yPos+5);
      doc.text(`$${item.priceUSD.toFixed(2)}`, 145, yPos+5);
      yPos += 7;
      
      // Check if we need to add a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }

  // Total row
  doc.setFillColor(primaryColor);
  doc.rect(20, yPos, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', 22, yPos+5.5);
  doc.text(`£${totalGBP.toFixed(2)}`, 110, yPos+5.5);
  doc.text(`$${totalUSD.toFixed(2)}`, 145, yPos+5.5);
  yPos += 15;

  // Check if we need a new page for clinics
  if (yPos > 250 && clinics && clinics.length > 0) {
    doc.addPage();
    yPos = 20;
  }

  // Clinic comparison if available
  if (clinics && clinics.length > 0) {
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Clinic Options', 20, yPos);
    yPos += 8;

    // Table headers
    doc.setFillColor(primaryColor);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPos, 170, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Clinic', 22, yPos+5.5);
    doc.text('Price (GBP)', 110, yPos+5.5);
    doc.text('Features', 145, yPos+5.5);
    yPos += 8;

    // Clinic rows
    doc.setTextColor(darkTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    clinics.forEach((clinic, index) => {
      const isAlternateRow = index % 2 !== 0;
      if (isAlternateRow) {
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos, 170, 7, 'F');
      }
      
      doc.text(clinic.name, 22, yPos+5);
      doc.text(`£${clinic.priceGBP.toFixed(2)}`, 110, yPos+5);
      doc.text(clinic.extras || '', 145, yPos+5);
      yPos += 7;
    });
    
    yPos += 10;
  }

  // Check if we need a new page for footer
  if (yPos > 260) {
    doc.addPage();
    yPos = 20;
  }

  // Add footer
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 280, 210, 17, 'F');
  
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('For more information, please contact us at info@istanbuldentalsmile.com', 105, 286, { align: 'center' });
  doc.text('www.istanbuldentalsmile.com', 105, 291, { align: 'center' });

  // Convert the PDF to a Buffer and return
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}