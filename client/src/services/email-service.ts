import { toast } from '@/components/ui/use-toast';
import { Quote } from './quote-service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

class EmailService {
  async sendQuoteEmail(quote: Quote): Promise<boolean> {
    try {
      // Generate PDF content
      const pdfBase64 = await this.generateQuotePDF(quote);
      
      // In a real app, this would call your backend API
      // For demo purposes, we'll simulate sending an email
      console.log(`Sending email to ${quote.patientEmail} with quote ${quote.id}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email Sent",
        description: `Quote has been emailed to ${quote.patientEmail}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending quote email:', error);
      
      toast({
        title: "Email Failed",
        description: "There was an error sending the email.",
        variant: "destructive",
      });
      
      return false;
    }
  }
  
  async startEmailSequence(quote: Quote): Promise<boolean> {
    try {
      // In a real app, this would call your backend API to start an email sequence
      console.log(`Starting email sequence for ${quote.patientEmail} with quote ${quote.id}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Sequence Started",
        description: `Email sequence has been started for ${quote.patientEmail}`,
      });
      
      // Store sequence data in localStorage for demo purposes
      const sequences = JSON.parse(localStorage.getItem('email_sequences') || '[]');
      sequences.push({
        quoteId: quote.id,
        patientEmail: quote.patientEmail,
        patientName: quote.patientName,
        startedAt: new Date().toISOString(),
        steps: [
          { days: 1, template: 'followup_1', sent: false },
          { days: 3, template: 'followup_2', sent: false },
          { days: 7, template: 'followup_final', sent: false }
        ]
      });
      localStorage.setItem('email_sequences', JSON.stringify(sequences));
      
      return true;
    } catch (error) {
      console.error('Error starting email sequence:', error);
      
      toast({
        title: "Sequence Failed",
        description: "There was an error starting the email sequence.",
        variant: "destructive",
      });
      
      return false;
    }
  }
  
  private async generateQuotePDF(quote: Quote): Promise<string> {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Dental Treatment Quote', 105, 20, { align: 'center' });
    
    // Add patient info
    doc.setFontSize(12);
    doc.text(`Patient: ${quote.patientName}`, 20, 40);
    doc.text(`Email: ${quote.patientEmail}`, 20, 48);
    doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 20, 56);
    doc.text(`Quote #: ${quote.id}`, 20, 64);
    
    // Add treatments table
    doc.setFontSize(14);
    doc.text('Treatment Details', 20, 80);
    
    const tableData = [];
    
    if (quote.selectedPackage) {
      tableData.push([
        quote.selectedPackage.name,
        quote.selectedPackage.description || '',
        `£${quote.selectedPackage.price.toFixed(2)}`
      ]);
    } else if (quote.treatments && quote.treatments.length) {
      quote.treatments.forEach(treatment => {
        tableData.push([
          treatment.name,
          treatment.description || '',
          `£${treatment.price.toFixed(2)}`
        ]);
      });
    }
    
    // @ts-ignore - jsPDF-autotable adds this method
    doc.autoTable({
      startY: 85,
      head: [['Treatment', 'Description', 'Price']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // @ts-ignore - Get the final Y position after the table
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Add special offers and promo codes
    if (quote.appliedOffer) {
      doc.text(`Special Offer: ${quote.appliedOffer.title}`, 20, finalY + 10);
    }
    
    if (quote.promoCode) {
      doc.text(`Promo Code: ${quote.promoCode}`, 20, finalY + 20);
    }
    
    // Add pricing summary
    doc.setFontSize(12);
    doc.text(`Subtotal: £${quote.subtotal.toFixed(2)}`, 140, finalY + 30);
    
    if (quote.savings > 0) {
      doc.text(`Savings: £${quote.savings.toFixed(2)}`, 140, finalY + 38);
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: £${quote.total.toFixed(2)}`, 140, finalY + 48);
    
    // Return as base64 string
    return doc.output('datauristring');
  }
}

// Create a singleton instance
export const emailService = new EmailService();