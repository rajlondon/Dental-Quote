import React, { useRef } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { Button } from '@/components/ui/button';
import { Printer, X, FileDown } from 'lucide-react';

// Formatting helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Date formatter
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

interface QuotePrintViewProps {
  onClose: () => void;
}

export function QuotePrintView({ onClose }: QuotePrintViewProps) {
  const { treatments, promoCode, discountPercent, subtotal, total, patientInfo } = useQuoteStore();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Handle printing
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Dental Treatment Quote</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #ddd;
              padding-bottom: 10px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0070f3;
            }
            .quote-info {
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
            }
            .patient-info, .quote-details {
              width: 48%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f9f9f9;
              font-weight: bold;
            }
            .summary {
              margin-top: 20px;
              text-align: right;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
              font-size: 12px;
              text-align: center;
              color: #666;
            }
            .discount {
              color: #16a34a;
            }
            .total {
              font-weight: bold;
              font-size: 18px;
              margin-top: 10px;
            }
            @media print {
              body {
                padding: 0;
                color: #000;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MyDentalFly</div>
              <div>Dental Treatment Quote</div>
            </div>
            
            <div class="quote-info">
              <div class="patient-info">
                <h3>Patient Information</h3>
                <p><strong>Name:</strong> ${patientInfo?.firstName} ${patientInfo?.lastName}</p>
                <p><strong>Email:</strong> ${patientInfo?.email}</p>
                ${patientInfo?.phone ? `<p><strong>Phone:</strong> ${patientInfo.phone}</p>` : ''}
                ${patientInfo?.preferredDate ? `<p><strong>Preferred Date:</strong> ${patientInfo.preferredDate}</p>` : ''}
              </div>
              
              <div class="quote-details">
                <h3>Quote Details</h3>
                <p><strong>Quote Date:</strong> ${formatDate(new Date())}</p>
                <p><strong>Quote ID:</strong> QT-${Date.now().toString().substring(6)}</p>
                <p><strong>Valid Until:</strong> ${formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}</p>
              </div>
            </div>
            
            <h3>Selected Treatments</h3>
            <table>
              <thead>
                <tr>
                  <th>Treatment</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${treatments.map(t => `
                  <tr>
                    <td>${t.name}</td>
                    <td>${t.quantity}</td>
                    <td>${formatCurrency(t.price)}</td>
                    <td>${formatCurrency(t.price * t.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary">
              <div><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</div>
              ${discountPercent > 0 ? `
                <div class="discount">
                  <strong>Discount (${discountPercent}%):</strong> -${formatCurrency(subtotal * (discountPercent / 100))}
                  ${promoCode ? `<br><span style="font-size: 12px;">Promo code: ${promoCode}</span>` : ''}
                </div>
              ` : ''}
              <div class="total"><strong>Total:</strong> ${formatCurrency(total)}</div>
            </div>
            
            ${patientInfo?.notes ? `
              <div style="margin-top: 20px;">
                <h3>Additional Notes</h3>
                <p>${patientInfo.notes}</p>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>This quote is valid for 30 days from the date of issue.</p>
              <p>For questions or to schedule an appointment, please contact us at contact@mydentalfly.com</p>
              <p>&copy; ${new Date().getFullYear()} MyDentalFly. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a slight delay to ensure styles are applied
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  // Generate PDF data URL
  const generatePdf = () => {
    // In a real implementation, you would use a library like jsPDF or html2pdf
    // For this demo, we'll just use the print functionality
    handlePrint();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Quote Summary</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={generatePdf}
              className="flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
        
        {/* Printable content */}
        <div ref={printRef} className="p-6">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-primary">MyDentalFly</h1>
            <p>Dental Treatment Quote</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Patient Information</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Name:</span> {patientInfo?.firstName} {patientInfo?.lastName}</p>
                <p><span className="font-medium">Email:</span> {patientInfo?.email}</p>
                {patientInfo?.phone && (
                  <p><span className="font-medium">Phone:</span> {patientInfo.phone}</p>
                )}
                {patientInfo?.preferredDate && (
                  <p><span className="font-medium">Preferred Date:</span> {patientInfo.preferredDate}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Quote Details</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Date:</span> {formatDate(new Date())}</p>
                <p><span className="font-medium">Quote ID:</span> QT-{Date.now().toString().substring(6)}</p>
                <p>
                  <span className="font-medium">Valid Until:</span> {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Selected Treatments</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left border-b">Treatment</th>
                  <th className="px-4 py-2 text-center border-b">Quantity</th>
                  <th className="px-4 py-2 text-right border-b">Unit Price</th>
                  <th className="px-4 py-2 text-right border-b">Total</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment, index) => (
                  <tr key={treatment.id} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                    <td className="px-4 py-3 border-b">{treatment.name}</td>
                    <td className="px-4 py-3 text-center border-b">{treatment.quantity}</td>
                    <td className="px-4 py-3 text-right border-b">{formatCurrency(treatment.price)}</td>
                    <td className="px-4 py-3 text-right border-b">{formatCurrency(treatment.price * treatment.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex justify-between py-2 border-b text-green-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span className="font-medium">-{formatCurrency(subtotal * (discountPercent / 100))}</span>
                </div>
              )}
              
              {promoCode && discountPercent > 0 && (
                <div className="text-xs text-green-600 py-1 text-right">
                  Promo code: {promoCode}
                </div>
              )}
              
              <div className="flex justify-between py-2 font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          {patientInfo?.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Additional Notes</h3>
              <p className="p-3 bg-gray-50 rounded">{patientInfo.notes}</p>
            </div>
          )}
          
          <div className="mt-12 pt-6 border-t text-gray-500 text-sm text-center">
            <p>This quote is valid for 30 days from the date of issue.</p>
            <p>For questions or to schedule an appointment, please contact us at contact@mydentalfly.com</p>
            <p className="mt-2">&copy; {new Date().getFullYear()} MyDentalFly. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}