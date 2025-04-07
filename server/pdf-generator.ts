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
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
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

  // Total row
  doc.setFillColor(secondaryColor);
  doc.rect(tableX, yPos, tableWidth, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', colPos[0], yPos+5.5, { align: 'center' });
  doc.text(`£${totalGBP.toFixed(2)}`, colPos[3], yPos+5.5, { align: 'center' });
  doc.text(`$${totalUSD.toFixed(2)}`, colPos[4], yPos+5.5, { align: 'center' });
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
  if (yPos > 230) {
    yPos = addNewPage();
  }

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
  const clinicRowHeight = 12; // Increased row height for better readability
  
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
      
    // Position all text with consistent alignment
    doc.text(clinicName, clinicColPos[0], yPos+6, { align: 'center' });
    doc.text(clinic.location || 'Istanbul', clinicColPos[1], yPos+6, { align: 'center' });
    const clinicPrice = typeof clinic.priceGBP === 'number' ? clinic.priceGBP : parseFloat(String(clinic.priceGBP || '0'));
    doc.text(`£${clinicPrice.toFixed(2)}`, clinicColPos[2], yPos+6, { align: 'center' });
    doc.text(clinic.guarantee || '5 Years', clinicColPos[3], yPos+6, { align: 'center' });
    doc.text(clinic.rating || '⭐⭐⭐⭐⭐', clinicColPos[4], yPos+6, { align: 'center' });
    
    // Handle features text with better wrapping
    const extras = clinic.extras || '';
    if (extras.length > 20) {
      // For longer text, use smaller font and properly wrap
      doc.setFontSize(7);
      const splitExtras = doc.splitTextToSize(extras, 35);
      // Center the text vertically based on number of lines
      const yOffset = splitExtras.length > 1 ? 4 : 6; 
      doc.text(splitExtras, clinicColPos[5], yPos+yOffset, { align: 'center' });
      doc.setFontSize(8); // Reset font size
    } else {
      doc.text(extras, clinicColPos[5], yPos+6, { align: 'center' });
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
  
  createInfoBox(
    'Flight Information', 
    `Estimated flight cost: £150-£300 return from ${departureCity || 'UK'} to Istanbul (${travelMonth || 'year-round'}).`,
    110
  );
  
  yPos += 50;

  // PATIENT TESTIMONIALS
  if (yPos > 220) {
    yPos = addNewPage();
  }
  
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

  // BEFORE/AFTER PLACEHOLDERS
  if (yPos > 220) {
    yPos = addNewPage();
  }
  
  // Section header
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Treatment Results', 20, yPos);
  yPos += 10;

  // Results description
  doc.setTextColor(darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('See the transformation our patients experience with their treatments:', 20, yPos);
  yPos += 15;

  // Before/After placeholder
  doc.setFillColor(lightBgColor);
  doc.roundedRect(20, yPos, 80, 60, 3, 3, 'F');
  doc.roundedRect(110, yPos, 80, 60, 3, 3, 'F');
  
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BEFORE', 60, yPos + 30, { align: 'center' });
  doc.text('AFTER', 150, yPos + 30, { align: 'center' });
  
  yPos += 70;
  
  // Add second Before/After placeholder
  doc.setFillColor(lightBgColor);
  doc.roundedRect(20, yPos, 80, 60, 3, 3, 'F');
  doc.roundedRect(110, yPos, 80, 60, 3, 3, 'F');
  
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BEFORE', 60, yPos + 30, { align: 'center' });
  doc.text('AFTER', 150, yPos + 30, { align: 'center' });
  
  yPos += 70;

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