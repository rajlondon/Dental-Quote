import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Quote } from './quote-service';
import { formatCurrency } from '@/utils/currency-formatter';

class EmailService {
  // Generate PDF for a quote
  generateQuotePdf(quote: Quote): Blob {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add header
    doc.setFontSize(22);
    doc.setTextColor(20, 80, 180);
    doc.text('MyDentalFly', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(70, 70, 70);
    doc.text('Dental Treatment Quote', pageWidth / 2, 30, { align: 'center' });
    
    // Add quote info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Quote ID: ${quote.id}`, 20, 45);
    doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 20, 52);
    doc.text(`Status: ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}`, 20, 59);
    
    // Add patient info
    doc.setFontSize(14);
    doc.setTextColor(20, 80, 180);
    doc.text('Patient Information', 20, 75);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${quote.patientName}`, 20, 82);
    doc.text(`Email: ${quote.patientEmail}`, 20, 89);
    if (quote.patientPhone) {
      doc.text(`Phone: ${quote.patientPhone}`, 20, 96);
    }
    
    // Add treatments table
    doc.setFontSize(14);
    doc.setTextColor(20, 80, 180);
    doc.text('Treatment Details', 20, 115);
    
    const treatmentsData = [];
    
    if (quote.selectedPackage) {
      treatmentsData.push([
        quote.selectedPackage.name,
        quote.selectedPackage.description,
        '1',
        formatCurrency(quote.selectedPackage.price)
      ]);
    } else {
      quote.treatments.forEach(treatment => {
        treatmentsData.push([
          treatment.name,
          treatment.description || '',
          treatment.quantity.toString(),
          formatCurrency(treatment.price)
        ]);
      });
    }
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: 120,
      head: [['Treatment', 'Description', 'Quantity', 'Price']],
      body: treatmentsData,
      theme: 'grid',
      headStyles: { fillColor: [20, 80, 180], textColor: 255 },
      styles: { cellPadding: 5 }
    });
    
    // Add summary
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFontSize(12);
    doc.text(`Subtotal: ${formatCurrency(quote.subtotal)}`, pageWidth - 60, finalY);
    
    if (quote.savings > 0) {
      doc.text(`Savings: -${formatCurrency(quote.savings)}`, pageWidth - 60, finalY + 7);
    }
    
    doc.setFontSize(14);
    doc.setTextColor(20, 80, 180);
    doc.text(`Total: ${formatCurrency(quote.total)}`, pageWidth - 60, finalY + 17);
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('MyDentalFly - Making dental tourism easy and affordable', pageWidth / 2, 280, { align: 'center' });
    doc.text('www.mydentalfly.com', pageWidth / 2, 285, { align: 'center' });
    
    return doc.output('blob');
  }
  
  // Send quote via email
  async sendQuoteEmail(quote: Quote): Promise<boolean> {
    try {
      // In a real implementation, we would send the email via an API endpoint
      // For demo purposes, we're simulating a successful email send
      
      // Show loading toast
      toast({
        title: 'Sending Email',
        description: 'Preparing to send quote via email...',
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success toast
      toast({
        title: 'Email Sent Successfully',
        description: `The quote has been sent to ${quote.patientEmail}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      toast({
        title: 'Email Sending Failed',
        description: 'There was an error sending the email. Please try again later.',
        variant: 'destructive',
      });
      return false;
    }
  }
  
  // Download quote as PDF
  downloadQuotePdf(quote: Quote): void {
    try {
      const pdfBlob = this.generateQuotePdf(quote);
      const url = URL.createObjectURL(pdfBlob);
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dental_Quote_${quote.id}.pdf`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your quote PDF has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error generating your PDF. Please try again.',
        variant: 'destructive',
      });
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService();