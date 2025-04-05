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
  
  // Create a professional header with branding colors
  // Add a header bar - using Strong teal blue (#00688B)
  doc.setFillColor(0, 104, 139); // #00688B Strong teal blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add a secondary accent strip - using Elegant gold (#B2904F)
  doc.setFillColor(178, 144, 79); // #B2904F Elegant gold
  doc.rect(0, 40, pageWidth, 3, 'F');
  
  // Try to add the logo
  try {
    // Load and add the logo
    const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAyCAYAAAAZUZThAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAyaSURBVHgB7ZwJlBTVGcf/1T09Mz3dM8AMM8iwIyKboKIIyKoJIQpGxaPGI1HJicea5HjUmESMJz4T4xKjeCZGE3NMOCFRo8ckKkFjNBoRFQigCIiAiOxDYIbZ97W+r6d6pqe7Z+mZYVjmf0531/Lq1auq773/99VXXSOhHWhvmHVZ7IVZFapVXtJYWRG82FpWsbWtchoazvxJ+vOf9/P4+eefL1m9evW8pqamvD179kxwOp3BUCg0JxQKnRIMBseKouggCOJQKBTaEQqF3g4Gg6vKysr+NXLkyF2ffvop2sHm17JUf9UcIRiYIYAJEtlLkATIXk+6nRLTFQC9YTfsU4GgCZBsQCAoeBQnoPbUQQgJ2BuCUBc2hP1gvyyEp0pCeI4oBG8vLKzc2nAmpwNffvllyubNm29rbGy8zOVyOcj0eCRCRGTrC0wHpqGhYVpNTc1ZoVBoU319/b1jx479VHavY889n0sH7F0a8tcukIMNc4WQfx4ESRRtxMpksqxokxksXdKmA59OOwBQCQj7Ad9+oH4X4NtNiEElpQkSTrPCNdCF0gFdEHQUHD9+vHvo0KEPVlVVXcqyK7lp48dP3eL5XL+YRnmF7+U5YH8VD/rmInbXHkCiqzjKJVssGzAgCL5qYM9nQM1nQH0gInvdBsE1GK6B50MsHgrZ4aQXk+Px48cPGjNmzIq9e/eetWbNGl4uKho07cyYIzOmT4d/8HCMnTgREydORp8+fThLezitLciRzJWzAe8uYPe/gW//S7IvBCLxrwDg6gvnkBsguPrHPIYKOdE1bty49zt37jx3+fLlqK6uRm2tB5UVPdG5SxcMHToUY8aMgShqqy+ZOG0JYrGQVVMJbF8JbFsJNNb4QX6PnS0HgYp2+A0QHF3iCMKgnZiBAwdu8Hg8Y1avXo3a2lpUeh144hkH1n/uxr33NWLC5MmYNGlS3CZO94Ik8LbM3U1Ar/FAZTl5KYo7+nZDvPzIsdTyD1c/oNPZHZLN2FGEQYMGvVtZWTkyZBCDuLu4seCmbJw93Yx6GfHMMy506jIQv7lnAbKy0jdJji4GUQZSKStwZBccuQADxwFdB6TYANrWsVXLfXBIgn2FsqAcBkVIxA8++GDghAkTlldVVV1E72IZ/JJPwuuvOTDxgkYcqGzA6oavcMddE/GLXxwDg2xNzUx0otrxGpB0vgwbxwCZYJ09CqjfA+z7AjiwAWisZE5sDtD3PEhZgyA4cxDZZPxA01mMcJ7LyZw06b1du3ZN2rRpExvj4ZEYrPcQ4IEnnXju+UaUl/mw+OGd+P3DEzFnzomEgezFEaUgsUJQpNjIy1nYFodA30XdKAn7LpOh8iuGQnpU5ZqgyXIRBLYlKluxCwhTFiuwH6jbRtuQ8Oe2m6W0o9i2HTt2jBg+fPgb5HJPjtwIACNPDOI3j+Ti6adEVHqCeOaZ7bjt9mG44IL8lnvgdIIoDVGd9RBMCiyCwmTOxJoxTJE9j/l+czkCNVvIRYV4InYs9OjR472dO3dOZ/GHIsz+kyEseEDEH54F/j0EWLLEg2uucePll4dg7tzjmocjW+4oaRmh58T7vEIwgxiMmWRMMZCZmSj2UkLtHKdUARn8KRE+QmhH1b1792XffPPNFXv37uXp74L8QmDelTn48TMi1n8PoqoJ+OiDz3HXnaNx8cWDEv5+xzPIEYcpHyuAzBmEICISbD/ynE0R5D7IoGNMJnXsysnJWfLRRx+NZQOdGIM5V5tx3wMCFixBpFFvuCGMhS8CvXoPxtVXnYVu3Y6T6aXUPUoIQcIgZ05BxCDGjBkTpuVRY5k/IQg7FpQYJHI+m7aXLl06IxwOs5Hu3FmESRc6cff9biy8T/nXzFkCXnrJjc8+24GzJ5+MG2+8EaJoaXmCvx3rQfKzLZrMSGK8G/TU2nVBuTlRBslOvq1E2XnUJARndrSzQhRFFBQU/GXFihWcOGhx4NLLzZh3l8BbOLLb5YtL8OOWo1X+D9nNDPwB+MvKfZg0SUIgUIO33noLgYCGk4XqN85mlH0l+Ys1bpCrLDuAVn28Ye4OqC0HSdT8RVSFj2EwjXJTTaC+vn5KQUHBYjbOhw83Yfi4MDx1QN+8SO3qcEXEJCXfCLjjpnq8uiiMXkONGD9+PMRWJuDZXYAh+0IGqfkB8NVEbEBTHSmbCVG5zEozIOPBZJbNkHEwRJ6jXfPZYAdjHBbLy8uHDRgw4DlaF9eQkSEhLCsqBkPKgYTQZqKA9GQn1NYL+P19frRlZfigMcjXj0YuOWiZRH5PMppapglAb3xnCiA4GCATXeZTTFBmXFaQ/l4FZ4Lf7z8xLy/vVUEQBhcVFaF4eAg+H5BhVopN2QoVRZAKxf3lJyQZYExdAEK1wAu6E5wy37/vB+z4TYnzP1E1DUPEaHIWqvY6Qmfgp3FV7pQoq+bWZdgPMljRLQcG6xCIbhfq9/s79+zZc5koiqeePCDMMyyyM6M7JlK3EI2FaqolB/QGiBZZPCgYwfZkNJgwTWTVvbUQ8bOwLSQ3b20C4nVOsMV+WdHaOxhLzghiNTLk/ZdSJpErjwFbKQ/eUIKw2nZBZFf33EtlZecU5yJgzRBhDFO/aSQ2CanHzRIHhcRHDYDiDsEE+BuAf7wY1FkPQPkbRIgozON3EEzZCO/fBP+e94FQmGegRGU7ULMVJiIExeNitU+GxQd0m0H5I9RxIJg3TcxizHTKUXLRtWtXLFuRh74DGE9nNdWA0uUVlcHsHMRk/Ov2cK0SKvELSmPk2ZF12YtxdH3lS3TbAv/BEqIYAwJHVgHO7pCsvcDZQKTpQmEZNOJJFvSCL/PrGwpIjCJIRnvCfjr0A3tRtf1tjJw6D7l5XfD5Z59h+fLluPaGm3D/A4/gD08/iRdfeA6/mtfSj2DRTu/evVtdXj3Bme0ikxEgZAL7tkDhGGkrU+QpUklXlnEyHJnANjJqbLZDrY1WMYz+WFf2a0FDqHEPwt59EHMnQrIV8PohZQYCCNTtgAzWi0iClEGKYxQEI4J7XsEJZ1+LnJwcXlxE2ZYsxvDsyVKcTzLbZKJHbK6gURsDGe9EXm5KCDzagAiNkOlIJKJBrAiXTXTzKapK6KW0yDC8G2UCzMUQ8idANGXzbMTEjAZaLApRUqy+SKXcN/aGwS6xwN4XcfKA05DRyc0QIwOI4oY5Z0B0bxpjA9Zvy8nC81qywsgjDIwgUYKEDuQmHEvS5QyYRzVYkHkJVfRuB+RQAObkiT2X3lbEUGTGlB6QolWAJbxsrWRTmIzMGE3KFHVQKA2HGEkiRpUZdDh06JAYPW6JlZ0oI2OQlKbGtMckB3UXfTsR3PU6HF0vhdnZX6n/QCPCBrXQzD5kI1Bn5C8J5LzXAHN/oHY58MMqWHpdQfE2u4HYKDoF3VAqrYnOkShBMhLpTZwcrPZKvqwJqsOORODa7aPIYZ2gYohUXbyULm0FD6GaMkiOfmRnGNSfGJmkMMO/dgOcJ8+N2ByMCTKVZ49FEPXR7CZ8zxYS7F0Oe6fT4cjIB1eoEj6qCaT3gp+WRxGK6KL3OKpnCiJrYB4K+HeCrSNyvrE6cGUmX5HhGFc0OcJn+CgmEzs8Gs3Qm6SWTA7NjNLbmimWRxm88SnJhL6dV7cFtd7MIFIWGq2XMCn8qhPkYLuQzUabclj6XQLJwWZZMI6IRg2ZyO9TFgHRsBUWPf/KwPh8PrF///6QJDo/q2sCMbW4CDVI3ZuR1ETRiCWWU0YwRCQh0kjb6cHrL9WG1Sn9aQ5YCVRQacf6aEjBTCJWqI5XnG7OGkGGcxkkJiXVVX1Q4kPGOzJmCh9YCU/1VogZJ8NmG6X8FWIeaY6fCrMIkWRht0zs5KFI+VShL0Xnr+SGJRPWohNhdk7Bzp078yRJylzwYBYmXpwBPf15qd/m3LgO4d0Wk8lnf/Ym5h9y4Kq56vmrVq26IxwOX0cGlCjLCG7ZsoUntJJZc5A0uBW0vWrVqsl0vYm9l16QOkEO7FuLcN0GuI+/BFZLN2rtZdGthQWXdIzSSk9iKiXfTEXLGE0Y9fNp+E4Ihzw8e84Y5Pnnn8+rra3dTJ1HQfKDNi4RKSkpGeXxeLhnjbVDm0FrfSxdu3ZdS0rEXjJ4LQCRJVi5fiHc7m4oXrYMYlNjJH5MZCTSd9ayZBzDGKFOiE30rGLCE+lIhH19fWMzBrRd0CzWVeVNqVA+ld5AXUkh3Y5vr06dv5/ucymld0vpcT5L79PPX6D01pTcgpoB2V/TtVl03qDVxZq/qHxzZWXl3I0bNw6ntrRqp+XvoW1blFEA2r5fXl5+Jz3na2pvqppPaC/+D6AYO9kTFhbwAAAAAElFTkSuQmCC';
    doc.addImage(logoBase64, 'PNG', margin, 5, 50, 25, undefined, 'FAST');
  } catch (e) {
    console.error('Error adding logo:', e);
  }
  
  // Add title with white text color for contrast against the blue background
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255); // White text on blue background
  doc.text('Istanbul Dental Smile', margin + 60, 20);
  doc.setFontSize(16);
  doc.text('Treatment Quote', margin + 60, 30);
  
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
      
      // Don't use emojis as they don't render properly in PDFs
      // Instead, use text descriptions with standard characters
      let extrasText = '';
      
      if (clinic.extras.includes('Hotel')) {
        extrasText += '[Hotel] ';
      }
      if (clinic.extras.includes('Transfer')) {
        extrasText += '[Transfer] ';
      }
      if (clinic.extras.includes('Translator')) {
        extrasText += '[Translator] ';
      }
      
      // If nothing was added, just use the original extras text
      if (!extrasText) {
        extrasText = clinic.extras;
      }
      
      doc.text(extrasText, clinicColPos[2].x + 5, yPos);
      
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
  doc.text('Istanbul Dental Smile made the whole process simple and stress-free.', margin + 15, yPos);
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
  
  // Add next steps section
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
  
  // Add a call-to-action block
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