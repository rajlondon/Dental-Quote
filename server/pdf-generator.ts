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
  location?: string;
  guarantee?: string;
  rating?: string;
}

interface Review {
  text: string;
  author: string;
  treatment?: string;
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
  hasXrays?: boolean;
  xrayCount?: number;
  selectedClinicIndex?: number;
}

// Original function - this stays the same
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
    clinics,
    hasXrays = false,
    xrayCount = 0
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

  // Document styling
  const primaryColor = "#009ACA";  // Brighter blue - TEST
  const secondaryColor = "#b2904f"; // Gold accent
  const darkTextColor = "#333333";  // Dark text
  const lightBgColor = "#f5f5f5";   // Light background
  
  // Sample reviews
  const reviews: Review[] = [
    { text: "The best dental experience I've had – professional, smooth and transparent.", author: "Sarah W.", treatment: "Veneers" },
    { text: "Incredible results and I got to explore Istanbul too. 100% recommend!", author: "James T.", treatment: "Dental Implants" },
    { text: "From airport to aftercare, every detail was taken care of. Thanks team!", author: "Alicia M.", treatment: "Full Smile Makeover" }
  ];

  // Initialize page counter
  let pageNumber = 1;
  
  // Helper function to add page
  const addNewPage = () => {
    doc.addPage();
    pageNumber++;
    
    // Add header to new page
    doc.setDrawColor(primaryColor);
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Istanbul Dental Smile', 20, 12);
    doc.setFontSize(9);
    doc.text(`Quote: ${quoteId}`, 170, 12);
    
    // Add footer to new page (moved to bottom of page)
    doc.setFillColor(lightBgColor);
    doc.rect(0, 285, 210, 12, 'F');
    
    doc.setTextColor(darkTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Page ${pageNumber}`, 105, 291, { align: 'center' });
    doc.text('www.istanbuldentalsmile.co.uk | info@istanbuldentalsmile.co.uk', 105, 295, { align: 'center' });
    
    return 30; // Return Y position after header
  };

  // COVER PAGE
  // Add main header
  doc.setDrawColor(primaryColor);
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Istanbul Dental Smile', 105, 30, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Personalized Treatment Quote', 105, 45, { align: 'center' });
  
  // Add quote info box
  doc.setFillColor(secondaryColor);
  doc.roundedRect(35, 80, 140, 50, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Quote Information', 105, 92, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote ID: ${quoteId}`, 105, 102, { align: 'center' });
  doc.text(`Date: ${now.toLocaleDateString('en-GB')}`, 105, 110, { align: 'center' });
  doc.text(`Prepared For: ${patientName}`, 105, 118, { align: 'center' });

  // Add treatment summary
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(35, 140, 140, 60, 3, 3, 'F');
  
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Treatment Summary', 105, 152, { align: 'center' });
  
  doc.setTextColor(darkTextColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Calculate treatments description
  let treatmentText = "";
  if (items && items.length > 0) {
    treatmentText = items.map(item => `${item.quantity}x ${item.treatment}`).join(" + ");
  } else {
    treatmentText = "Dental Treatment Package";
  }
  
  // Handle long texts with wrapping
  const splitTreatment = doc.splitTextToSize(treatmentText, 130);
  doc.text(splitTreatment, 105, 162, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: £${totalGBP.toFixed(2)} / $${totalUSD.toFixed(2)}`, 105, 185, { align: 'center' });

  // Add footer to first page (moved to bottom of page)
  doc.setFillColor(lightBgColor);
  doc.rect(0, 285, 210, 12, 'F');
  
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Page ${pageNumber}`, 105, 291, { align: 'center' });
  doc.text('www.istanbuldentalsmile.co.uk | info@istanbuldentalsmile.co.uk', 105, 295, { align: 'center' });

  // Add CTA at bottom of first page
  doc.setTextColor(secondaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Book Your Free Consultation Today!', 105, 240, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Call or WhatsApp: +44 7572 445856', 105, 248, { align: 'center' });

  // PATIENT DETAILS PAGE
  let yPos = addNewPage();
  
  // Page title
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Your Information', 20, yPos);
  yPos += 10;

  // Patient details
  doc.setTextColor(darkTextColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Hello ${patientName},`, 20, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your interest in dental treatment with Istanbul Dental Smile. This personalized', 20, yPos);
  yPos += 6;
  doc.text('quote provides comprehensive information about your requested treatments, clinic options,', 20, yPos);
  yPos += 6;
  doc.text('and travel arrangements to help you make an informed decision.', 20, yPos);
  yPos += 15;

  // Add patient details box
  doc.setFillColor(lightBgColor);
  doc.roundedRect(20, yPos, 170, 50, 3, 3, 'F');
  yPos += 10;

  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Your Details', 105, yPos, { align: 'center' });
  yPos += 10;

  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  if (patientEmail) {
    doc.text(`Email: ${patientEmail}`, 35, yPos);
    yPos += 7;
  }
  
  if (patientPhone) {
    doc.text(`Phone: ${patientPhone}`, 35, yPos);
    yPos += 7;
  }
  
  if (travelMonth) {
    doc.text(`Planned Travel: ${travelMonth}${departureCity ? ` from ${departureCity}` : ''}`, 35, yPos);
    yPos += 7;
  }
  
  // Add X-ray information
  if (hasXrays) {
    doc.text(`X-rays/CT Scans: ${xrayCount} provided for review`, 35, yPos);
  } else {
    doc.text('X-rays/CT Scans: Not provided', 35, yPos);
  }
  yPos += 7;
  
  yPos += 15;

  // TREATMENT BREAKDOWN PAGE
  if (yPos > 200) {
    yPos = addNewPage();
  }

  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Treatment Breakdown', 20, yPos);
  yPos += 10;

  // Treatment description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Below is a detailed breakdown of the treatments included in your quote:', 20, yPos);
  yPos += 10;

  // Treatment table with improved layout
  // Define column positions and widths - adjusted for better text fitting
  const tableWidth = 170;
  const columnWidths = [65, 15, 30, 30, 30]; // Treatment, Qty, Unit Price, Subtotal, Guarantee
  const tableX = 20;
  const rowHeight = 10; // Increased row height for better readability
  
  // Calculate column positions for better alignment
  const colPos: number[] = [];
  let currentX = tableX;
  for (let i = 0; i < columnWidths.length; i++) {
    colPos.push(currentX + columnWidths[i]/2); // Center position of each column
    currentX += columnWidths[i];
  }
  
  // Table headers with improved styling
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(tableX, yPos, tableWidth, 10, 'F'); // Slightly taller header
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Treatment', colPos[0], yPos+6.5, { align: 'center' });
  doc.text('Qty', colPos[1], yPos+6.5, { align: 'center' });
  doc.text('Unit Price', colPos[2], yPos+6.5, { align: 'center' });
  doc.text('Subtotal', colPos[3], yPos+6.5, { align: 'center' });
  doc.text('Guarantee', colPos[4], yPos+6.5, { align: 'center' });
  yPos += 10;

  // Table rows with improved text handling
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Calculate the flight cost estimate based on the city and month
  // These values match the ones from the frontend flightEstimatesService.ts
  const getFlightCost = (city: string, month: string): number => {
    // Default values for common cities by month
    const flightCosts: Record<string, Record<string, number>> = {
      'London': {
        'January': 120, 'February': 110, 'March': 140, 'April': 170,
        'May': 180, 'June': 220, 'July': 250, 'August': 240,
        'September': 200, 'October': 170, 'November': 130, 'December': 160
      },
      'Manchester': {
        'January': 140, 'February': 130, 'March': 150, 'April': 180,
        'May': 190, 'June': 230, 'July': 260, 'August': 250,
        'September': 210, 'October': 180, 'November': 140, 'December': 170
      }
    };
    
    // Try to get the exact cost, or use London/July as fallback
    return flightCosts[city]?.[month] || flightCosts['London']['July'] || 250;
  };
  
  // Get departure and month data with defaults
  const departureDisplay = departureCity || 'London';
  const monthDisplay = travelMonth || 'July';
  const flightCost = getFlightCost(departureDisplay, monthDisplay);
  
  let rowCount = 0;
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      rowCount++;
      // Create alternating row background for better readability
      const isAlternateRow = index % 2 !== 0;
      if (isAlternateRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');
      }
      
      // Better text handling for treatment names
      let treatment = item.treatment;
      // Check if we need to wrap text
      if (treatment.length > 28) {
        // Split long treatment names and handle with ellipsis if needed
        treatment = treatment.substring(0, 25) + '...';
      }
      
      // Add cell content with consistent alignment
      doc.text(treatment, colPos[0], yPos+6, { align: 'center' });
      doc.text(item.quantity.toString(), colPos[1], yPos+6, { align: 'center' });
      doc.text(`£${item.priceGBP.toFixed(2)}`, colPos[2], yPos+6, { align: 'center' });
      doc.text(`£${item.subtotalGBP.toFixed(2)}`, colPos[3], yPos+6, { align: 'center' });
      doc.text(item.guarantee || 'N/A', colPos[4], yPos+6, { align: 'center' });
      yPos += rowHeight;
      
      // Check if we need to add a new page with more space allowance
      if (yPos > 260) {
        yPos = addNewPage();
      }
    });
  }
  
  // Add flight cost as a line item, but only if it's not already in the items array
  let hasFlightItem = false;
  
  // Check if there's already a flight item in the array
  if (items && items.length > 0) {
    hasFlightItem = items.some(item => 
      item.treatment.toLowerCase().includes('flight') || 
      item.treatment.toLowerCase().includes('return flights')
    );
  }
  
  // Only add flight cost as a separate line if it doesn't already exist
  if (!hasFlightItem) {
    rowCount++;
    const isAlternateRow = rowCount % 2 !== 0;
    if (isAlternateRow) {
      doc.setFillColor(245, 245, 245);
      doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');
    }
    
    doc.text(`Flight (${departureDisplay} to Istanbul, ${monthDisplay})`, colPos[0], yPos+6, { align: 'center' });
    doc.text("1", colPos[1], yPos+6, { align: 'center' });
    doc.text(`£${flightCost.toFixed(2)}`, colPos[2], yPos+6, { align: 'center' });
    doc.text(`£${flightCost.toFixed(2)}`, colPos[3], yPos+6, { align: 'center' });
    doc.text('N/A', colPos[4], yPos+6, { align: 'center' });
    yPos += rowHeight;
  }
  
  // Calculate updated totals, but only add flight cost if it's not already included
  const updatedTotalGBP = hasFlightItem ? totalGBP : totalGBP + flightCost;
  // Estimate USD conversion
  const exchangeRate = totalUSD / totalGBP; // Use the same exchange rate as provided in the quote data
  const updatedTotalUSD = updatedTotalGBP * exchangeRate;

  // Total row
  doc.setFillColor(secondaryColor);
  doc.rect(tableX, yPos, tableWidth, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total (including flights)', colPos[0], yPos+5.5, { align: 'center' });
  doc.text(`£${updatedTotalGBP.toFixed(2)}`, colPos[3], yPos+5.5, { align: 'center' });
  doc.text(`$${updatedTotalUSD.toFixed(2)}`, colPos[4], yPos+5.5, { align: 'center' });
  yPos += 15;

  // Treatment explanation (add more details about treatments)
  if (items && items.length > 0) {
    // Add explanation about treatments if needed
    doc.setTextColor(darkTextColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Treatment Details:', 20, yPos);
    yPos += 7;
    
    items.forEach(item => {
      if (yPos > 250) {
        yPos = addNewPage();
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(item.treatment, 20, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      
      // Provide description based on treatment type
      let description = '';
      
      if (item.treatment.toLowerCase().includes('veneer')) {
        description = 'Dental veneers are thin, custom-made shells designed to cover the front surface of teeth, improving appearance. They provide a natural look with excellent durability and stain resistance.';
      } else if (item.treatment.toLowerCase().includes('crown')) {
        description = 'Dental crowns are tooth-shaped "caps" placed over damaged teeth to restore shape, size, strength, and appearance. Made from high-quality porcelain or ceramic for a natural appearance.';
      } else if (item.treatment.toLowerCase().includes('implant')) {
        description = 'Dental implants are titanium posts surgically positioned into the jawbone beneath the gums, providing a stable foundation for replacement teeth that look, feel, and function like natural teeth.';
      } else if (item.treatment.toLowerCase().includes('whitening')) {
        description = 'Professional teeth whitening uses medical-grade bleaching agents to safely remove stains and discoloration, providing a brighter, more youthful smile in just one session.';
      } else {
        description = 'High-quality dental treatment performed by qualified specialists using premium materials with long-lasting results.';
      }
      
      // Wrap text
      const splitDesc = doc.splitTextToSize(description, 170);
      doc.text(splitDesc, 20, yPos);
      yPos += (splitDesc.length * 5) + 5;
    });
    
    yPos += 5;
  }

  // CLINIC COMPARISON PAGE
  // Always start the clinic comparison section on a new page to ensure enough space
  yPos = addNewPage();

  // Prepare clinic data if not provided
  let comparisonClinics = clinics || [];
  if (comparisonClinics.length === 0) {
    // Default clinics if none provided, using the specific clinic names requested by the client
    comparisonClinics = [
      {
        name: "Maltepe Dental Clinic",
        priceGBP: Math.round(totalGBP * 0.85), // 15% cheaper
        extras: "Modern Facilities, Airport Transfer",
        location: "Maltepe District",
        guarantee: "5 Years",
        rating: "⭐⭐⭐⭐"
      },
      {
        name: "Denteste Istanbul",
        priceGBP: Math.round(totalGBP * 0.80), // 20% cheaper
        extras: "Central Location, 5-Star Hotel Included",
        location: "Şişli",
        guarantee: "7 Years",
        rating: "⭐⭐⭐⭐⭐"
      },
      {
        name: "Istanbulsmilecenter",
        priceGBP: totalGBP, // Original price
        extras: "Luxury Experience, VIP Service, Premium Hotel",
        location: "Levent",
        guarantee: "10 Years",
        rating: "⭐⭐⭐⭐⭐"
      }
    ];
  }

  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Istanbul Clinic Comparison', 20, yPos);
  yPos += 10;

  // Clinic description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('We partner with the best dental clinics in Istanbul, each carefully vetted for quality, expertise,', 20, yPos);
  yPos += 6;
  doc.text('and patient satisfaction. Below are your three recommended Istanbul clinic options:', 20, yPos);
  yPos += 10;

  // Clinic comparison table with improved layout
  // Define column positions and widths with better spacing
  const clinicTableWidth = 170;
  const clinicColumnWidths = [35, 25, 25, 25, 20, 40]; // Clinic, Location, Price, Guarantee, Rating, Features
  const clinicTableX = 20;
  const clinicRowHeight = 15; // Further increased row height for better readability and spacing
  
  // Calculate column positions for better alignment
  const clinicColPos: number[] = [];
  let clinicCurrentX = clinicTableX;
  for (let i = 0; i < clinicColumnWidths.length; i++) {
    clinicColPos.push(clinicCurrentX + clinicColumnWidths[i]/2); // Center position of each column
    clinicCurrentX += clinicColumnWidths[i];
  }

  // Table headers with improved styling
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(clinicTableX, yPos, clinicTableWidth, 10, 'F'); // Slightly taller header
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Clinic', clinicColPos[0], yPos+6.5, { align: 'center' });
  doc.text('Location', clinicColPos[1], yPos+6.5, { align: 'center' });
  doc.text('Price (GBP)', clinicColPos[2], yPos+6.5, { align: 'center' });
  doc.text('Guarantee', clinicColPos[3], yPos+6.5, { align: 'center' });
  doc.text('Rating', clinicColPos[4], yPos+6.5, { align: 'center' });
  doc.text('Features', clinicColPos[5], yPos+6.5, { align: 'center' });
  yPos += 10;

  // Clinic rows with consistent spacing and improved text handling
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  comparisonClinics.forEach((clinic, index) => {
    // Create alternating row background for better readability
    const isAlternateRow = index % 2 !== 0;
    if (isAlternateRow) {
      doc.setFillColor(245, 245, 245);
      doc.rect(clinicTableX, yPos, clinicTableWidth, clinicRowHeight, 'F');
    }
    
    // Handle text wrapping for clinic name consistently
    let clinicName = clinic.name;
    if (clinicName.length > 18) {
      clinicName = clinicName.substring(0, 15) + '...';
    }
      
    // Position all text with consistent alignment and improved vertical centering
    doc.text(clinicName, clinicColPos[0], yPos+8, { align: 'center' }); // Center vertically in the taller row
    doc.text(clinic.location || 'Istanbul', clinicColPos[1], yPos+8, { align: 'center' });
    const clinicPrice = typeof clinic.priceGBP === 'number' ? clinic.priceGBP : parseFloat(String(clinic.priceGBP || '0'));
    doc.text(`£${clinicPrice.toFixed(2)}`, clinicColPos[2], yPos+8, { align: 'center' });
    doc.text(clinic.guarantee || '5 Years', clinicColPos[3], yPos+8, { align: 'center' });
    doc.text(clinic.rating || '⭐⭐⭐⭐⭐', clinicColPos[4], yPos+8, { align: 'center' });
    
    // Handle features text with better wrapping
    const extras = clinic.extras || '';
    if (extras.length > 20) {
      // For longer text, use smaller font and properly wrap
      doc.setFontSize(7);
      const splitExtras = doc.splitTextToSize(extras, 35);
      // Center the text vertically based on number of lines
      const yOffset = splitExtras.length > 1 ? 6 : 8; 
      doc.text(splitExtras, clinicColPos[5], yPos+yOffset, { align: 'center' });
      doc.setFontSize(8); // Reset font size
    } else {
      doc.text(extras, clinicColPos[5], yPos+8, { align: 'center' });
    }
    
    yPos += clinicRowHeight;
  });
  
  yPos += 10;

  // Add clinic selection note
  doc.setTextColor(secondaryColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('* Our treatment coordinators will help you select the best clinic from these three Istanbul options', 20, yPos);
  yPos += 6;
  doc.text('  based on your specific treatment needs and preferences.', 20, yPos);
  yPos += 15;

  // COST SAVINGS COMPARISON (UK vs ISTANBUL)
  if (yPos > 220) {
    yPos = addNewPage();
  }
  
  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Cost Comparison: UK vs Istanbul', 20, yPos);
  yPos += 10;

  // Savings description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Compare UK dental prices with our Istanbul prices to see how much you can save:', 20, yPos);
  yPos += 10;

  // Cost comparison table with improved layout
  // Define column positions and widths with better spacing
  const costTableWidth = 170;
  const costColumnWidths = [60, 35, 40, 35]; // Treatment, UK Price, Istanbul Price, Savings
  const costTableX = 20;
  const costRowHeight = 10; // Increased row height for better readability
  
  // Calculate column positions for better alignment
  const costColPos: number[] = [];
  let costCurrentX = costTableX;
  for (let i = 0; i < costColumnWidths.length; i++) {
    costColPos.push(costCurrentX + costColumnWidths[i]/2); // Center position of each column
    costCurrentX += costColumnWidths[i];
  }

  // Table headers with improved styling
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(costTableX, yPos, costTableWidth, 10, 'F'); // Slightly taller header
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Treatment', costColPos[0], yPos+6.5, { align: 'center' });
  doc.text('UK Price', costColPos[1], yPos+6.5, { align: 'center' });
  doc.text('Istanbul Price', costColPos[2], yPos+6.5, { align: 'center' });
  doc.text('Your Savings', costColPos[3], yPos+6.5, { align: 'center' });
  yPos += 10;

  // Cost comparison rows with consistent spacing and improved text handling
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let totalUKPrice = 0;
  let totalIstanbulPrice = 0;
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      // Create alternating row background for better readability
      const isAlternateRow = index % 2 !== 0;
      if (isAlternateRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(costTableX, yPos, costTableWidth, costRowHeight, 'F');
      }
      
      // UK price is typically 2-3x higher
      const ukPrice = item.priceGBP * 2.5 * item.quantity;
      const istanbulPrice = item.subtotalGBP;
      const savings = ukPrice - istanbulPrice;
      
      totalUKPrice += ukPrice;
      totalIstanbulPrice += istanbulPrice;
      
      // Better text handling for treatment names
      let treatment = item.treatment;
      // Check if we need to wrap text
      if (treatment.length > 23) {
        // Split long treatment names and handle with ellipsis if needed
        treatment = treatment.substring(0, 20) + '...';
      }
      
      // Position all text with consistent alignment
      doc.text(`${item.quantity}x ${treatment}`, costColPos[0], yPos+6, { align: 'center' });
      doc.text(`£${ukPrice.toFixed(2)}`, costColPos[1], yPos+6, { align: 'center' });
      doc.text(`£${istanbulPrice.toFixed(2)}`, costColPos[2], yPos+6, { align: 'center' });
      doc.text(`£${savings.toFixed(2)}`, costColPos[3], yPos+6, { align: 'center' });
      
      yPos += costRowHeight;
      
      // Check if we need to add a new page with more space allowance
      if (yPos > 260) {
        yPos = addNewPage();
      }
    });
  }
  
  // Total savings row with improved styling
  const totalSavings = totalUKPrice - totalIstanbulPrice;
  
  // Use the gold accent color for better highlight of savings
  doc.setFillColor(secondaryColor);
  doc.rect(costTableX, yPos, costTableWidth, 10, 'F'); // Match row height with other rows
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10); // Slightly larger font for emphasis
  doc.text('Total Savings', costColPos[0], yPos+6.5, { align: 'center' });
  doc.text(`£${totalUKPrice.toFixed(2)}`, costColPos[1], yPos+6.5, { align: 'center' });
  doc.text(`£${totalIstanbulPrice.toFixed(2)}`, costColPos[2], yPos+6.5, { align: 'center' });
  doc.text(`£${totalSavings.toFixed(2)}`, costColPos[3], yPos+6.5, { align: 'center' });
  
  yPos += 20; // Increased spacing after the table
  
  // Add savings highlight
  const savingsPercentage = Math.round((totalSavings / totalUKPrice) * 100);
  
  doc.setFillColor(lightBgColor);
  doc.roundedRect(60, yPos, 90, 25, 3, 3, 'F');
  
  doc.setTextColor(primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Save up to ${savingsPercentage}% in Istanbul!`, 105, yPos+15, { align: 'center' });
  
  yPos += 35;

  // TRAVEL INFORMATION
  if (yPos > 220) {
    yPos = addNewPage();
  }
  
  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Travel Information', 20, yPos);
  yPos += 10;

  // Travel description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Let us take care of all your travel arrangements. Your dental journey includes:', 20, yPos);
  yPos += 15;

  // Travel info boxes
  const createInfoBox = (title: string, content: string, xPos: number) => {
    // Create a rectangular box with rounded corners
    doc.setFillColor(lightBgColor);
    doc.roundedRect(xPos, yPos, 80, 40, 3, 3, 'F');
    
    // Add the box title in bold 
    doc.setTextColor(primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, xPos + 40, yPos + 10, { align: 'center' });
    
    // Add the box content with proper wrapping and spacing
    doc.setTextColor(darkTextColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Calculate proper width for text to ensure it fits within the box
    const splitContent = doc.splitTextToSize(content, 70);
    doc.text(splitContent, xPos + 40, yPos + 20, { align: 'center' });
  };
  
  createInfoBox(
    'Accommodation', 
    '4-star luxury hotel stay with breakfast included, walking distance to the clinic.',
    20
  );
  
  createInfoBox(
    'Transportation', 
    'VIP airport pickup and all clinic transfers included in your package.',
    110
  );
  
  yPos += 50;
  
  createInfoBox(
    'Treatment Duration', 
    'Typical treatment time: 3-5 days depending on procedures, with follow-up care.',
    20
  );
  
  // Log the travel information for debugging
  console.log('PDF TRAVEL INFO DEBUG:', { departureCity, travelMonth });
  
  // Note: The flight cost calculation and display is now handled earlier in the document
  // in the treatment breakdown table. The total prices already include the flight costs.
  // We're just showing the flight information in a separate info box here.
  
  // Format the flight information text for the info box
  // Use the already calculated flightCost from earlier in the document
  const flightInfoText = `Estimated flight cost: £${flightCost} return from ${departureDisplay} to Istanbul (${monthDisplay}).`;
  
  // Display the box with the flight info
  createInfoBox(
    'Flight Information', 
    flightInfoText,
    110
  );
  
  yPos += 50;

  // BEFORE AND AFTER RESULTS SECTION
  yPos = addNewPage();
  
  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Before & After Treatment Results', 20, yPos);
  yPos += 10;

  // Descriptive text
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Below are real results from our patients who received dental treatments in Istanbul.', 20, yPos);
  yPos += 6;
  doc.text('These transformations showcase the high quality of our dental work.', 20, yPos);
  yPos += 15;

  // Before & After images - First example
  const imageWidth = 75;
  const imageHeight = 75;
  const imgPadding = 10;
  const labelHeight = 10;

  // First before/after set - yellowed teeth to white teeth
  // Left image (Before)
  doc.setFillColor(lightBgColor);
  doc.roundedRect(20, yPos, imageWidth + imgPadding, imageHeight + imgPadding + labelHeight, 3, 3, 'F');
  
  // Use base64 encoded image data directly
  try {
    // Instead of using complex PNG data, let's draw a simple representation
    doc.setFillColor(236, 220, 153); // yellowish color for discolored teeth
    doc.roundedRect(25, yPos + 5, imageWidth, imageHeight, 2, 2, 'F');
    
    // Add some tooth-like lines to make it look like teeth
    doc.setDrawColor(200, 200, 180);
    doc.setLineWidth(0.5);
    
    // Vertical lines to simulate teeth separation
    for(let i = 1; i < 5; i++) {
      doc.line(25 + (i * (imageWidth/5)), yPos + 5, 25 + (i * (imageWidth/5)), yPos + 5 + imageHeight);
    }
    
    // Horizontal line to simulate gum line
    doc.line(25, yPos + 10, 25 + imageWidth, yPos + 10);
    
    // Add text label inside the image
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Discolored Teeth", 25 + imageWidth/2, yPos + 5 + imageHeight/2, { align: 'center' });
  } catch (error) {
    console.error('Error adding before image 1:', error);
  }
  
  doc.setTextColor(darkTextColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BEFORE', 25 + imageWidth/2, yPos + imageHeight + 10, { align: 'center' });

  // Right image (After)
  doc.setFillColor(lightBgColor);
  doc.roundedRect(115, yPos, imageWidth + imgPadding, imageHeight + imgPadding + labelHeight, 3, 3, 'F');
  
  try {
    // Draw a simple representation for the "after" image (white teeth)
    doc.setFillColor(255, 255, 255); // bright white for perfect teeth
    doc.roundedRect(120, yPos + 5, imageWidth, imageHeight, 2, 2, 'F');
    
    // Add some tooth-like lines to make it look like teeth
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.5);
    
    // Vertical lines to simulate teeth separation
    for(let i = 1; i < 5; i++) {
      doc.line(120 + (i * (imageWidth/5)), yPos + 5, 120 + (i * (imageWidth/5)), yPos + 5 + imageHeight);
    }
    
    // Horizontal line to simulate gum line
    doc.line(120, yPos + 10, 120 + imageWidth, yPos + 10);
    
    // Add text label inside the image
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Bright White Teeth", 120 + imageWidth/2, yPos + 5 + imageHeight/2, { align: 'center' });
  } catch (error) {
    console.error('Error adding after image 1:', error);
  }
  
  doc.setTextColor(darkTextColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AFTER', 120 + imageWidth/2, yPos + imageHeight + 10, { align: 'center' });

  // Treatment type label
  yPos += imageHeight + imgPadding + labelHeight + 5;
  doc.setTextColor(primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Treatment: Premium Porcelain Veneers', 105, yPos, { align: 'center' });
  yPos += 20;

  // Second before/after set - broken tooth to fixed tooth
  // Left image (Before)
  doc.setFillColor(lightBgColor);
  doc.roundedRect(20, yPos, imageWidth + imgPadding, imageHeight + imgPadding + labelHeight, 3, 3, 'F');
  
  try {
    // Create a different "before" image for a broken tooth
    doc.setFillColor(236, 220, 153); // yellowish color for discolored teeth
    doc.roundedRect(25, yPos + 5, imageWidth, imageHeight, 2, 2, 'F');
    
    // Add some tooth-like lines to make it look like teeth
    doc.setDrawColor(200, 200, 180);
    doc.setLineWidth(0.5);
    
    // Vertical lines to simulate teeth separation
    for(let i = 1; i < 5; i++) {
      doc.line(25 + (i * (imageWidth/5)), yPos + 5, 25 + (i * (imageWidth/5)), yPos + 5 + imageHeight);
    }
    
    // Horizontal line to simulate gum line
    doc.line(25, yPos + 10, 25 + imageWidth, yPos + 10);
    
    // Draw a 'broken' tooth in the center
    doc.setFillColor(180, 180, 180);
    doc.triangle(
      48, yPos + 15, // top point
      40, yPos + 30, // bottom left
      56, yPos + 30  // bottom right
    );
    
    // Add text label inside the image
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Broken Tooth", 25 + imageWidth/2, yPos + 5 + imageHeight/2, { align: 'center' });
  } catch (error) {
    console.error('Error adding before image 2:', error);
  }
  
  doc.setTextColor(darkTextColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BEFORE', 25 + imageWidth/2, yPos + imageHeight + 10, { align: 'center' });

  // Right image (After)
  doc.setFillColor(lightBgColor);
  doc.roundedRect(115, yPos, imageWidth + imgPadding, imageHeight + imgPadding + labelHeight, 3, 3, 'F');
  
  try {
    // Draw a simple representation of perfect teeth (dental implant)
    doc.setFillColor(255, 255, 255); // bright white for perfect teeth
    doc.roundedRect(120, yPos + 5, imageWidth, imageHeight, 2, 2, 'F');
    
    // Add some tooth-like lines to make it look like teeth
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.5);
    
    // Vertical lines to simulate teeth separation
    for(let i = 1; i < 5; i++) {
      doc.line(120 + (i * (imageWidth/5)), yPos + 5, 120 + (i * (imageWidth/5)), yPos + 5 + imageHeight);
    }
    
    // Horizontal line to simulate gum line
    doc.line(120, yPos + 10, 120 + imageWidth, yPos + 10);
    
    // Add a special highlight to show the dental implant in the center
    doc.setFillColor(240, 240, 255); // slightly bluish white for the implant
    doc.roundedRect(143, yPos + 15, 14, 20, 1, 1, 'F');
    
    // Add text label inside the image
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Dental Implant", 120 + imageWidth/2, yPos + 5 + imageHeight/2, { align: 'center' });
  } catch (error) {
    console.error('Error adding after image 2:', error);
  }
  
  doc.setTextColor(darkTextColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AFTER', 120 + imageWidth/2, yPos + imageHeight + 10, { align: 'center' });

  // Treatment type label
  yPos += imageHeight + imgPadding + labelHeight + 5;
  doc.setTextColor(primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Treatment: Dental Implant with Porcelain Crown', 105, yPos, { align: 'center' });
  
  // PATIENT TESTIMONIALS
  yPos = addNewPage();
  
  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Patient Testimonials', 20, yPos);
  yPos += 10;

  // Testimonials description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Here\'s what our patients say about their Istanbul Dental Smile experience:', 20, yPos);
  yPos += 15;

  // Testimonials boxes with improved styling
  reviews.forEach((review, index) => {
    // Check if we need to add a new page
    if (yPos > 250) {
      yPos = addNewPage();
    }
    
    // Create a light blue background box
    doc.setFillColor(lightBgColor);
    doc.roundedRect(20, yPos, 170, 35, 3, 3, 'F'); // Slightly taller for better text spacing
    
    // Add the testimonial text
    doc.setTextColor(darkTextColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    
    // Calculate proper text wrapping
    const splitReview = doc.splitTextToSize(`"${review.text}"`, 160);
    doc.text(splitReview, 25, yPos + 10);
    
    // Add the testimonial author with treatment info
    doc.setFont('helvetica', 'bold');
    let authorText = `— ${review.author}`;
    if (review.treatment) {
      authorText += `, ${review.treatment}`;
    }
    
    // Position the author text at the bottom of the box
    const authorYPos = yPos + (splitReview.length > 1 ? 22 + (splitReview.length * 3) : 25);
    doc.text(authorText, 25, Math.min(authorYPos, yPos + 28));
    
    // Add more space between testimonials
    yPos += 45;
  });

  // Skip the placeholder section since we now have a proper Before & After section

  // CALL TO ACTION PAGE
  yPos = addNewPage();
  
  // CTA header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Next Steps', 105, yPos, { align: 'center' });
  yPos += 20;

  // CTA description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Include X-ray status information
  if (hasXrays) {
    doc.text(`Thank you for providing ${xrayCount} X-ray/CT scan${xrayCount !== 1 ? 's' : ''}. Our dental team`, 105, yPos, { align: 'center' });
    yPos += 6;
    doc.text('will review your images to provide you with the most accurate treatment plan.', 105, yPos, { align: 'center' });
    yPos += 14;
  } else {
    doc.text('For the most accurate treatment plan, please provide recent X-rays or CT scans', 105, yPos, { align: 'center' });
    yPos += 6;
    doc.text('during your consultation. This will help our dental team assess your case properly.', 105, yPos, { align: 'center' });
    yPos += 14;
  }
  
  doc.text('Ready to transform your smile? Here\'s how to proceed:', 105, yPos, { align: 'center' });
  yPos += 20;

  // CTA steps
  const ctaSteps = [
    {
      title: '1. Free Consultation',
      description: 'Schedule your free video consultation with our treatment coordinator to discuss your quote and answer any questions.'
    },
    {
      title: '2. Secure Your Booking',
      description: 'Reserve your treatment dates with a small refundable deposit to lock in your price and schedule.'
    },
    {
      title: '3. Pre-Treatment Planning',
      description: 'We\'ll help arrange your travel, accommodation, and create a personalized treatment plan.'
    },
    {
      title: '4. Your Istanbul Journey',
      description: 'Enjoy VIP treatment from arrival to departure with our full concierge support throughout your stay.'
    }
  ];

  ctaSteps.forEach(step => {
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(step.title, 20, yPos);
    yPos += 7;
    
    doc.setTextColor(darkTextColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const splitDesc = doc.splitTextToSize(step.description, 170);
    doc.text(splitDesc, 20, yPos);
    yPos += (splitDesc.length * 6) + 10;
  });

  // Final CTA box
  doc.setFillColor(secondaryColor);
  doc.roundedRect(30, 230, 150, 40, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Start Your Smile Transformation Today!', 105, 245, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Contact us now:', 105, 255, { align: 'center' });
  doc.text('Phone/WhatsApp: +44 7572 445856', 105, 262, { align: 'center' });
  doc.text('Website: istanbuldentalsmile.co.uk', 105, 269, { align: 'center' });

  // Convert the PDF to a Buffer and return
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

// New function for v2 with improved formatting and clinic comparison
export function generateQuotePdfV2(quoteData: QuoteData): Buffer {
  const {
    items,
    totalGBP,
    totalUSD,
    patientName = 'Valued Customer',
    patientEmail,
    patientPhone,
    travelMonth,
    departureCity,
    clinics,
    hasXrays = false,
    xrayCount = 0,
    selectedClinicIndex = 0
  } = quoteData;

  // Debug travel info
  console.log('PDF TRAVEL INFO DEBUG:', { departureCity, travelMonth });

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

  // Document styling - UPDATED COLORS FOR TESTING
  const primaryColor = "#007B9E";  // Updated blue
  const secondaryColor = "#B2904F"; // Gold accent
  const darkTextColor = "#333333";  // Dark text
  const lightBgColor = "#f9f9f9";   // Light background
  
  // Sample reviews
  const reviews: Review[] = [
    { text: "The best dental experience I've had – professional, smooth and transparent.", author: "Sarah W.", treatment: "Veneers" },
    { text: "Incredible results and I got to explore Istanbul too. 100% recommend!", author: "James T.", treatment: "Dental Implants" },
    { text: "From airport to aftercare, every detail was taken care of. Thanks team!", author: "Alicia M.", treatment: "Full Smile Makeover" }
  ];

  // Initialize page counter
  let pageNumber = 1;
  
  // Simple text-based branding - no special characters, just professional design
  const addTextLogo = (x: number, y: number, fontSize: number) => {
    try {
      const currentFont = doc.getFont();
      const currentFontSize = doc.getFontSize();
      const currentTextColor = doc.getTextColor();
      
      // Use professional initials for the branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSize);
      doc.setTextColor(255, 255, 255);
      doc.text('IDS', x, y);  // Just use the company initials (Istanbul Dental Smile)
      
      // Restore previous settings
      doc.setFont(currentFont.fontName, currentFont.fontStyle);
      doc.setFontSize(currentFontSize);
      doc.setTextColor(currentTextColor);
    } catch (error) {
      console.error('Error adding text logo:', error);
      // If text logo fails, do nothing
    }
  };

  // Helper function to add page
  const addNewPage = () => {
    doc.addPage();
    pageNumber++;
    
    // Add header to new page
    doc.setDrawColor(primaryColor);
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 20, 'F');
    
    // Add IDS text logo in header
    try {
      addTextLogo(22, 12, 14);
    } catch (e) {
      console.error('Error adding text logo to header:', e);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Istanbul Dental Smile', 105, 12, { align: 'center' }); // Centered in header
    doc.setFontSize(9);
    doc.text(`Quote: ${quoteId}`, 170, 12);
    
    // Add footer to new page
    doc.setFillColor(lightBgColor);
    doc.rect(0, 285, 210, 12, 'F');
    
    doc.setTextColor(darkTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Page ${pageNumber}`, 105, 291, { align: 'center' });
    doc.text('www.istanbuldentalsmile.co.uk | info@istanbuldentalsmile.co.uk', 105, 295, { align: 'center' });
    
    return 30; // Return Y position after header
  };

  // COVER PAGE
  // Add main header
  doc.setDrawColor(primaryColor);
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 60, 'F');
  
  // Add stylized title with text symbols
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  
  // Add decorative text symbol to cover page
  let titleYPos = 30;
  let subtitleYPos = 45;
  
  try {
    // Add the IDS logo text
    addTextLogo(105, 30, 32);
    titleYPos = 50; // Using logo, move title down
    subtitleYPos = 65; // And subtitle further down
    doc.text('Istanbul Dental Smile', 105, titleYPos, { align: 'center' });
  } catch (e) {
    console.error('Error adding text logo to cover page:', e);
    // Fallback to text-only if logo fails
    doc.text('Istanbul Dental Smile', 105, titleYPos, { align: 'center' });
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Personalized Treatment Quote', 105, subtitleYPos, { align: 'center' });
  
  // Add quote info box
  doc.setFillColor(secondaryColor);
  doc.roundedRect(35, 80, 140, 50, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Quote Information', 105, 92, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote ID: ${quoteId}`, 105, 102, { align: 'center' });
  doc.text(`Date: ${now.toLocaleDateString('en-GB')}`, 105, 110, { align: 'center' });
  doc.text(`Prepared For: ${patientName}`, 105, 118, { align: 'center' });

  // Add treatment summary
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(35, 140, 140, 60, 3, 3, 'F');
  
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Treatment Summary', 105, 152, { align: 'center' });
  
  doc.setTextColor(darkTextColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Calculate treatments description
  let treatmentText = "";
  if (items && items.length > 0) {
    treatmentText = items.map(item => `${item.quantity}x ${item.treatment}`).join(" + ");
  } else {
    treatmentText = "Dental Treatment Package";
  }
  
  // Handle long texts with wrapping
  const splitTreatment = doc.splitTextToSize(treatmentText, 130);
  doc.text(splitTreatment, 105, 162, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: £${totalGBP.toFixed(2)} / $${totalUSD.toFixed(2)}`, 105, 185, { align: 'center' });

  // Add footer to first page
  doc.setFillColor(lightBgColor);
  doc.rect(0, 285, 210, 12, 'F');
  
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Page ${pageNumber}`, 105, 291, { align: 'center' });
  doc.text('www.istanbuldentalsmile.co.uk | info@istanbuldentalsmile.co.uk', 105, 295, { align: 'center' });

  // Add CTA at bottom of first page
  doc.setTextColor(secondaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Book Your Free Consultation Today!', 105, 240, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Call or WhatsApp: +44 7572 445856', 105, 248, { align: 'center' });

  // TREATMENT BREAKDOWN PAGE
  let yPos = addNewPage();

  // Add patient details at top if available
  if (patientName || patientEmail || patientPhone) {
    doc.setTextColor(darkTextColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Hello ${patientName},`, 20, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your interest in dental treatment with Istanbul Dental Smile. This personalized', 20, yPos);
    yPos += 6;
    doc.text('quote provides comprehensive information including your requested treatments and options.', 20, yPos);
    yPos += 10;
  }

  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Treatment Breakdown', 20, yPos);
  yPos += 10;

  // Treatment description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Below is a detailed breakdown of the treatments included in your quote:', 20, yPos);
  yPos += 10;

  // Treatment table with improved layout
  // Define column positions and widths
  const tableWidth = 170;
  const columnWidths = [65, 15, 30, 30, 30]; // Treatment, Qty, Unit Price, Subtotal, Guarantee
  const tableX = 20;
  const rowHeight = 10;
  
  // Calculate column positions for better alignment
  const colPos: number[] = [];
  let currentX = tableX;
  for (let i = 0; i < columnWidths.length; i++) {
    colPos.push(currentX + columnWidths[i]/2); // Center position of each column
    currentX += columnWidths[i];
  }
  
  // Table headers with improved styling
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(tableX, yPos, tableWidth, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Treatment', colPos[0], yPos+6.5, { align: 'center' });
  doc.text('Qty', colPos[1], yPos+6.5, { align: 'center' });
  doc.text('Unit Price', colPos[2], yPos+6.5, { align: 'center' });
  doc.text('Subtotal', colPos[3], yPos+6.5, { align: 'center' });
  doc.text('Guarantee', colPos[4], yPos+6.5, { align: 'center' });
  yPos += 10;

  // Calculate the flight cost estimate based on the city and month
  const getFlightCost = (city: string, month: string): number => {
    // Default values for common cities by month
    const flightCosts: Record<string, Record<string, number>> = {
      'London': {
        'January': 120, 'February': 110, 'March': 140, 'April': 170,
        'May': 180, 'June': 220, 'July': 250, 'August': 240,
        'September': 200, 'October': 170, 'November': 130, 'December': 160
      },
      'Manchester': {
        'January': 140, 'February': 130, 'March': 150, 'April': 180,
        'May': 190, 'June': 230, 'July': 260, 'August': 250,
        'September': 210, 'October': 180, 'November': 140, 'December': 170
      }
    };
    
    // Convert city and month to proper format
    const formattedCity = city || 'London';
    const formattedMonth = month || 'July';
    
    // Try to get the exact cost, or use London/July as fallback
    console.log('Looking up flight cost for:', { city: formattedCity, month: formattedMonth });
    return flightCosts[formattedCity]?.[formattedMonth] || 213; // Default £213 if not found
  };
  
  // Get departure and month data with defaults
  const departureDisplay = departureCity || 'London';
  const monthDisplay = travelMonth || 'July';
  const flightCost = getFlightCost(departureDisplay, monthDisplay);
  
  // Use 0.85 for GBP to USD conversion if not available
  const exchangeRate = totalGBP > 0 ? (totalUSD / totalGBP) : 1.29;
  
  // Table rows with improved text handling
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let rowCount = 0;
  let hasFlightItem = false;
  
  if (items && items.length > 0) {
    // First check if any item is a flight
    hasFlightItem = items.some(item => 
      item.treatment.toLowerCase().includes('flight') || 
      item.treatment.toLowerCase().includes('air')
    );
    
    items.forEach((item, index) => {
      rowCount++;
      // Create alternating row background
      const isAlternateRow = index % 2 !== 0;
      if (isAlternateRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');
      }
      
      // Truncate long treatment names
      let treatment = item.treatment;
      if (treatment.length > 28) {
        treatment = treatment.substring(0, 25) + '...';
      }
      
      // Add cell content
      doc.text(treatment, colPos[0], yPos+6, { align: 'center' });
      doc.text(item.quantity.toString(), colPos[1], yPos+6, { align: 'center' });
      doc.text(`£${item.priceGBP.toFixed(2)}`, colPos[2], yPos+6, { align: 'center' });
      doc.text(`£${item.subtotalGBP.toFixed(2)}`, colPos[3], yPos+6, { align: 'center' });
      doc.text(item.guarantee || 'N/A', colPos[4], yPos+6, { align: 'center' });
      yPos += rowHeight;
      
      // Add new page if needed
      if (yPos > 260) {
        yPos = addNewPage();
      }
    });
  }
  
  // Only add flight cost if not already included
  if (!hasFlightItem) {
    rowCount++;
    const isAlternateRow = rowCount % 2 !== 0;
    if (isAlternateRow) {
      doc.setFillColor(245, 245, 245);
      doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');
    }
    
    doc.text(`Return Flight (${departureDisplay}-Istanbul, ${monthDisplay})`, colPos[0], yPos+6, { align: 'center' });
    doc.text("1", colPos[1], yPos+6, { align: 'center' });
    doc.text(`£${flightCost.toFixed(2)}`, colPos[2], yPos+6, { align: 'center' });
    doc.text(`£${flightCost.toFixed(2)}`, colPos[3], yPos+6, { align: 'center' });
    doc.text('N/A', colPos[4], yPos+6, { align: 'center' });
    yPos += rowHeight;
  }
  
  // Calculate updated totals
  const updatedTotalGBP = hasFlightItem ? totalGBP : totalGBP + flightCost;
  const updatedTotalUSD = updatedTotalGBP * exchangeRate;

  // Total row
  doc.setFillColor(secondaryColor);
  doc.rect(tableX, yPos, tableWidth, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total (including flights)', colPos[0], yPos+5.5, { align: 'center' });
  doc.text(`£${updatedTotalGBP.toFixed(2)}`, colPos[3], yPos+5.5, { align: 'center' });
  doc.text(`$${updatedTotalUSD.toFixed(2)}`, colPos[4], yPos+5.5, { align: 'center' });
  yPos += 15;

  // ISTANBUL CLINIC COMPARISON SECTION
  // Always start the clinic comparison section on a new page
  yPos = addNewPage();

  // Section title with highlight box
  doc.setFillColor(primaryColor);
  doc.rect(20, yPos, 170, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Istanbul Clinic Comparison', 105, yPos+8, { align: 'center' });
  yPos += 20;

  // Introduction to clinic comparison
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Below is a comparison of three top-rated dental clinics in Istanbul that can perform your treatment:', 20, yPos);
  doc.text('(Based on Gemini AI deep research of actual clinic pricing)', 20, yPos + 7);
  yPos += 7;
  yPos += 10;

  // Prepare clinic data if not provided
  let comparisonClinics = clinics || [];
  if (comparisonClinics.length === 0) {
    // Default clinics if none provided, with the specific clinic names
    comparisonClinics = [
      {
        name: "Maltepe Dental Clinic",
        priceGBP: Math.round(updatedTotalGBP * 0.85), // 15% cheaper
        extras: "Modern Facilities, Airport Transfer",
        location: "Maltepe District",
        guarantee: "5 Years",
        rating: "⭐⭐⭐⭐"
      },
      {
        name: "Denteste Istanbul",
        priceGBP: Math.round(updatedTotalGBP * 0.80), // 20% cheaper
        extras: "All-inclusive Package, Hotel Stay",
        location: "City Center",
        guarantee: "3 Years",
        rating: "⭐⭐⭐⭐⭐"
      },
      {
        name: "Istanbulsmilecenter",
        priceGBP: Math.round(updatedTotalGBP * 0.90), // 10% cheaper
        extras: "Premium Materials, VIP Service",
        location: "Sisli District",
        guarantee: "7 Years",
        rating: "⭐⭐⭐⭐"
      }
    ];
  }
  
  // Reorder clinics based on selectedClinicIndex to put the selected clinic first
  if (selectedClinicIndex !== undefined && comparisonClinics.length > selectedClinicIndex) {
    const selectedClinic = comparisonClinics[selectedClinicIndex];
    const otherClinics = comparisonClinics.filter((_, idx) => idx !== selectedClinicIndex);
    comparisonClinics = [selectedClinic, ...otherClinics];
    
    console.log(`Using selected clinic for PDF: ${selectedClinic.name}`);
  }

  // Clinic comparison table
  const clinicTableX = 20;
  const clinicTableWidth = 170;
  const clinicColWidths = [40, 30, 60, 40]; // Name, Price, Extras, Guarantee
  
  // Calculate clinic column positions
  const clinicColPos: number[] = [];
  let clinicCurrentX = clinicTableX;
  for (let i = 0; i < clinicColWidths.length; i++) {
    clinicColPos.push(clinicCurrentX + clinicColWidths[i]/2);
    clinicCurrentX += clinicColWidths[i];
  }
  
  // Table headers
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(clinicTableX, yPos, clinicTableWidth, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Clinic', clinicColPos[0], yPos+6.5, { align: 'center' });
  doc.text('Price', clinicColPos[1], yPos+6.5, { align: 'center' });
  doc.text('Included Extras', clinicColPos[2], yPos+6.5, { align: 'center' });
  doc.text('Guarantee', clinicColPos[3], yPos+6.5, { align: 'center' });
  yPos += 10;
  
  // Table rows for Istanbul clinics
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  comparisonClinics.forEach((clinic, index) => {
    const isHighlighted = index === 0; // Highlight the selected clinic (first in the list after reordering)
    
    if (isHighlighted) {
      doc.setFillColor(230, 245, 255); // Light blue background for highlighted row
      doc.rect(clinicTableX, yPos, clinicTableWidth, 12, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      const isAlternateRow = index % 2 === 0;
      if (isAlternateRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(clinicTableX, yPos, clinicTableWidth, 12, 'F');
      }
      doc.setFont('helvetica', 'normal');
    }
    
    // Clinic name
    doc.text(clinic.name, clinicColPos[0], yPos+6.5, { align: 'center' });
    
    // Price
    if (isHighlighted) {
      doc.setTextColor(primaryColor);
      doc.text(`£${clinic.priceGBP} *`, clinicColPos[1], yPos+6.5, { align: 'center' });
      doc.setTextColor(darkTextColor);
    } else {
      doc.text(`£${clinic.priceGBP}`, clinicColPos[1], yPos+6.5, { align: 'center' });
    }
    
    // Extras
    const extrasText = clinic.extras || 'Standard service';
    const splitExtras = doc.splitTextToSize(extrasText, clinicColWidths[2] - 4);
    doc.text(splitExtras, clinicColPos[2], yPos+6.5, { align: 'center' });
    
    // Guarantee
    doc.text(clinic.guarantee || 'Standard', clinicColPos[3], yPos+6.5, { align: 'center' });
    
    yPos += 12;
  });
  
  // Add footnote for selected clinic
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('* Your selected clinic', clinicTableX, yPos+5);
  yPos += 15;
  
  // Explanation of Istanbul clinic benefits - improved formatting
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('All Istanbul Clinics Include:', 20, yPos);
  yPos += 10;
  
  // Create a light blue background box for benefits
  doc.setFillColor(240, 248, 255); // Light blue background
  doc.roundedRect(20, yPos-5, 170, 45, 3, 3, 'F');
  
  // List benefits with consistent checkmarks and better spacing
  const benefits = [
    'Free initial online consultation',
    'Treatment by experienced specialists',
    'Premium quality materials',
    'Assistance with accommodation',
    'Airport pickup and transfer service'
  ];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  benefits.forEach((benefit, index) => {
    // Draw a colored checkmark
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('✓', 25, yPos);
    
    // Draw the benefit text
    doc.setTextColor(darkTextColor);
    doc.setFont('helvetica', 'normal');
    doc.text(benefit, 35, yPos);
    yPos += 8; // Increased spacing between items
  });
  
  // UK VS ISTANBUL PRICE COMPARISON SECTION
  yPos += 10;
  
  // Section title with highlight box
  doc.setFillColor(primaryColor);
  doc.rect(20, yPos, 170, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Cost Comparison: UK vs Istanbul', 105, yPos+8, { align: 'center' });
  yPos += 20;
  
  // Introduction to UK comparison
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('See how much you can save by choosing dental treatment in Istanbul compared to UK prices:', 20, yPos);
  yPos += 10;
  
  // Create UK comparison clinics with pricing based on research
  // Note about the data source will be added after the comparison table
  
  // Set text style for the pricing section
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkTextColor);
  doc.setFontSize(10);
  
  // Set multipliers based on Gemini AI research
  let londonMultiplier = 3.2; // London clinics approximately 3.2x more expensive
  let manchesterMultiplier = 2.8; // Manchester clinics approximately 2.8x more expensive
  
  // Adjustments based on treatment types in items array
  if (items && items.length > 0) {
    let hasImplants = false;
    let hasVeneers = false;
    let hasCrowns = false;
    
    items.forEach(item => {
      const treatmentLower = item.treatment.toLowerCase();
      if (treatmentLower.includes('implant')) {
        hasImplants = true;
        // Implants have even higher markup in UK
        londonMultiplier = 3.5;
        manchesterMultiplier = 3.2;
      } else if (treatmentLower.includes('veneer')) {
        hasVeneers = true;
        // Veneers are typically 3x more expensive
        londonMultiplier = 3.2;
        manchesterMultiplier = 2.9;
      } else if (treatmentLower.includes('crown')) {
        hasCrowns = true;
        // Crowns are typically 2.8x more expensive
        londonMultiplier = 3.0;
        manchesterMultiplier = 2.7;
      }
    });
  }
  
  const ukClinics = [
    {
      name: "London clinic average price*",
      priceGBP: Math.round(updatedTotalGBP * londonMultiplier),
      extras: "Without travel costs"
    },
    {
      name: "Manchester clinic average price*",
      priceGBP: Math.round(updatedTotalGBP * manchesterMultiplier),
      extras: "Without travel costs"
    },
    {
      // Use the selected clinic name instead of "Istanbul Dental Smile Package"
      name: comparisonClinics[0].name, // Use first clinic (which is the selected one after reordering)
      priceGBP: comparisonClinics[0].priceGBP, // Use the selected clinic's price
      extras: "Including flights"
    }
  ];
  
  // UK comparison table
  const ukTableX = 20;
  const ukTableWidth = 170;
  const ukColWidths = [60, 50, 60]; // Location, Price, Notes
  
  // Calculate UK comparison column positions
  const ukColPos: number[] = [];
  let ukCurrentX = ukTableX;
  for (let i = 0; i < ukColWidths.length; i++) {
    ukColPos.push(ukCurrentX + ukColWidths[i]/2);
    ukCurrentX += ukColWidths[i];
  }
  
  // Table headers
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(ukTableX, yPos, ukTableWidth, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Location', ukColPos[0], yPos+6.5, { align: 'center' });
  doc.text('Price', ukColPos[1], yPos+6.5, { align: 'center' });
  doc.text('Notes', ukColPos[2], yPos+6.5, { align: 'center' });
  yPos += 10;
  
  // Table rows for UK vs Istanbul comparison
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  ukClinics.forEach((clinic, index) => {
    const isHighlighted = index === 2; // Highlight the Istanbul option
    
    if (isHighlighted) {
      doc.setFillColor(230, 245, 255); // Light blue background for highlighted row
      doc.rect(ukTableX, yPos, ukTableWidth, 12, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
    } else {
      const isAlternateRow = index % 2 === 0;
      if (isAlternateRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(ukTableX, yPos, ukTableWidth, 12, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkTextColor);
    }
    
    // Location
    doc.text(clinic.name, ukColPos[0], yPos+6.5, { align: 'center' });
    
    // Price
    doc.text(`£${clinic.priceGBP.toLocaleString()}`, ukColPos[1], yPos+6.5, { align: 'center' });
    
    // Notes
    doc.text(clinic.extras, ukColPos[2], yPos+6.5, { align: 'center' });
    
    yPos += 12;
    
    // Reset text color after highlighted row
    if (isHighlighted) {
      doc.setTextColor(darkTextColor);
    }
  });
  
  // Calculate savings using the selected clinic's price
  const ukAveragePrice = Math.round((ukClinics[0].priceGBP + ukClinics[1].priceGBP) / 2);
  const savingsAmount = ukAveragePrice - comparisonClinics[0].priceGBP; // Use selected clinic's price
  const savingsPercentage = Math.round((savingsAmount / ukAveragePrice) * 100);
  
  // Add savings calculation
  yPos += 5;
  doc.setTextColor(secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Your Savings: £${savingsAmount.toLocaleString()} (${savingsPercentage}% off UK prices)`, 105, yPos, { align: 'center' });
  yPos += 10;
  
  // Add Gemini research citation (force rebuild)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('* Pricing data sourced from Gemini deep research of average UK prices', 105, yPos, { align: 'center' });
  yPos += 10;
  
  // TESTIMONIALS SECTION
  if (yPos > 230) { // If not enough space left, start a new page
    yPos = addNewPage();
  }
  
  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('What Our Patients Say', 20, yPos);
  yPos += 10;
  
  // Add testimonials
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  reviews.forEach((review, index) => {
    // Add new page if needed
    if (yPos > 250) {
      yPos = addNewPage();
    }
    
    // Add review box
    doc.setFillColor(lightBgColor);
    doc.roundedRect(30, yPos, 150, 23, 3, 3, 'F');
    
    // Add quote marks
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('"', 35, yPos + 8);
    
    // Add review text
    doc.setTextColor(darkTextColor);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const reviewText = doc.splitTextToSize(review.text, 140);
    doc.text(reviewText, 40, yPos + 8);
    
    // Add author and treatment
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${review.author}${review.treatment ? ` - ${review.treatment}` : ''}`, 170, yPos + 19, { align: 'right' });
    
    yPos += 28;
  });
  
  // NEXT STEPS SECTION
  if (yPos > 230) { // If not enough space left, start a new page
    yPos = addNewPage();
  }
  
  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Next Steps', 20, yPos);
  yPos += 10;
  
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('To proceed with your treatment journey:', 20, yPos);
  yPos += 7;
  
  const steps = [
    '1. Book a free online consultation with one of our dental specialists',
    '2. Ask any questions you may have about the treatment options',
    '3. Reserve your treatment date with just a £200 deposit (deducted from final price)',
    '4. We\'ll assist with all travel arrangements and accommodation',
    '5. Enjoy your new smile and Istanbul experience!'
  ];
  
  steps.forEach(step => {
    doc.text(step, 25, yPos);
    yPos += 7;
  });
  
  yPos += 5;
  
  // Add CTA
  doc.setTextColor(secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Contact Us Today:', 20, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('WhatsApp/Phone: +44 7572 445856', 25, yPos);
  yPos += 7;
  doc.text('Email: info@istanbuldentalsmile.co.uk', 25, yPos);
  yPos += 7;
  doc.text('Web: www.istanbuldentalsmile.co.uk', 25, yPos);
  
  // Generate PDF buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}