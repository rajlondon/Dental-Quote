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
  const primaryColor = "#007ba7";  // Main blue
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
  
  // Add flight cost as a line item
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
  
  // Calculate updated totals
  const updatedTotalGBP = totalGBP + flightCost;
  // Estimate USD conversion
  const exchangeRate = totalUSD / totalGBP; // Use the same exchange rate as provided in the quote data
  const updatedTotalUSD = updatedTotalGBP * exchangeRate;

  // Total row
  doc.setFillColor(secondaryColor);
  doc.rect(tableX, yPos, tableWidth, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total (including flight)', colPos[0], yPos+5.5, { align: 'center' });
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
    // Default clinics if none provided
    comparisonClinics = [
      {
        name: "DentGroup Istanbul",
        priceGBP: Math.round(totalGBP * 0.95),
        extras: "Premium Service, Modern Facilities",
        location: "Nişantaşı",
        guarantee: "5 Years",
        rating: "⭐⭐⭐⭐⭐"
      },
      {
        name: "Vera Smile",
        priceGBP: Math.round(totalGBP * 0.92),
        extras: "Central Location, Experienced Doctors",
        location: "Şişli",
        guarantee: "5 Years",
        rating: "⭐⭐⭐⭐½"
      },
      {
        name: "LuxClinic Turkey",
        priceGBP: totalGBP,
        extras: "Luxury Experience, VIP Service",
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
  doc.text('Clinic Comparison', 20, yPos);
  yPos += 10;

  // Clinic description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('We partner with the best dental clinics in Istanbul, each carefully vetted for quality, expertise,', 20, yPos);
  yPos += 6;
  doc.text('and patient satisfaction. Below are your recommended clinic options:', 20, yPos);
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
  doc.text('* Our treatment coordinators will help you select the best clinic based on your specific needs.', 20, yPos);
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
  doc.text('See how much you can save by choosing Istanbul for your dental treatment:', 20, yPos);
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
    // Simple gray rectangle with yellow tint for "before" image (discolored tooth)
    const beforeSmileBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUExQUUzQjhEOTBEMTFFQTk0N0VGMUU5OTlBMkI3QjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUExQUUzQjlEOTBEMTFFQTk0N0VGMUU5OTlBMkI3QjUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBQTFBRTNCNkQ5MEQxMUVBOTQ3RUYxRTk5OUEyQjdCNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBQTFBRTNCN0Q5MEQxMUVBOTQ3RUYxRTk5OUEyQjdCNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvV7PVUAAAtrSURBVHja7FxpUFRX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';
    doc.addImage(beforeSmileBase64, 'PNG', 25, yPos + 5, imageWidth, imageHeight);
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
    // Simple white rectangle for "after" image (bright white teeth)
    const afterSmileBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODdDMjhENjhEOTBEMTFFQUJBMEZCRTM1MTY3QkUwNzYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODdDMjhENjlEOTBEMTFFQUJBMEZCRTM1MTY3QkUwNzYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4N0MyOEQ2NkQ5MEQxMUVBQkEwRkJFMzUxNjdCRTA3NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4N0MyOEQ2N0Q5MEQxMUVBQkEwRkJFMzUxNjdCRTA3NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiyMl/oAAAsuSURBVHja7FppUFRX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';
    doc.addImage(afterSmileBase64, 'PNG', 120, yPos + 5, imageWidth, imageHeight);
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
    // Reuse the first before image
    const beforeSmileBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUExQUUzQjhEOTBEMTFFQTk0N0VGMUU5OTlBMkI3QjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUExQUUzQjlEOTBEMTFFQTk0N0VGMUU5OTlBMkI3QjUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBQTFBRTNCNkQ5MEQxMUVBOTQ3RUYxRTk5OUEyQjdCNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBQTFBRTNCN0Q5MEQxMUVBOTQ3RUYxRTk5OUEyQjdCNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvV7PVUAAAtrSURBVHja7FxpUFRX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';
    doc.addImage(beforeSmileBase64, 'PNG', 25, yPos + 5, imageWidth, imageHeight);
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
    // Reuse the first after image 
    const afterSmileBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODdDMjhENjhEOTBEMTFFQUJBMEZCRTM1MTY3QkUwNzYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODdDMjhENjlEOTBEMTFFQUJBMEZCRTM1MTY3QkUwNzYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4N0MyOEQ2NkQ5MEQxMUVBQkEwRkJFMzUxNjdCRTA3NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4N0MyOEQ2N0Q5MEQxMUVBQkEwRkJFMzUxNjdCRTA3NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiyMl/oAAAsuSURBVHja7FppUFRX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';
    doc.addImage(afterSmileBase64, 'PNG', 120, yPos + 5, imageWidth, imageHeight);
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