import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';
import { FileCheck } from 'lucide-react';

interface EnhancedPdfGeneratorProps {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  referenceNumber: string;
  plannedTravel: string;
  departureCity: string;
  treatments: {
    name: string;
    quantity: number;
    unitPrice: number;
    guarantee: string;
  }[];
  clinics: {
    name: string;
    location: string;
    price: number;
    guarantee: string;
    rating: number;
    features: string;
  }[];
  className?: string;
  buttonText?: string;
  onComplete?: () => void;
}

const EnhancedPdfGenerator: React.FC<EnhancedPdfGeneratorProps> = ({
  patientName,
  patientEmail,
  patientPhone,
  referenceNumber,
  plannedTravel,
  departureCity,
  treatments,
  clinics,
  className = '',
  buttonText = 'Download PDF Quote',
  onComplete
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to generate the PDF
  const generatePdf = async () => {
    setIsLoading(true);
    
    try {
      // Generate current date in DD/MM/YYYY format
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB');
      
      // Calculate UK prices and savings
      let ukTotal = 0;
      let istanbulTotal = 0;
      
      treatments.forEach(treatment => {
        ukTotal += treatment.quantity * treatment.unitPrice * (100/35); // UK price is about 3x Istanbul price
        istanbulTotal += treatment.quantity * treatment.unitPrice;
      });
      
      // Round to 2 decimal places
      ukTotal = Math.round(ukTotal);
      istanbulTotal = Math.round(istanbulTotal);
      
      const savings = ukTotal - istanbulTotal;
      const savingsPercentage = Math.round((savings / ukTotal) * 100);

      // Generate a unique quote ID based on date and reference
      const quoteId = `MDF-${formattedDate.replace(/\//g, '')}-${referenceNumber.slice(-3)}`;
      
      // Format amounts to GBP and USD
      const usdRate = 1.24; // USD to GBP conversion rate
      const istanbulTotalUSD = Math.round(istanbulTotal * usdRate);
      
      // Create treatment summary text
      const treatmentSummaryText = treatments.map(t => 
        `${t.quantity}x ${t.name}`
      ).join(' + ');
      
      // Create each treatment row
      const treatmentRows = treatments.map(treatment => {
        const subtotal = treatment.quantity * treatment.unitPrice;
        return `
          <tr>
            <td style="padding: 8px 8px 8px 0; border-bottom: 1px solid #ddd;">${treatment.name}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${treatment.quantity}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">£${treatment.unitPrice.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">£${subtotal.toFixed(2)}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${treatment.guarantee}</td>
          </tr>
        `;
      }).join('');
      
      // Create each clinic comparison row
      const clinicRows = clinics.map(clinic => {
        // Create star rating visual
        const stars = '+P'.repeat(clinic.rating);
        
        return `
          <tr>
            <td style="padding: 8px 8px 8px 0; border-bottom: 1px solid #ddd;">${clinic.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${clinic.location}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">£${clinic.price.toFixed(2)}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${clinic.guarantee}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${stars}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${clinic.features}</td>
          </tr>
        `;
      }).join('');
      
      // Generate UK vs Istanbul comparison rows
      const comparisonRows = treatments.map(treatment => {
        const ukPrice = Math.round(treatment.quantity * treatment.unitPrice * (100/35));
        const istanbulPrice = treatment.quantity * treatment.unitPrice;
        const individualSavings = ukPrice - istanbulPrice;
        
        return `
          <tr>
            <td style="padding: 8px 8px 8px 0; border-bottom: 1px solid #ddd;">${treatment.quantity}x ${treatment.name}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">£${ukPrice.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">£${istanbulPrice.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">£${individualSavings.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
      
      // Calculate typical duration based on treatments
      let treatmentDuration = "3-5 days";
      if (treatments.some(t => t.name.includes("Implant"))) {
        treatmentDuration = "5-7 days";
      }
      
      // Estimated flight cost
      const flightCost = "£150-£300";

      // Create an HTML template for the PDF using the Istanbul Dental Smile format
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; font-family: 'Roboto', Arial, sans-serif; color: #333;">
          <!-- Page 1: Cover page -->
          <div style="text-align: center; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #2962ff; font-size: 28px; margin-bottom: 5px;">MyDentalFly</h1>
            <h2 style="color: #444; margin-top: 10px; font-weight: normal;">Your Personalized Treatment Quote</h2>
            
            <div style="margin: 60px auto; width: 80%; border: 1px solid #ddd; padding: 30px; background-color: #f9f9f9;">
              <h3 style="color: #666; margin-bottom: 30px;">Quote Information</h3>
              
              <p style="margin: 8px 0;">Quote ID: ${quoteId}</p>
              <p style="margin: 8px 0;">Date: ${formattedDate}</p>
              <p style="margin: 8px 0;">Prepared For: ${patientName}</p>
            </div>
            
            <div style="margin: 50px auto; width: 80%;">
              <h3 style="color: #666; margin-bottom: 20px;">Treatment Summary</h3>
              <p style="font-size: 16px; margin-bottom: 50px;">${treatmentSummaryText}</p>
              
              <div style="margin: 40px 0; padding: 15px; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;">
                <h3 style="margin: 10px 0;">Total: £${istanbulTotal.toFixed(2)} / $${istanbulTotalUSD.toFixed(2)}</h3>
              </div>
            </div>
            
            <div style="margin-top: 80px;">
              <h3 style="color: #2962ff;">Book Your Free Consultation Today!</h3>
              <p>Call or WhatsApp: +44 7572 445856</p>
            </div>
            
            <div style="margin-top: 100px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
              <p>Page 1</p>
              <p>www.mydentalfly.com | info@mydentalfly.com</p>
            </div>
          </div>
          
          <div style="page-break-before: always;"></div>
          
          <!-- Page 2: Patient Information and Treatment Breakdown -->
          <div style="margin-bottom: 10px; border-bottom: 2px solid #2962ff; padding-bottom: 5px;">
            <h1 style="color: #2962ff; font-size: 18px; margin: 0; display: inline-block;">MyDentalFly</h1>
            <span style="float: right; color: #666; font-size: 12px;">Quote: ${quoteId}</span>
          </div>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Your Information</h3>
            <p>Hello ${patientName},</p>
            <p>Thank you for your interest in dental treatment with MyDentalFly. This personalized
            quote provides comprehensive information about your requested treatments, clinic options,
            and travel arrangements to help you make an informed decision.</p>
            
            <div style="margin: 30px auto; width: 90%; border: 1px solid #ddd; padding: 20px; background-color: #f9f9f9;">
              <h4 style="color: #2962ff; text-align: center; margin-top: 0;">Your Details</h4>
              
              <p style="margin: 8px 0;"><strong>Email:</strong> ${patientEmail}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${patientPhone}</p>
              <p style="margin: 8px 0;"><strong>Planned Travel:</strong> ${plannedTravel} from ${departureCity}</p>
            </div>
          </div>
          
          <div style="margin: 40px 0;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Treatment Breakdown</h3>
            <p>Below is a detailed breakdown of the treatments included in your quote:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 8px 8px 0; text-align: left; border-bottom: 2px solid #ddd;">Treatment</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price (GBP)</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal (GBP)</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Guarantee</th>
              </tr>
              
              ${treatmentRows}
              
              <tr style="font-weight: bold;">
                <td style="padding: 8px 8px 8px 0;">Total</td>
                <td style="padding: 8px;"></td>
                <td style="padding: 8px;"></td>
                <td style="padding: 8px; text-align: right;">£${istanbulTotal.toFixed(2)}</td>
                <td style="padding: 8px; text-align: center;">$${istanbulTotalUSD.toFixed(2)}</td>
              </tr>
            </table>
            
            <h4 style="margin-top: 30px;">Treatment Details:</h4>
            ${treatments.map(t => `
              <p><strong>${t.name}</strong></p>
              <p style="margin-left: 20px;">${getTreatmentDescription(t.name)}</p>
            `).join('')}
          </div>
          
          <div style="margin-top: 100px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            <p>Page 2</p>
            <p>www.mydentalfly.com | info@mydentalfly.com</p>
          </div>
          
          <div style="page-break-before: always;"></div>
          
          <!-- Page 3: Clinic Comparison -->
          <div style="margin-bottom: 10px; border-bottom: 2px solid #2962ff; padding-bottom: 5px;">
            <h1 style="color: #2962ff; font-size: 18px; margin: 0; display: inline-block;">MyDentalFly</h1>
            <span style="float: right; color: #666; font-size: 12px;">Quote: ${quoteId}</span>
          </div>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Clinic Comparison</h3>
            <p>We partner with the best dental clinics in Istanbul, each carefully vetted for quality, expertise,
            and patient satisfaction. Below are your recommended clinic options:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 8px 8px 0; text-align: left; border-bottom: 2px solid #ddd;">Clinic</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Location</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price (GBP)</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Guarantee</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Rating</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Features</th>
              </tr>
              
              ${clinicRows}
            </table>
            
            <p style="font-style: italic; font-size: 12px;">* Our treatment coordinators will help you select the best clinic based on your specific needs.</p>
          </div>
          
          <div style="margin: 40px 0;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Cost Comparison: UK vs Istanbul</h3>
            <p>See how much you can save by choosing Istanbul for your dental treatment:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 8px 8px 0; text-align: left; border-bottom: 2px solid #ddd;">Treatment</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">UK Price</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Istanbul Price</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Your Savings</th>
              </tr>
              
              ${comparisonRows}
              
              <tr style="font-weight: bold;">
                <td style="padding: 8px 8px 8px 0;">Total Savings</td>
                <td style="padding: 8px; text-align: right;">£${ukTotal.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right;">£${istanbulTotal.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right;">£${savings.toFixed(2)}</td>
              </tr>
            </table>
            
            <div style="text-align: center; margin: 30px 0; padding: 10px; background-color: #f0f7ff; border: 1px solid #d0e3ff; border-radius: 5px;">
              <h3 style="color: #2962ff; margin: 0;">Save up to ${savingsPercentage}% in Istanbul!</h3>
            </div>
          </div>
          
          <div style="margin: 40px 0;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Travel Information</h3>
            <p>Let us take care of all your travel arrangements. Your dental journey includes:</p>
            
            <div style="display: flex; margin: 20px 0;">
              <div style="flex: 1; padding: 15px; border: 1px solid #eee; margin-right: 10px; background-color: #f9f9f9;">
                <h4 style="color: #444; text-align: center;">Accommodation</h4>
                <p style="text-align: center;">4-star luxury hotel stay with breakfast included, walking distance to the clinic.</p>
              </div>
              
              <div style="flex: 1; padding: 15px; border: 1px solid #eee; margin-left: 10px; background-color: #f9f9f9;">
                <h4 style="color: #444; text-align: center;">Transportation</h4>
                <p style="text-align: center;">VIP airport pickup and all clinic transfers included in your package.</p>
              </div>
            </div>
            
            <div style="display: flex; margin: 20px 0;">
              <div style="flex: 1; padding: 15px; border: 1px solid #eee; margin-right: 10px; background-color: #f9f9f9;">
                <h4 style="color: #444; text-align: center;">Treatment Duration</h4>
                <p style="text-align: center;">Typical treatment time: ${treatmentDuration} depending on complexity.</p>
              </div>
              
              <div style="flex: 1; padding: 15px; border: 1px solid #eee; margin-left: 10px; background-color: #f9f9f9;">
                <h4 style="color: #444; text-align: center;">Flight Information</h4>
                <p style="text-align: center;">Estimated flight cost: ${flightCost} return from ${departureCity}.</p>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 100px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            <p>Page 3</p>
            <p>www.mydentalfly.com | info@mydentalfly.com</p>
          </div>
          
          <div style="page-break-before: always;"></div>
          
          <!-- Page 4: Testimonials and Before/After -->
          <div style="margin-bottom: 10px; border-bottom: 2px solid #2962ff; padding-bottom: 5px;">
            <h1 style="color: #2962ff; font-size: 18px; margin: 0; display: inline-block;">MyDentalFly</h1>
            <span style="float: right; color: #666; font-size: 12px;">Quote: ${quoteId}</span>
          </div>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Patient Testimonials</h3>
            <p>Here's what our patients say about their MyDentalFly experience:</p>
            
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee; background-color: #f9f9f9;">
              <p style="font-style: italic;">"The best dental experience I've had – professional, smooth and transparent."</p>
              <p style="margin-top: 10px; font-weight: bold;">— Sarah W., Veneers</p>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee; background-color: #f9f9f9;">
              <p style="font-style: italic;">"Incredible results and I got to explore Istanbul too. 100% recommend!"</p>
              <p style="margin-top: 10px; font-weight: bold;">— James T., Dental Implants</p>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee; background-color: #f9f9f9;">
              <p style="font-style: italic;">"From airport to aftercare, every detail was taken care of. Thanks team!"</p>
              <p style="margin-top: 10px; font-weight: bold;">— Alicia M., Full Smile Makeover</p>
            </div>
          </div>
          
          <div style="margin: 40px 0;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Treatment Results</h3>
            <p>See the transformation our patients experience with their treatments:</p>
            
            <div style="display: flex; margin: 20px 0; justify-content: space-between;">
              <div style="flex: 1; padding: 10px; text-align: center;">
                <h4>BEFORE</h4>
                <div style="width: 100%; height: 150px; background-color: #eee; display: flex; align-items: center; justify-content: center;">
                  <p style="color: #999;">Before Image</p>
                </div>
              </div>
              
              <div style="flex: 1; padding: 10px; text-align: center;">
                <h4>AFTER</h4>
                <div style="width: 100%; height: 150px; background-color: #eee; display: flex; align-items: center; justify-content: center;">
                  <p style="color: #999;">After Image</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 100px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            <p>Page 4</p>
            <p>www.mydentalfly.com | info@mydentalfly.com</p>
          </div>
          
          <div style="page-break-before: always;"></div>
          
          <!-- Page 5: Next Steps -->
          <div style="margin-bottom: 10px; border-bottom: 2px solid #2962ff; padding-bottom: 5px;">
            <h1 style="color: #2962ff; font-size: 18px; margin: 0; display: inline-block;">MyDentalFly</h1>
            <span style="float: right; color: #666; font-size: 12px;">Quote: ${quoteId}</span>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <h2 style="color: #2962ff;">Next Steps</h2>
            <p>Ready to transform your smile? Here's how to proceed:</p>
            
            <div style="margin: 40px 0; text-align: left;">
              <div style="margin: 20px 0;">
                <h3 style="color: #2962ff;">1. Free Consultation</h3>
                <p>Schedule your free video consultation with our treatment coordinator to discuss your quote and
                answer any questions.</p>
              </div>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #2962ff;">2. Secure Your Booking</h3>
                <p>Reserve your treatment dates with a small refundable deposit to lock in your price and schedule.</p>
              </div>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #2962ff;">3. Pre-Treatment Planning</h3>
                <p>We'll help arrange your travel, accommodation, and create a personalized treatment plan.</p>
              </div>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #2962ff;">4. Your Istanbul Journey</h3>
                <p>Enjoy VIP treatment from arrival to departure with our full concierge support throughout your stay.</p>
              </div>
            </div>
            
            <div style="margin: 60px 0; padding: 20px; border: 2px solid #2962ff; background-color: #f0f7ff;">
              <h2 style="color: #2962ff; margin-top: 0;">Start Your Smile Transformation Today!</h2>
              <p style="margin-bottom: 5px;">Contact us now:</p>
              <p style="font-weight: bold; margin-top: 5px;">Phone/WhatsApp: +44 7572 445856</p>
              <p style="font-weight: bold; margin-top: 5px;">Website: mydentalfly.com</p>
            </div>
          </div>
          
          <div style="margin-top: 100px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            <p>Page 5</p>
            <p>www.mydentalfly.com | info@mydentalfly.com</p>
          </div>
        </div>
      `;
      
      // Set up options for html2pdf
      const options = {
        margin: 10,
        filename: `MyDentalFly_Quote_${patientName.split(' ')[0]}_${formattedDate.replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
      };
      
      console.log("Starting enhanced PDF generation with html2pdf.js");
      
      // Generate PDF
      html2pdf().from(element).set(options).save().then(() => {
        console.log("Enhanced PDF saved successfully");
        
        toast({
          title: "PDF Quote Generated",
          description: "Your comprehensive quote has been successfully generated and downloaded.",
        });
        
        // Call the onComplete callback if provided
        if (onComplete) {
          onComplete();
        }
        
        setIsLoading(false);
      });
      
    } catch (error) {
      console.error("Error generating enhanced PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your enhanced PDF: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={generatePdf} 
      disabled={isLoading}
      className={className}
      variant="default"
    >
      <FileCheck className="mr-2 h-4 w-4" />
      {isLoading ? 'Generating...' : buttonText}
    </Button>
  );
};

// Helper function to get treatment descriptions
function getTreatmentDescription(treatmentName: string): string {
  const descriptions: {[key: string]: string} = {
    'Dental Implant': 'Dental implants are titanium posts surgically placed into the jawbone beneath your gums to provide a stable foundation for artificial teeth.',
    'Dental Veneers': 'Dental veneers are thin, custom-made shells designed to cover the front surface of teeth, improving appearance. They provide a natural look with excellent durability and stain resistance.',
    'Porcelain Crown': 'Porcelain crowns are tooth-shaped caps placed over a damaged tooth to restore its shape, size, strength, and appearance.',
    'Teeth Whitening': 'Professional teeth whitening uses medical-grade bleaching agents to safely remove stains and discoloration, providing a brighter, more youthful smile in just one session.',
    'Root Canal': 'Root canal treatment is designed to eliminate bacteria from the infected root canal, prevent reinfection of the tooth and save the natural tooth.',
    'Dental Bridge': 'A dental bridge is used to bridge the gap created by one or more missing teeth, restoring your smile and ability to properly chew and speak.',
    'Composite Filling': 'Composite fillings are tooth-colored resins used to repair decayed, chipped, fractured, or discolored teeth.',
    'Dental Examination': 'A comprehensive dental examination to assess your oral health and create a personalized treatment plan.',
    'Dental Cleaning': 'Professional cleaning to remove plaque and tartar from teeth, maintaining good oral hygiene and preventing gum disease.'
  };
  
  // Find the matching description or return a generic one
  for (const key in descriptions) {
    if (treatmentName.includes(key)) {
      return descriptions[key];
    }
  }
  
  return 'Advanced dental treatment designed to improve your oral health and enhance your smile with the highest quality materials and techniques.';
}

export default EnhancedPdfGenerator;