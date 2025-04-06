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
    
    // Add footer to new page
    doc.setFillColor(lightBgColor);
    doc.rect(0, 280, 210, 17, 'F');
    
    doc.setTextColor(darkTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Page ${pageNumber}`, 105, 286, { align: 'center' });
    doc.text('www.istanbuldentalsmile.co.uk | info@istanbuldentalsmile.co.uk', 105, 291, { align: 'center' });
    
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

  // Add footer to first page
  doc.setFillColor(lightBgColor);
  doc.rect(0, 280, 210, 17, 'F');
  
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Page ${pageNumber}`, 105, 286, { align: 'center' });
  doc.text('www.istanbuldentalsmile.co.uk | info@istanbuldentalsmile.co.uk', 105, 291, { align: 'center' });

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

  // Treatment table
  // Table headers
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Treatment', 35, yPos+5.5, { align: 'center' });
  doc.text('Qty', 90, yPos+5.5, { align: 'center' });
  doc.text('Unit Price (GBP)', 120, yPos+5.5, { align: 'center' });
  doc.text('Subtotal (GBP)', 155, yPos+5.5, { align: 'center' });
  doc.text('Guarantee', 185, yPos+5.5, { align: 'center' });
  yPos += 8;

  // Table rows
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      const isAlternateRow = index % 2 !== 0;
      if (isAlternateRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos, 170, 7, 'F');
      }
      
      doc.text(item.treatment, 35, yPos+5, { align: 'center' });
      doc.text(item.quantity.toString(), 90, yPos+5, { align: 'center' });
      doc.text(`£${item.priceGBP.toFixed(2)}`, 120, yPos+5, { align: 'center' });
      doc.text(`£${item.subtotalGBP.toFixed(2)}`, 155, yPos+5, { align: 'center' });
      doc.text(item.guarantee || 'N/A', 185, yPos+5, { align: 'center' });
      yPos += 7;
      
      // Check if we need to add a new page
      if (yPos > 270) {
        yPos = addNewPage();
      }
    });
  }

  // Total row
  doc.setFillColor(secondaryColor);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', 35, yPos+5.5, { align: 'center' });
  doc.text(`£${totalGBP.toFixed(2)}`, 155, yPos+5.5, { align: 'center' });
  doc.text(`$${totalUSD.toFixed(2)}`, 185, yPos+5.5, { align: 'center' });
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

  // Clinic comparison table
  // Table headers
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Clinic', 35, yPos+5.5, { align: 'center' });
  doc.text('Location', 70, yPos+5.5, { align: 'center' });
  doc.text('Price (GBP)', 100, yPos+5.5, { align: 'center' });
  doc.text('Guarantee', 125, yPos+5.5, { align: 'center' });
  doc.text('Rating', 145, yPos+5.5, { align: 'center' });
  doc.text('Features', 170, yPos+5.5, { align: 'center' });
  yPos += 8;

  // Clinic rows
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  comparisonClinics.forEach((clinic, index) => {
    const isAlternateRow = index % 2 !== 0;
    if (isAlternateRow) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 7, 'F');
    }
    
    doc.text(clinic.name, 35, yPos+5, { align: 'center' });
    doc.text(clinic.location || 'Istanbul', 70, yPos+5, { align: 'center' });
    doc.text(`£${clinic.priceGBP.toFixed(2)}`, 100, yPos+5, { align: 'center' });
    doc.text(clinic.guarantee || '5 Years', 125, yPos+5, { align: 'center' });
    doc.text(clinic.rating || '⭐⭐⭐⭐⭐', 145, yPos+5, { align: 'center' });
    
    // Handle long extras text
    const extras = clinic.extras || '';
    if (extras.length > 20) {
      const splitExtras = doc.splitTextToSize(extras, 25);
      doc.text(splitExtras, 170, yPos+3, { align: 'center' });
    } else {
      doc.text(extras, 170, yPos+5, { align: 'center' });
    }
    
    yPos += 7;
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

  // Cost comparison table
  // Table headers
  doc.setFillColor(primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Treatment', 50, yPos+5.5, { align: 'center' });
  doc.text('UK Price', 100, yPos+5.5, { align: 'center' });
  doc.text('Istanbul Price', 130, yPos+5.5, { align: 'center' });
  doc.text('Your Savings', 170, yPos+5.5, { align: 'center' });
  yPos += 8;

  // Cost comparison rows
  doc.setTextColor(darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let totalUKPrice = 0;
  let totalIstanbulPrice = 0;
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      const isAlternateRow = index % 2 !== 0;
      if (isAlternateRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos, 170, 7, 'F');
      }
      
      // UK price is typically 2-3x higher
      const ukPrice = item.priceGBP * 2.5 * item.quantity;
      const istanbulPrice = item.subtotalGBP;
      const savings = ukPrice - istanbulPrice;
      
      totalUKPrice += ukPrice;
      totalIstanbulPrice += istanbulPrice;
      
      doc.text(`${item.quantity}x ${item.treatment}`, 50, yPos+5, { align: 'center' });
      doc.text(`£${ukPrice.toFixed(2)}`, 100, yPos+5, { align: 'center' });
      doc.text(`£${istanbulPrice.toFixed(2)}`, 130, yPos+5, { align: 'center' });
      doc.text(`£${savings.toFixed(2)}`, 170, yPos+5, { align: 'center' });
      
      yPos += 7;
      
      if (yPos > 270) {
        yPos = addNewPage();
      }
    });
  }
  
  // Total savings row
  const totalSavings = totalUKPrice - totalIstanbulPrice;
  
  doc.setFillColor(secondaryColor);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Savings', 50, yPos+5.5, { align: 'center' });
  doc.text(`£${totalUKPrice.toFixed(2)}`, 100, yPos+5.5, { align: 'center' });
  doc.text(`£${totalIstanbulPrice.toFixed(2)}`, 130, yPos+5.5, { align: 'center' });
  doc.text(`£${totalSavings.toFixed(2)}`, 170, yPos+5.5, { align: 'center' });
  
  yPos += 15;
  
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
    doc.setFillColor(lightBgColor);
    doc.roundedRect(xPos, yPos, 80, 40, 3, 3, 'F');
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, xPos + 40, yPos + 10, { align: 'center' });
    
    doc.setTextColor(darkTextColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
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

  // Testimonials boxes
  reviews.forEach((review, index) => {
    if (yPos > 250) {
      yPos = addNewPage();
    }
    
    doc.setFillColor(lightBgColor);
    doc.roundedRect(20, yPos, 170, 30, 3, 3, 'F');
    
    doc.setTextColor(darkTextColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    
    const splitReview = doc.splitTextToSize(`"${review.text}"`, 160);
    doc.text(splitReview, 25, yPos + 10);
    
    doc.setFont('helvetica', 'bold');
    let authorText = `— ${review.author}`;
    if (review.treatment) {
      authorText += `, ${review.treatment}`;
    }
    
    doc.text(authorText, 25, yPos + 25);
    
    yPos += 40;
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
  doc.text('Phone/WhatsApp: +44 7572 445856', 105, 265, { align: 'center' });

  // Convert the PDF to a Buffer and return
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}