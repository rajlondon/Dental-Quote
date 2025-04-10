import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PdfGenerator from "./PdfGenerator";
import JourneyPdf from "./JourneyPdf";
import JSPDFGenerator from "./JSPDFGenerator";

// Define interface for clinic comparison
interface ClinicComparison {
  name: string;
  priceGBP: number;
  extras: string;
  guarantee?: string;
  location?: string;
  rating?: string;
}
import TemplatePdfGenerator from "./TemplatePdfGenerator";
import ServerPdfGenerator from "./ServerPdfGenerator";
import PythonPdfGenerator from "./PythonPdfGenerator";
import jsPDF from "jspdf";
import { sendCustomerQuoteEmail } from '@/utils/emailjs';
import {
  TreatmentPrice,
  getAllTreatments,
  getTreatmentByName,
  calculateTotal,
  initializePrices,
} from '@/services/pricingService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { getCities, getCitiesGroupedByCountry, months, getDefaultFlightEstimate } from '@/services/flightEstimatesService';

// Function to format treatment names to be more user-friendly
const formatTreatmentName = (name: string): string => {
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

// List of complex treatments that need info icons
const complexTreatments = [
  'Zirconium', 'E-Max', 'Metal-Ceramic', 'Laminate', 'Curettage', 
  'Gingivectomy', 'Frenectomy', 'Sinus Lift', 'Tomography', 'Implant',
  'Invisalign', 'Ceramic', 'CEREC', 'Lumineers', 'Inlay', 'Onlay'
];

// Get tooltip description for a complex treatment term
const getTooltipForTerm = (term: string): string => {
  const descriptions: Record<string, string> = {
    'Zirconium': 'High-strength ceramic material known for durability and aesthetics',
    'E-Max': 'All-ceramic material combining excellent aesthetics with good strength',
    'Metal-Ceramic': 'Traditional crown with metal base and porcelain exterior for strength and appearance',
    'Laminate': 'Thin shells bonded to front of teeth for cosmetic enhancement',
    'Curettage': 'Procedure to remove damaged tissue from gum pockets',
    'Gingivectomy': 'Surgical removal of gum tissue to treat gum disease or reshape gums',
    'Frenectomy': 'Procedure to remove or modify connective tissue in mouth',
    'Sinus Lift': 'Bone augmentation procedure to add bone to upper jaw for implant placement',
    'Tomography': 'Advanced 3D imaging technique for precise diagnosis',
    'Implant': 'Artificial tooth root that supports replacement teeth',
    'Invisalign': 'Clear, removable aligners that gradually straighten teeth',
    'Ceramic': 'Tooth-colored material used for crowns, veneers and restorations',
    'CEREC': 'Same-day computer-aided design and manufacturing of restorations',
    'Lumineers': 'Ultra-thin veneers that require minimal tooth preparation',
    'Inlay': 'Custom filling fitted inside the cusps of a damaged tooth',
    'Onlay': 'Restoration covering one or more cusps of a damaged tooth'
  };
  
  return descriptions[term] || 'Advanced dental treatment option';
};

// Check if a treatment name contains complex terms that need info icons
const hasComplexTerms = (name: string): boolean => {
  return complexTreatments.some(term => name.includes(term));
};

// Custom InfoIcon component for consistent styling across all tooltips
const InfoIcon = ({ 
  tooltipContent, 
  position = "right",
  size = "small",
  tooltipWidth = "64"
}: { 
  tooltipContent: string; 
  position?: "left" | "right"; 
  size?: "small" | "medium";
  tooltipWidth?: "64" | "72"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`relative inline-block ${size === "small" ? "ml-1" : "ml-2"}`}>
      <button 
        className="bg-white rounded-full flex items-center justify-center cursor-help"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        style={{ 
          border: '1px solid #007B9E', 
          width: size === "small" ? '16px' : '18px', 
          height: size === "small" ? '16px' : '18px',
          backgroundColor: '#fff'
        }}
      >
        <span className="text-primary" style={{ 
          fontSize: size === "small" ? '10px' : '12px', 
          fontWeight: 'bold' 
        }}>i</span>
      </button>
      
      {isOpen && (
        <div 
          className={`absolute z-50 p-3 bg-white rounded-md shadow-lg border border-neutral-200 w-${tooltipWidth} ${position === "left" ? "left-0 top-5" : "right-0 top-6"}`}
          style={{ 
            wordBreak: 'break-word', 
            backgroundColor: 'white', 
            opacity: 1,
            minHeight: '40px',
            display: 'block',
            visibility: 'visible'
          }}
        >
          <p className="text-xs">{tooltipContent || "More information about this item."}</p>
        </div>
      )}
    </div>
  );
};

// Custom tooltip component for dental term explanations
const DentalTermTooltip = ({ treatment }: { treatment: string }) => {
  // Get tooltip content
  let tooltipContent = complexTreatments
    .filter(term => treatment.includes(term))
    .map(term => getTooltipForTerm(term))
    .join('. ');
  
  // Ensure we always have some content
  if (!tooltipContent || tooltipContent.length < 10) {
    tooltipContent = "Information about " + treatment + ". Contact us for more details.";
  }
  
  return (
    <InfoIcon tooltipContent={tooltipContent} position="right" tooltipWidth="72" />
  );
};

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .min(7, 'Please enter a valid phone number')
    .refine((val) => /^[+]?[0-9\s-()]+$/.test(val), {
      message: 'Please enter a valid phone number format',
    }),
  travelMonth: z.string().optional(),
  departureCity: z.string().optional(),
  treatments: z.array(
    z.object({
      treatment: z.string().min(1, 'Please select a treatment'),
      quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Please add at least one treatment'),
  xrayFiles: z.instanceof(FileList).optional().transform(val => val || null),
  // New fields
  journeyMode: z.enum(['concierge', 'clinic']).default('concierge'),
  londonConsult: z.enum(['yes', 'no']).default('no'),
  replacingExisting: z.enum(['yes', 'no', 'not-sure']).default('not-sure'),
  preferredBrands: z.enum(['no_preference', 'premium_eu', 'premium_usa', 'premium_korea', 'guide_me']).default('no_preference'),
  budgetRange: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PriceCalculator() {
  const { t } = useTranslation();
  const [selectedClinic, setSelectedClinic] = useState<number>(1); // Default to middle clinic (best value)
  const { toast } = useToast();
  const [treatments, setTreatments] = useState<TreatmentPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [quote, setQuote] = useState<ReturnType<typeof calculateTotal> | null>(null);
  const quoteResultRef = useRef<HTMLDivElement>(null); // Reference to quote result section
  
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      travelMonth: 'July', // Set a default month
      departureCity: 'London', // Set a default city
      treatments: [{ treatment: '', quantity: 1 }],
      xrayFiles: undefined,
      // New fields with defaults
      journeyMode: 'concierge',
      londonConsult: 'no',
      replacingExisting: 'not-sure',
      preferredBrands: 'no_preference',
      budgetRange: '',
    },
  });
  
  // Load treatments from CSV when component mounts
  useEffect(() => {
    const loadTreatments = async () => {
      try {
        await initializePrices();
        setTreatments(getAllTreatments());
        setLoading(false);
      } catch (error) {
        console.error('Failed to load treatments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load treatment data. Please try again later.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    loadTreatments();
  }, [toast]);
  
  // Function to add a new treatment field
  const addTreatment = () => {
    const currentTreatments = form.getValues('treatments');
    form.setValue('treatments', [...currentTreatments, { treatment: '', quantity: 1 }]);
  };
  
  // Function to remove a treatment field
  const removeTreatment = (index: number) => {
    const currentTreatments = form.getValues('treatments');
    if (currentTreatments.length > 1) {
      form.setValue(
        'treatments',
        currentTreatments.filter((_, i) => i !== index)
      );
    }
  };
  
  // State to store the currently selected treatment for displaying details
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentPrice | null>(null);
  
  // Function to show treatment details
  const showTreatmentDetails = (treatmentName: string) => {
    const treatment = getTreatmentByName(treatmentName);
    setSelectedTreatment(treatment || null);
  };
  
  // State to track if X-rays have been uploaded
  const [hasXrays, setHasXrays] = useState<boolean>(false);
  
  // State to store uploaded X-ray files
  const [uploadedXrayFiles, setUploadedXrayFiles] = useState<Array<{
    filename: string;
    originalname: string;
    path: string;
    size: number;
    mimetype: string;
  }>>([]);
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    // Get the travel info for flight cost calculations
    const travelMonth = data.travelMonth || 'July';
    const departureCity = data.departureCity || 'London';
    
    // Calculate the total prices including flight costs and London consultation if selected
    const quoteResult = calculateTotal(
      data.treatments, 
      { city: departureCity, month: travelMonth },
      { londonConsult: data.londonConsult as 'yes' | 'no' }
    );
    
    // Store the quote data with user information in state
    setQuote(quoteResult);
    
    // Check if X-rays were uploaded
    const xrayStatus = data.xrayFiles && data.xrayFiles.length > 0;
    setHasXrays(!!xrayStatus);
    
    // Enhanced logging with additional travel info details
    console.log('Form submission data:', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      travelMonth,
      departureCity,
      treatmentsCount: data.treatments.length,
      hasXrays: !!xrayStatus,
      hasFlightCost: quoteResult.hasFlightCost,
      flightCostGBP: quoteResult.flightCostGBP
    });
    
    // Pass the extra data to the PDF generator when needed
    // This avoids modifying the original quoteResult which has its own type
    const patientData = {
      patientName: data.name,
      patientEmail: data.email,
      patientPhone: data.phone
    };
    
    // Handle X-ray file uploads - upload to the server
    let xrayFileNames: string[] = [];
    let uploadedXrayFiles: Array<{
      filename: string;
      originalname: string;
      path: string;
      size: number;
      mimetype: string;
    }> = [];
    
    if (data.xrayFiles && data.xrayFiles.length > 0) {
      // Get file names for record keeping
      xrayFileNames = Array.from(data.xrayFiles).map(file => file.name);
      
      try {
        // Create FormData object for file upload
        const formData = new FormData();
        Array.from(data.xrayFiles).forEach(file => {
          formData.append('xrays', file);
        });
        
        // Show loading toast
        toast({
          title: 'Uploading X-rays',
          description: 'Please wait while we upload your files...',
        });
        
        // Upload the files to the server
        const uploadResponse = await axios.post('/api/upload-xrays', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadResponse.data.success) {
          uploadedXrayFiles = uploadResponse.data.files;
          // Also update the state variable for use later
          setUploadedXrayFiles(uploadResponse.data.files);
          
          // Show success message for file upload
          toast({
            title: 'X-rays Uploaded Successfully',
            description: `${xrayFileNames.length} file(s) will be reviewed by our dental team.`,
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error uploading X-ray files:', error);
        
        // Show error message
        toast({
          title: 'Upload Failed',
          description: 'There was a problem uploading your X-ray files. You can proceed with your quote and send X-rays later.',
          variant: 'destructive',
        });
      }
    }
    
    // Record the submission for personalized follow-up
    try {
      // Store quote data in localStorage for potential follow-up
      localStorage.setItem('lastQuoteData', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...patientData,
        treatments: data.treatments,
        travelMonth: data.travelMonth,
        departureCity: data.departureCity,
        totalGBP: quoteResult.totalGBP,
        totalUSD: quoteResult.totalUSD,
        hasXrays: xrayStatus,
        xrayFileNames: xrayFileNames
      }));
      
      // Prepare notification data for the server
      const notificationData = {
        items: quoteResult.items,
        totalGBP: quoteResult.totalGBP,
        totalUSD: quoteResult.totalUSD,
        patientName: data.name,
        patientEmail: data.email,
        patientPhone: data.phone,
        travelMonth: data.travelMonth || 'July', // Use explicit default
        departureCity: data.departureCity || 'London', // Use explicit default
        hasXrays: xrayStatus,
        xrayCount: xrayFileNames.length,
        xrayFiles: uploadedXrayFiles.length > 0 ? uploadedXrayFiles : undefined,
        // Include new fields
        journeyMode: data.journeyMode,
        londonConsult: data.londonConsult,
        replacingExisting: data.replacingExisting,
        preferredBrands: data.preferredBrands,
        budgetRange: data.budgetRange || ''
      };
      
      // Send notification to server - don't await or handle errors to avoid blocking UI
      // This is fire-and-forget style to ensure the user experience isn't affected
      axios.post('/api/notify-quote-calculation', notificationData)
        .then(response => {
          console.log('Quote calculation notification sent:', response.data);
        })
        .catch(error => {
          console.error('Failed to send quote calculation notification:', error);
          // Don't show an error toast since this is a background operation
        });
        
    } catch (error) {
      console.error('Failed to save quote data for follow-up:', error);
    }
    
    // Store quote data in localStorage for the results page
    try {
      const quoteResultsData = {
        items: quoteResult.items,
        totalGBP: quoteResult.totalGBP,
        totalUSD: quoteResult.totalUSD,
        patientName: data.name,
        patientEmail: data.email,
        patientPhone: data.phone,
        travelMonth: data.travelMonth,
        departureCity: data.departureCity,
        flightCostGBP: quoteResult.flightCostGBP,
        flightCostUSD: quoteResult.flightCostUSD,
        hasLondonConsult: data.londonConsult === 'yes',
        londonConsultCostGBP: 150,
        londonConsultCostUSD: 195,
        selectedClinicIndex: 1, // Default to mid-tier
      };
      
      // Save to localStorage for the results page to use
      localStorage.setItem('quoteData', JSON.stringify(quoteResultsData));
      
      // Show toast and redirect to results page
      toast({
        title: 'Quote Generated',
        description: 'Redirecting you to your detailed quote results.',
      });
      
      // Redirect to the results page after a short delay
      setTimeout(() => {
        window.location.href = '/your-quote';
      }, 1000);
    } catch (error) {
      console.error('Error preparing quote results:', error);
      
      // Fallback to original behavior if there's an error
      toast({
        title: 'Quote Generated',
        description: 'Your quote has been calculated successfully.',
      });
      
      // Scroll to the quote section as fallback
      setTimeout(() => {
        if (quoteResultRef.current) {
          quoteResultRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  };
  
  // HTML Quote dialog state
  const [showHtmlQuote, setShowHtmlQuote] = useState<boolean>(false);
  const [htmlQuoteData, setHtmlQuoteData] = useState<any>(null);
  
  // Function to download quote as PDF
  const downloadQuotePDF = () => {
    try {
      // Display a toast notification about the download starting
      toast({
        title: 'Generating PDF',
        description: 'Your quote is being prepared, please wait...',
        variant: 'default',
      });
      
      // Determine which quote data to use
      let quoteData;
      let selectedClinicIdx = 0;
      let clinics = [];
      
      // Check if we're in the main calculator view
      if (quote && quote.items.length > 0) {
        console.log('JSPDFGenerator travel info:', {
          travelMonth: form.getValues('travelMonth'),
          departureCity: form.getValues('departureCity')
        });
        
        // Define all clinics and their price factors based on new tiers
        const allClinics = [
          {
            name: "Istanbul Dental Care",
            priceGBP: Math.round(quote.totalGBP * 0.80),
            extras: "Simple procedures & budget-focused travel",
            guarantee: "3 Years",
            location: "Affordable",
            rating: "⭐⭐⭐⭐"
          },
          {
            name: "DentGroup Istanbul",
            priceGBP: Math.round(quote.totalGBP * 0.90),
            extras: "Balanced budget + comfort with aftercare support",
            guarantee: "5 Years",
            location: "Mid-Tier",
            rating: "⭐⭐⭐⭐½"
          },
          {
            name: "Vera Smile",
            priceGBP: Math.round(quote.totalGBP * 1.00),
            extras: "VIP clients, faster results, luxury environment",
            guarantee: "10 Years",
            location: "Premium",
            rating: "⭐⭐⭐⭐⭐"
          }
        ];
        
        // Get the selected clinic's total price
        const clinicPriceFactors = [0.80, 0.90, 1.00]; // Price factors for each clinic (Affordable, Mid-Tier, Premium)
        const selectedFactor = clinicPriceFactors[selectedClinic];
        const selectedClinicTotalGBP = Math.round(quote.totalGBP * selectedFactor);
        const selectedClinicTotalUSD = Math.round(quote.totalUSD * selectedFactor);
        
        // Reorder clinics with selected clinic first
        const orderedClinics = [
          allClinics[selectedClinic],  // Put selected clinic first
          ...allClinics.filter((_, idx) => idx !== selectedClinic) // Add the others
        ];
        
        quoteData = {
          items: quote.items,
          totalGBP: selectedClinicTotalGBP,
          totalUSD: selectedClinicTotalUSD,
          patientName: form.getValues('name'),
          patientEmail: form.getValues('email'),
          patientPhone: form.getValues('phone'),
          travelMonth: form.getValues('travelMonth') || 'year-round',
          departureCity: form.getValues('departureCity') || 'UK',
          clinics: orderedClinics,
          hasXrays: hasXrays,
          xrayCount: form.getValues('xrayFiles')?.length || 0,
          selectedClinicIndex: selectedClinic,
          xrayFiles: uploadedXrayFiles.length > 0 ? uploadedXrayFiles : undefined,
          // Include additional information
          journeyMode: form.getValues('journeyMode'),
          londonConsult: form.getValues('londonConsult'),
          replacingExisting: form.getValues('replacingExisting'),
          preferredBrands: form.getValues('preferredBrands'),
          budgetRange: form.getValues('budgetRange') || ''
        };
      } 
      // Or we're in the dialog view
      else if (htmlQuoteData) {
        console.log('Quote dialog travel info:', {
          travelMonth: htmlQuoteData.travelMonth,
          departureCity: htmlQuoteData.departureCity
        });
        
        quoteData = {
          items: htmlQuoteData.items,
          totalGBP: htmlQuoteData.totalGBP,
          totalUSD: htmlQuoteData.totalUSD,
          patientName: htmlQuoteData.patientName,
          patientEmail: htmlQuoteData.patientEmail,
          patientPhone: htmlQuoteData.patientPhone,
          travelMonth: htmlQuoteData.travelMonth || 'year-round',
          departureCity: htmlQuoteData.departureCity || 'UK',
          clinics: [
            {
              name: "Istanbul Dental Care",
              priceGBP: Math.round(htmlQuoteData.totalGBP * 0.80),
              extras: "Simple procedures & budget-focused travel",
              guarantee: "3 Years",
              location: "Affordable",
              rating: "⭐⭐⭐⭐"
            },
            {
              name: "DentGroup Istanbul",
              priceGBP: Math.round(htmlQuoteData.totalGBP * 0.90),
              extras: "Balanced budget + comfort with aftercare support",
              guarantee: "5 Years",
              location: "Mid-Tier",
              rating: "⭐⭐⭐⭐½"
            },
            {
              name: "Vera Smile",
              priceGBP: Math.round(htmlQuoteData.totalGBP * 1.00),
              extras: "VIP clients, faster results, luxury environment",
              guarantee: "10 Years",
              location: "Premium",
              rating: "⭐⭐⭐⭐⭐"
            }
          ],
          hasXrays: htmlQuoteData.hasXrays,
          xrayCount: htmlQuoteData.xrayCount
        };
      } else {
        toast({
          title: 'Error',
          description: 'No quote data available. Please generate a quote first.',
          variant: 'destructive'
        });
        return;
      }
      
      // Display a toast notification about the email being sent if email is provided
      if (quoteData.patientEmail) {
        setTimeout(() => {
          toast({
            title: 'Email Confirmation',
            description: 'We\'ll also email you a copy of your quote 📧',
            variant: 'default',
          });
        }, 2000); // Show this toast 2 seconds after clicking
      }
      
      // Call the server-side jsPDF endpoint
      console.log('Sending PDF request to server with data:', {
        patientName: quoteData.patientName,
        travelMonth: quoteData.travelMonth,
        departureCity: quoteData.departureCity,
        itemCount: quoteData.items.length
      });
      
      // Open a new window/tab for direct download instead of using axios
      // This works more reliably in production environments
      setGeneratingPdf(true);
      
      // Prepare URL parameters with quote data
      try {
        // Format current date for filename
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, '');
        const sanitizedName = (quoteData.patientName || 'unnamed')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 20);
        
        // Create the form for direct post to the server
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/direct-download-pdf';
        form.target = '_blank'; // Open in new window/tab
        form.style.display = 'none';
        
        // Add the quote data as a hidden input
        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'quoteData';
        dataInput.value = JSON.stringify(quoteData);
        form.appendChild(dataInput);
        
        // Add the filename as a hidden input
        const filenameInput = document.createElement('input');
        filenameInput.type = 'hidden';
        filenameInput.name = 'filename';
        filenameInput.value = `IstanbulDentalSmile_Quote_${formattedDate}_${sanitizedName}.pdf`;
        form.appendChild(filenameInput);
        
        // Add timestamp to bust cache
        const timestampInput = document.createElement('input');
        timestampInput.type = 'hidden';
        timestampInput.name = 't';
        timestampInput.value = Date.now().toString();
        form.appendChild(timestampInput);
        
        // Append form to body and submit it
        document.body.appendChild(form);
        
        // Wait a moment then submit the form
        setTimeout(() => {
          form.submit();
          
          // Clean up the form after submission
          setTimeout(() => {
            document.body.removeChild(form);
            setGeneratingPdf(false);
            
            // Show success message
            toast({
              title: 'Success',
              description: 'Your quote PDF should open in a new tab. If not, please check your popup blocker settings.',
              variant: 'default',
            });
          }, 1000);
        }, 200);
      }
      catch(error) {
        console.error('Error downloading PDF:', error);
        setGeneratingPdf(false);
        toast({
          title: 'PDF Download Issue',
          description: 'PDF download failed. Please check your email for a copy, or try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'PDF Download Issue',
        description: (
          <div>
            <p>PDF download failed. Please try the alternative options below:</p>
            <a 
              href="/pdf-download-help.html" 
              target="_blank" 
              className="underline text-blue-500 font-medium hover:text-blue-700"
            >
              View alternative download options
            </a>
          </div>
        ),
        variant: 'destructive',
      });
    }
  };
  
  // Helper function to prepare and show HTML quote
  const openHtmlQuote = () => {
    try {
      const quoteData = form.getValues();
      const travelMonth = quoteData.travelMonth || 'July';
      const departureCity = quoteData.departureCity || 'London';
      
      // Calculate total with flight costs and London consultation if selected
      const calculatedQuote = calculateTotal(
        quoteData.treatments,
        { city: departureCity, month: travelMonth },
        { londonConsult: quoteData.londonConsult as 'yes' | 'no' }
      );
      
      const quoteItems = calculatedQuote.items;
      
      // Get the current date for the quote number
      const today = new Date();
      const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const quoteNumber = `IDS-${datePart}-${randomPart}`;
      
      // Format date appropriately
      const date = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Store quote data in state for the dialog
      // Log the travel data for debugging
      console.log('HTML Quote preparation data:', {
        travelMonth,
        departureCity,
        hasFlightCost: calculatedQuote.hasFlightCost,
        flightCostGBP: calculatedQuote.flightCostGBP
      });
      
      setHtmlQuoteData({
        quoteNumber,
        date,
        patientName: quoteData.name,
        patientEmail: quoteData.email,
        patientPhone: quoteData.phone,
        items: quoteItems, // This now includes the flight cost as a line item
        totalGBP: calculatedQuote.totalGBP, // This now includes the flight cost in the total
        totalUSD: calculatedQuote.totalUSD, // This now includes the flight cost in the total
        travelMonth,
        departureCity,
        hasFlightCost: calculatedQuote.hasFlightCost,
        flightCostGBP: calculatedQuote.flightCostGBP,
        flightCostUSD: calculatedQuote.flightCostUSD,
        hasXrays: hasXrays,
        xrayCount: hasXrays && quoteData.xrayFiles ? quoteData.xrayFiles.length : 0,
        // Include new fields
        journeyMode: quoteData.journeyMode,
        londonConsult: quoteData.londonConsult,
        replacingExisting: quoteData.replacingExisting,
        preferredBrands: quoteData.preferredBrands,
        budgetRange: quoteData.budgetRange || ''
      });
      
      // Show the dialog
      setShowHtmlQuote(true);
    } catch (error) {
      console.error('Error preparing HTML quote:', error);
      toast({
        title: 'Error',
        description: 'Could not prepare the HTML quote. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <section className="py-16 bg-gradient-to-b from-neutral-50 to-white price-calculator-section">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary relative inline-block">
              {t('pricing.calculate_price')}
              <span className="absolute -top-4 -right-12 bg-secondary/20 text-secondary-foreground text-xs px-2 py-1 rounded-full rotate-3">
                FREE
              </span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Calculate the exact cost of your dental treatment in Istanbul and receive a detailed quote that you can download instantly.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                <p className="text-neutral-600">Loading treatment options...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Add a highlight effect around the form */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl blur-lg -z-10 animate-pulse"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg p-6 md:p-8 border border-neutral-200">
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-primary mb-2">{t('pricing.treatment_selection')}</h3>
                    <p className="text-neutral-600">{t('pricing.select_treatments_description')}</p>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-primary">{t('pricing.treatments')}</h3>
                          </div>
                          
                          {/* How to Build Your Quote Guide */}
                          <div className="bg-white rounded-lg p-4 mb-4 border border-neutral-200">
                            <h4 className="font-semibold text-primary mb-2">How to Build Your Quote</h4>
                            <div className="space-y-3 text-sm">
                              <ol className="list-decimal pl-5 space-y-1 text-neutral-700">
                                <li>Select each dental treatment you need from the dropdown menu</li>
                                <li>Enter the quantity (number of teeth) for each treatment</li>
                                <li>Add multiple treatments if needed using the "Add Treatment" button</li>
                                <li>Fill in your contact and travel information</li>
                              </ol>
                              
                              <div className="bg-primary/5 p-3 rounded mt-2">
                                <h5 className="font-medium text-primary mb-1">Important Notes:</h5>
                                <ul className="list-disc pl-5 space-y-1 text-neutral-600 text-xs">
                                  <li><span className="font-medium">Sinus lifting</span> can only be determined after examining dental X-rays/CT scans</li>
                                  <li>If you have recent X-rays or CT scans, please send these after receiving your quote</li>
                                  <li>For dental implants, please specify quantity and brand (if you have a preference)</li>
                                  <li>For crowns, veneers, and other treatments, please indicate quantity needed</li>
                                  <li>Our dental team will help finalize your treatment plan during your consultation</li>
                                </ul>
                                <p className="mt-2 text-xs text-neutral-600">
                                  To ensure your quote is as accurate as possible, you can upload recent X-rays or CT scans. Our partner clinics will review them and confirm with you if any adjustments are needed. Your quote will be updated before you travel, so you always know what to expect.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {form.watch('treatments').map((_, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start bg-white p-3 rounded-lg mb-3 border border-neutral-200 shadow-sm">
                              <div className="flex-1 w-full">
                                <FormField
                                  control={form.control}
                                  name={`treatments.${index}.treatment`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex flex-wrap items-center">
                                        <FormLabel className="text-neutral-700 mr-2">{t('pricing.treatment_type')}</FormLabel>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-neutral-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                              <p className="text-xs">Select your required dental treatment from the dropdown. We offer a wide range of procedures including implants, veneers, crowns, and more. Each has different options and pricing.</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                      <Select
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          showTreatmentDetails(value);
                                        }}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="bg-white">
                                            <SelectValue placeholder={t('pricing.select_treatment')} />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          
                                          {/* IMPLANTS SECTION */}
                                          <div className="px-2 py-2 text-sm font-bold text-white select-none mt-2 bg-[#007B9E] rounded-sm">
                                            Implants
                                          </div>
                                          {treatments
                                            .filter(treatment => 
                                              treatment.treatment && 
                                              (treatment.category === 'IMPLANTS' || 
                                              (treatment.treatment.toLowerCase().includes('implant') && 
                                               !treatment.treatment.toLowerCase().includes('prothesis'))) &&
                                              treatment.treatment.trim() !== ''
                                            )
                                            .map((treatment, idx) => (
                                              <SelectItem key={`implants-${treatment.treatment}`} value={treatment.treatment}>
                                                <div className="flex items-center">
                                                  <span>{formatTreatmentName(treatment.treatment)}</span>
                                                  {hasComplexTerms(treatment.treatment) && <DentalTermTooltip treatment={treatment.treatment} />}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          
                                          {/* CROWNS SECTION */}
                                          <div className="px-2 py-2 text-sm font-bold text-white select-none mt-3 bg-[#007B9E] rounded-sm">
                                            Crowns
                                          </div>
                                          {treatments
                                            .filter(treatment => 
                                              treatment.treatment && 
                                              (treatment.category === 'CROWNS' ||
                                               treatment.treatment.toLowerCase().includes('crown')) &&
                                              !treatment.treatment.toLowerCase().includes('package') &&
                                              treatment.treatment.trim() !== ''
                                            )
                                            .map((treatment, idx) => (
                                              <SelectItem key={`crowns-${treatment.treatment}`} value={treatment.treatment}>
                                                <div className="flex items-center">
                                                  <span>{formatTreatmentName(treatment.treatment)}</span>
                                                  {hasComplexTerms(treatment.treatment) && <DentalTermTooltip treatment={treatment.treatment} />}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          
                                          {/* VENEERS SECTION */}
                                          <div className="px-2 py-2 text-sm font-bold text-white select-none mt-3 bg-[#007B9E] rounded-sm">
                                            Veneers
                                          </div>
                                          {treatments
                                            .filter(treatment => 
                                              treatment.treatment && 
                                              (treatment.category === 'VENEERS' ||
                                               treatment.treatment.toLowerCase().includes('veneer') ||
                                               treatment.treatment.includes('Lumineers')) &&
                                              !treatment.treatment.toLowerCase().includes('package') &&
                                              treatment.treatment.trim() !== ''
                                            )
                                            .map((treatment, idx) => (
                                              <SelectItem key={`veneers-${treatment.treatment}`} value={treatment.treatment}>
                                                <div className="flex items-center">
                                                  <span>{formatTreatmentName(treatment.treatment)}</span>
                                                  {hasComplexTerms(treatment.treatment) && <DentalTermTooltip treatment={treatment.treatment} />}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          
                                          {/* GENERAL DENTAL PROCEDURES */}
                                          <div className="px-2 py-2 text-sm font-bold text-white select-none mt-3 bg-[#007B9E] rounded-sm">
                                            General Dental Procedures
                                          </div>
                                          {treatments
                                            .filter(treatment => 
                                              treatment.treatment && 
                                              (treatment.category === 'GENERAL' || 
                                               treatment.treatment.includes('Root Canal') ||
                                               treatment.treatment.includes('Extraction') ||
                                               treatment.treatment.includes('Filling') ||
                                               treatment.treatment.includes('Cleaning') ||
                                               treatment.treatment.includes('Whitening') ||
                                               treatment.treatment.includes('Tomography') ||
                                               treatment.treatment.includes('Curettage') ||
                                               treatment.treatment.includes('Gingivectomy') ||
                                               treatment.treatment.includes('Gum flap') ||
                                               treatment.treatment.includes('Frenectomy') ||
                                               treatment.treatment.includes('Post')) &&
                                              !treatment.treatment.toLowerCase().includes('denture') &&
                                              !treatment.treatment.toLowerCase().includes('prothesis') &&
                                              !treatment.treatment.toLowerCase().includes('package') &&
                                              !treatment.treatment.toLowerCase().includes('implant') &&
                                              !treatment.treatment.toLowerCase().includes('crown') &&
                                              !treatment.treatment.toLowerCase().includes('veneer') &&
                                              !treatment.treatment.toLowerCase().includes('braces') &&
                                              treatment.treatment.trim() !== ''
                                            )
                                            .map((treatment, idx) => (
                                              <SelectItem key={`general-${treatment.treatment}`} value={treatment.treatment}>
                                                <div className="flex items-center">
                                                  <span>{formatTreatmentName(treatment.treatment)}</span>
                                                  {hasComplexTerms(treatment.treatment) && <DentalTermTooltip treatment={treatment.treatment} />}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          
                                          {/* DENTURES & INVISALIGN/ORTHODONTIC */}
                                          <div className="px-2 py-2 text-sm font-bold text-white select-none mt-3 bg-[#007B9E] rounded-sm">
                                            Dentures & Orthodontics
                                          </div>
                                          {treatments
                                            .filter(treatment => 
                                              treatment.treatment && 
                                              (treatment.category === 'DENTURES' || 
                                               treatment.category === 'ORTHODONTIC' ||
                                               treatment.treatment.toLowerCase().includes('denture') ||
                                               treatment.treatment.toLowerCase().includes('prothesis') ||
                                               treatment.treatment.includes('Invisalign') ||
                                               treatment.treatment.toLowerCase().includes('braces')) &&
                                              !treatment.treatment.toLowerCase().includes('package') &&
                                              treatment.treatment.trim() !== ''
                                            )
                                            .map((treatment, idx) => (
                                              <SelectItem key={`dentures-${treatment.treatment}`} value={treatment.treatment}>
                                                <div className="flex items-center">
                                                  <span>{formatTreatmentName(treatment.treatment)}</span>
                                                  {hasComplexTerms(treatment.treatment) && <DentalTermTooltip treatment={treatment.treatment} />}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          
                                          {/* PACKAGES */}
                                          <div className="px-2 py-2 text-sm font-bold text-white select-none mt-3 bg-[#007B9E] rounded-sm">
                                            Packages
                                          </div>
                                          {treatments
                                            .filter(treatment => 
                                              treatment.treatment && 
                                              (treatment.category === 'PACKAGES' || 
                                               treatment.treatment.toLowerCase().includes('package') ||
                                               (treatment.treatment.includes('Smile') && !treatment.treatment.toLowerCase().includes('veneer'))) &&
                                              treatment.treatment.trim() !== ''
                                            )
                                            .map((treatment, idx) => (
                                              <SelectItem key={`packages-${treatment.treatment}`} value={treatment.treatment}>
                                                <div className="flex items-center">
                                                  <span>{formatTreatmentName(treatment.treatment)}</span>
                                                  {hasComplexTerms(treatment.treatment) && <DentalTermTooltip treatment={treatment.treatment} />}
                                                </div>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                      
                                      {/* Show info button if a treatment is selected */}
                                      {field.value && (
                                        <div className="mt-1">
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="text-xs px-2 py-1 h-auto mt-1 text-primary border-primary/30 hover:bg-primary/5"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Treatment Details
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-0">
                                              {(() => {
                                                const treatmentDetails = getTreatmentByName(field.value);
                                                if (!treatmentDetails) return null;
                                                
                                                return (
                                                  <div className="p-4 space-y-3">
                                                    <h4 className="font-semibold text-primary text-lg">
                                                      {formatTreatmentName(treatmentDetails.treatment)}
                                                    </h4>
                                                    
                                                    {treatmentDetails.description && (
                                                      <p className="text-sm text-neutral-600">
                                                        {treatmentDetails.description}
                                                      </p>
                                                    )}
                                                    
                                                    {treatmentDetails.benefits && treatmentDetails.benefits.length > 0 && (
                                                      <div className="space-y-1">
                                                        <h5 className="text-sm font-medium text-primary">Benefits:</h5>
                                                        <ul className="text-xs text-neutral-600 space-y-1 pl-5 list-disc">
                                                          {treatmentDetails.benefits.map((benefit, idx) => (
                                                            <li key={idx}>{benefit}</li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                      {treatmentDetails.duration && (
                                                        <div>
                                                          <span className="font-semibold text-primary">Treatment time:</span>
                                                          <p className="text-neutral-600">{treatmentDetails.duration}</p>
                                                        </div>
                                                      )}
                                                      
                                                      {treatmentDetails.recovery && (
                                                        <div>
                                                          <span className="font-semibold text-primary">Recovery:</span>
                                                          <p className="text-neutral-600">{treatmentDetails.recovery}</p>
                                                        </div>
                                                      )}
                                                    </div>
                                                    
                                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-primary/5 p-2 rounded">
                                                      <div>
                                                        <span className="font-semibold text-primary">Price:</span>
                                                        <p className="text-neutral-600">£{treatmentDetails.priceGBP.toLocaleString()} / ${treatmentDetails.priceUSD.toLocaleString()}</p>
                                                      </div>
                                                      
                                                      <div>
                                                        <span className="font-semibold text-primary">Guarantee:</span>
                                                        <p className="text-neutral-600">{treatmentDetails.guarantee}</p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })()}
                                            </PopoverContent>
                                          </Popover>
                                        </div>
                                      )}
                                      
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="w-full sm:w-28">
                                <FormField
                                  control={form.control}
                                  name={`treatments.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex flex-wrap items-center">
                                        <FormLabel className="text-neutral-700 mr-2">{t('pricing.quantity')}</FormLabel>
                                        <div className="relative inline-block">
                                          <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="h-4 w-4 ml-1 text-neutral-400 cursor-help" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                            onMouseEnter={(e) => {
                                              const tooltip = e.currentTarget.nextElementSibling;
                                              if (tooltip) tooltip.classList.remove('hidden');
                                            }}
                                            onMouseLeave={(e) => {
                                              const tooltip = e.currentTarget.nextElementSibling;
                                              if (tooltip) tooltip.classList.add('hidden');
                                            }}
                                            onClick={(e) => {
                                              const tooltip = e.currentTarget.nextElementSibling;
                                              if (tooltip) tooltip.classList.toggle('hidden');
                                            }}
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <div 
                                            className="hidden absolute z-50 p-3 bg-white rounded-md shadow-lg border border-neutral-200 w-64 left-0 top-5"
                                            style={{ wordBreak: 'break-word', backgroundColor: 'white', opacity: 1 }}
                                          >
                                            <p className="text-xs">Enter the number of teeth or areas that need this treatment. For example, if you need 4 dental implants, enter '4' here.</p>
                                          </div>
                                        </div>
                                      </div>
                                      <Input
                                        type="number"
                                        min="1"
                                        className="bg-white"
                                        {...field}
                                      />
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              {/* Remove Treatment Button */}
                              {form.watch('treatments').length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 sm:mt-8 w-full sm:w-auto text-destructive hover:text-destructive/80"
                                  onClick={() => removeTreatment(index)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 sm:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span className="sm:hidden">Remove Treatment</span>
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          {/* Add Treatment Button - Moved here for easier access */}
                          <div className="flex justify-center mb-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="bg-white border-primary text-primary hover:bg-primary hover:text-white"
                              onClick={addTreatment}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              {t('pricing.add_treatment')}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4 mt-6">
                          <h3 className="text-lg font-semibold text-primary">{t('pricing.patient_information')}</h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('common.name')}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t('common.name_placeholder')} className="bg-white" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('common.email')}</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder={t('common.email_placeholder')} className="bg-white" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('common.phone')}</FormLabel>
                                <FormControl>
                                  <Input placeholder="+44 123 456 7890" className="bg-white" {...field} />
                                </FormControl>
                                <p className="text-xs text-neutral-500 mt-1">
                                  {t('common.phone_help_text')}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          


                          {/* Travel information section */}
                          <div className="mt-6">
                            <div className="flex items-center mb-4">
                              <h3 className="text-lg font-semibold text-primary">{t('pricing.travel_information')}</h3>
                              <InfoIcon 
                                tooltipContent={t('pricing.travel_info_tooltip')} 
                                position="right" 
                                size="medium"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="travelMonth"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center">
                                      <FormLabel>{t('pricing.travel_month')}</FormLabel>
                                      <InfoIcon 
                                        tooltipContent="Select when you plan to travel. This helps us estimate flight costs and check clinic availability for your preferred dates."
                                        position="left"
                                      />
                                    </div>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="bg-white">
                                          <SelectValue placeholder={t('pricing.select_month')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {months.map((month) => (
                                          <SelectItem key={month} value={month}>
                                            {month}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="departureCity"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center">
                                      <FormLabel>{t('pricing.departure_city')}</FormLabel>
                                      <InfoIcon 
                                        tooltipContent="Select your departure city to help us estimate the travel costs. We can arrange direct or connecting flights from many major cities."
                                        position="left"
                                      />
                                    </div>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="bg-white">
                                          <SelectValue placeholder={t('pricing.select_city')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="max-h-[300px]">
                                        {getCitiesGroupedByCountry().map((countryGroup) => (
                                          <div key={countryGroup.country}>
                                            <div className="px-2 py-1.5 text-sm font-semibold bg-neutral-100">
                                              {countryGroup.country}
                                            </div>
                                            {countryGroup.cities.map((city) => (
                                              <SelectItem key={city} value={city}>
                                                {city}
                                              </SelectItem>
                                            ))}
                                          </div>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Additional questions section */}
                        <div className="mt-6 space-y-5">
                          <div className="flex items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">Additional Information</h3>
                            <InfoIcon 
                              tooltipContent="These details help us provide a more personalized service and accurate quote."
                              position="right" 
                              size="medium"
                            />
                          </div>
                          
                          {/* Journey Mode */}
                          <FormField
                            control={form.control}
                            name="journeyMode"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-primary font-semibold">Who would you like to guide your journey?</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      field.value === 'concierge' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-neutral-200 hover:border-primary/50'
                                    }`}
                                    onClick={() => field.onChange('concierge')}
                                  >
                                    <div className="flex items-start mb-2">
                                      <input
                                        type="radio"
                                        checked={field.value === 'concierge'}
                                        onChange={() => field.onChange('concierge')}
                                        className="mt-1 mr-3"
                                      />
                                      <div>
                                        <h4 className="font-semibold">Istanbul Dental Smile (Full Concierge)</h4>
                                        <p className="text-sm text-neutral-600 mt-1">
                                          We'll handle everything from clinic booking to accommodation and transportation
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      field.value === 'clinic' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-neutral-200 hover:border-primary/50'
                                    }`}
                                    onClick={() => field.onChange('clinic')}
                                  >
                                    <div className="flex items-start mb-2">
                                      <input
                                        type="radio"
                                        checked={field.value === 'clinic'}
                                        onChange={() => field.onChange('clinic')}
                                        className="mt-1 mr-3"
                                      />
                                      <div>
                                        <h4 className="font-semibold">The Clinic (We hand you over)</h4>
                                        <p className="text-sm text-neutral-600 mt-1">
                                          We'll connect you with the clinic, and they'll provide their own concierge service
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {/* London Consultation */}
                          <FormField
                            control={form.control}
                            name="londonConsult"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-primary font-semibold">Would you like a £150 consultation in London?</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      field.value === 'yes' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-neutral-200 hover:border-primary/50'
                                    }`}
                                    onClick={() => field.onChange('yes')}
                                  >
                                    <div className="flex items-start mb-2">
                                      <input
                                        type="radio"
                                        checked={field.value === 'yes'}
                                        onChange={() => field.onChange('yes')}
                                        className="mt-1 mr-3"
                                      />
                                      <div>
                                        <h4 className="font-semibold">Yes, I'd like a London consultation</h4>
                                        <p className="text-sm text-neutral-600 mt-1">
                                          Includes X-rays and a detailed treatment plan before you travel
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      field.value === 'no' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-neutral-200 hover:border-primary/50'
                                    }`}
                                    onClick={() => field.onChange('no')}
                                  >
                                    <div className="flex items-start mb-2">
                                      <input
                                        type="radio"
                                        checked={field.value === 'no'}
                                        onChange={() => field.onChange('no')}
                                        className="mt-1 mr-3"
                                      />
                                      <div>
                                        <h4 className="font-semibold">No, I'll have my consultation in Istanbul</h4>
                                        <p className="text-sm text-neutral-600 mt-1">
                                          Consultation and X-rays are provided free at the clinic in Istanbul
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {/* Replacing Existing Work */}
                          <FormField
                            control={form.control}
                            name="replacingExisting"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-primary font-semibold">Are you replacing existing crowns or veneers?</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                      field.value === 'yes' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-neutral-200 hover:border-primary/50'
                                    }`}
                                    onClick={() => field.onChange('yes')}
                                  >
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        checked={field.value === 'yes'}
                                        onChange={() => field.onChange('yes')}
                                        className="mr-2"
                                      />
                                      <div className="font-medium">Yes</div>
                                    </div>
                                  </div>
                                  
                                  <div
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                      field.value === 'no' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-neutral-200 hover:border-primary/50'
                                    }`}
                                    onClick={() => field.onChange('no')}
                                  >
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        checked={field.value === 'no'}
                                        onChange={() => field.onChange('no')}
                                        className="mr-2"
                                      />
                                      <div className="font-medium">No</div>
                                    </div>
                                  </div>
                                  
                                  <div
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                      field.value === 'not-sure' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-neutral-200 hover:border-primary/50'
                                    }`}
                                    onClick={() => field.onChange('not-sure')}
                                  >
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        checked={field.value === 'not-sure'}
                                        onChange={() => field.onChange('not-sure')}
                                        className="mr-2"
                                      />
                                      <div className="font-medium">Not sure</div>
                                    </div>
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {/* Preferred Brands/Materials */}
                          <FormField
                            control={form.control}
                            name="preferredBrands"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-primary font-semibold">
                                  Do you have a brand preference for materials?
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || "no_preference"}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Select your preference" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="no_preference">No preference (recommended)</SelectItem>
                                    <SelectItem value="premium_eu">Premium European brands (German/Swiss)</SelectItem>
                                    <SelectItem value="premium_usa">Premium USA brands</SelectItem>
                                    <SelectItem value="premium_korea">Premium South Korean brands</SelectItem>
                                    <SelectItem value="guide_me">I'm unsure — please guide me</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-xs text-neutral-500">
                                  <span className="block mb-1">All clinics we work with use high-quality, time-tested materials from globally recognized brands.</span>
                                  <div className="pl-5 space-y-1 my-2">
                                    <div className="flex items-baseline">
                                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 block mr-2 flex-shrink-0 mt-1.5"></span>
                                      <span><span className="font-medium">European brands</span>: Straumann, Camlog (Swiss/German)</span>
                                    </div>
                                    <div className="flex items-baseline">
                                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 block mr-2 flex-shrink-0 mt-1.5"></span>
                                      <span><span className="font-medium">USA brands</span>: Nobel Biocare, 3M</span>
                                    </div>
                                    <div className="flex items-baseline">
                                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 block mr-2 flex-shrink-0 mt-1.5"></span>
                                      <span><span className="font-medium">Korean brands</span>: Osstem, Dentium (excellent quality, cost-effective)</span>
                                    </div>
                                  </div>
                                  <span className="block mt-1">Specific brand requests can be discussed during your consultation.</span>
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                          
                          {/* Budget Range */}
                          <FormField
                            control={form.control}
                            name="budgetRange"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-primary font-semibold">
                                  Your budget range (optional)
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="E.g., £2,000 - £4,000" 
                                    className="bg-white" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-neutral-500">
                                  This helps us suggest the most suitable options for your financial comfort
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* X-ray upload section */}
                        <div className="mt-6 border rounded-lg p-4 bg-white border-primary/20">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-primary">Upload X-rays / CT Scans</h3>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-xs">Uploading your X-rays or CT scans will help our dental team provide a more accurate treatment plan and final quote.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          
                          <p className="text-sm text-neutral-600 mb-3">
                            For more accurate quotes, upload your recent dental X-rays or CT scans (optional)
                          </p>
                          
                          <FormField
                            control={form.control}
                            name="xrayFiles"
                            render={({ field: { onChange, value, ...rest } }) => (
                              <FormItem>
                                <FormLabel htmlFor="xrayFiles" className="cursor-pointer">
                                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:bg-primary/5 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <p className="mt-2 text-neutral-700 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-neutral-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                                  </div>
                                </FormLabel>
                                <FormControl>
                                  <input
                                    type="file"
                                    id="xrayFiles"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                      onChange(e.target.files);
                                    }}
                                    {...rest}
                                  />
                                </FormControl>
                                <FormMessage />
                                
                                {/* Preview uploaded files */}
                                {value && value.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-primary mb-1">Selected files:</p>
                                    <ul className="text-xs space-y-1">
                                      {Array.from(value).map((file, idx) => (
                                        <li key={idx} className="flex items-center text-neutral-700">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-8 py-4 sm:py-6 text-base sm:text-lg fixed bottom-0 left-0 z-10 rounded-none sm:relative sm:bottom-auto sm:left-auto sm:z-auto sm:rounded-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          {t('pricing.calculate_quote')}
                        </Button>
                        
                        {/* Extra space at bottom on mobile to prevent button overlap */}
                        <div className="h-16 sm:hidden"></div>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <div>
                  {quote ? (
                    <div ref={quoteResultRef} className="space-y-4">
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <table className="w-full">
                          <thead className="bg-primary/10">
                            <tr>
                              <th className="px-4 py-3 text-left text-primary font-semibold">{t('pricing.treatment')}</th>
                              <th className="px-4 py-3 text-center text-primary font-semibold">{t('pricing.quantity')}</th>
                              <th className="px-4 py-3 text-right text-primary font-semibold">{t('pricing.price')} (£)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quote.items.map((item, idx) => (
                              <tr key={idx} className="border-t border-neutral-100">
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="font-medium">{formatTreatmentName(item.treatment)}</div>
                                    {item.guarantee !== 'N/A' && `${t('pricing.guarantee')}: ${item.guarantee}`}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-right">£{item.subtotalGBP.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-primary/5 font-semibold">
                            <tr>
                              <td colSpan={2} className="px-4 py-3 text-primary">{t('pricing.total')}</td>
                              <td className="px-4 py-3 text-right text-primary">
                                £{(() => {
                                  // Get the selected clinic price
                                  const clinicPriceFactors = [0.85, 0.80, 0.90]; // Price factors for each clinic
                                  const selectedFactor = clinicPriceFactors[selectedClinic];
                                  return Math.round(quote.totalGBP * selectedFactor).toLocaleString();
                                })()}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2} className="px-4 py-3 text-primary">{t('pricing.total_usd')}</td>
                              <td className="px-4 py-3 text-right text-primary">
                                ${(() => {
                                  // Get the selected clinic price with updated price factors
                                  const clinicPriceFactors = [0.80, 0.90, 1.00]; // Price factors for each clinic
                                  const selectedFactor = clinicPriceFactors[selectedClinic];
                                  return Math.round(quote.totalUSD * selectedFactor).toLocaleString();
                                })()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      
                      {/* Istanbul Clinic Comparison Section - New Tiered Design */}
                      <div className="p-4 bg-primary/5 rounded-lg mb-6">
                        <h4 className="font-semibold text-primary mb-2">Compare Clinics Across Tiers</h4>
                        <p className="text-sm mb-3">Each quote includes vetted options from affordable, mid-tier, and premium clinics in Istanbul. Choose what suits your comfort and budget best:</p>
                        
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 pt-2">
                          {[
                            {
                              name: "Istanbul Dental Care",
                              type: "🏷️ Affordable",
                              price: Math.round(quote.totalGBP * 0.80), 
                              extra: "Simple procedures & budget-focused travel",
                              guarantee: "3 Years",
                              rating: "⭐⭐⭐⭐"
                            },
                            {
                              name: "DentGroup Istanbul",
                              type: "💼 Mid-Tier",
                              price: Math.round(quote.totalGBP * 0.90), 
                              extra: "Balanced budget + comfort with aftercare support",
                              guarantee: "5 Years",
                              rating: "⭐⭐⭐⭐½"
                            },
                            {
                              name: "Vera Smile",
                              type: "💎 Premium",
                              price: Math.round(quote.totalGBP * 1.00), 
                              extra: "VIP clients, faster results, luxury environment",
                              guarantee: "10 Years",
                              rating: "⭐⭐⭐⭐⭐"
                            }
                          ].map((clinic, idx) => {
                            const isSelected = selectedClinic === idx;
                            return (
                              <div 
                                key={idx} 
                                className={`w-full sm:flex-1 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                  isSelected 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-white border-transparent hover:border-primary/30'
                                }`}
                                onClick={() => setSelectedClinic(idx)}
                              >
                                <div className="flex items-start">
                                  <input 
                                    type="radio" 
                                    checked={isSelected}
                                    onChange={() => setSelectedClinic(idx)}
                                    className="mt-1 mr-2"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-bold text-primary">{clinic.type}</div>
                                    <div className="text-sm font-semibold">{clinic.name}</div>
                                    <div className="flex items-center">
                                      <div className="text-lg font-bold text-primary">£{clinic.price.toLocaleString()}</div>
                                    </div>
                                    <div className="text-xs mt-1">Guarantee: {clinic.guarantee}</div>
                                    <div className="text-xs mt-1">Rating: {clinic.rating}</div>
                                    <div className="text-xs mt-1">{clinic.extra}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* The Gemini citation will move to the UK price comparison section */}
                      </div>
                      
                      {/* UK vs Istanbul Price Comparison - now separate section */}
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">Cost Comparison: UK vs Istanbul</h4>
                        <p className="text-sm mb-3">See how much you can save compared to UK prices:</p>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 pt-2">
                          {(() => {
                            // Get the selected clinic data using the new clinic information
                            const istanbulClinics = [
                              {
                                name: "Istanbul Dental Care",
                                price: Math.round(quote.totalGBP * 0.80),
                                extra: "Including flights & hotel",
                                type: "Affordable"
                              },
                              {
                                name: "DentGroup Istanbul",
                                price: Math.round(quote.totalGBP * 0.90),
                                extra: "Including flights & hotel",
                                type: "Mid-Tier"
                              },
                              {
                                name: "Vera Smile",
                                price: Math.round(quote.totalGBP * 1.00),
                                extra: "Including flights & hotel",
                                type: "Premium"
                              }
                            ];
                            
                            // Get the selected clinic price
                            const selectedClinicData = istanbulClinics[selectedClinic];
                            
                            // Create comparison data
                            const comparisonData = [
                              {
                                name: "London clinic average price*",
                                price: Math.round(quote.totalGBP * 3.2),
                                extra: "Without travel costs"
                              },
                              {
                                name: "Manchester clinic average price*",
                                price: Math.round(quote.totalGBP * 2.8),
                                extra: "Without travel costs"
                              },
                              {
                                name: selectedClinicData.name,
                                price: selectedClinicData.price,
                                extra: selectedClinicData.extra
                              }
                            ];
                            
                            return comparisonData.map((clinic, idx) => (
                              <div key={idx} className={`w-full sm:flex-1 p-3 rounded-lg ${idx === 2 ? 'bg-primary text-white' : 'bg-white'}`}>
                                <div className="flex justify-between sm:block">
                                  <div className="text-sm font-semibold">{clinic.name}</div>
                                  <div className={`text-lg font-bold ${idx === 2 ? 'text-white' : 'text-primary'}`}>£{clinic.price.toLocaleString()}</div>
                                </div>
                                <div className="text-xs mt-1">{clinic.extra}</div>
                              </div>
                            ));
                          })()}
                        </div>
                        
                        {/* Savings calculation based on selected clinic price */}
                        {(() => {
                          // Get the selected clinic price with the new price factors
                          const selectedClinicPrice = [
                            Math.round(quote.totalGBP * 0.80), // Istanbul Dental Care (Affordable)
                            Math.round(quote.totalGBP * 0.90), // DentGroup Istanbul (Mid-Tier)
                            Math.round(quote.totalGBP * 1.00)  // Vera Smile (Premium)
                          ][selectedClinic];
                          
                          // Calculate UK average price
                          const ukAvgPrice = (Math.round(quote.totalGBP * 3.2) + Math.round(quote.totalGBP * 2.8))/2;
                          
                          // Calculate savings
                          const savings = ukAvgPrice - selectedClinicPrice;
                          const savingsPercent = Math.round((savings / ukAvgPrice) * 100);
                          
                          return (
                            <>
                              <div className="mt-3 text-center text-primary font-semibold">
                                Your Savings: £{Math.round(savings).toLocaleString()} 
                                ({savingsPercent}% off UK prices)
                              </div>
                              <div className="text-xs text-center mt-2">
                                * Pricing data sourced from Gemini deep research of average UK clinic rates
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      {/* Hidden PDF Generator component */}
                      <div style={{ display: "none" }}>
                        {(() => {
                          // Define all clinics with new names and details
                          const allClinics = [
                            {
                              name: "Istanbul Dental Care",
                              priceGBP: Math.round(quote.totalGBP * 0.80),
                              extras: "Simple procedures & budget-focused travel",
                              guarantee: "3 Years",
                              location: "City Center",
                              rating: "⭐⭐⭐⭐"
                            },
                            {
                              name: "DentGroup Istanbul",
                              priceGBP: Math.round(quote.totalGBP * 0.90),
                              extras: "Balanced budget + comfort with aftercare support",
                              guarantee: "5 Years",
                              location: "Şişli District",
                              rating: "⭐⭐⭐⭐½"
                            },
                            {
                              name: "Vera Smile",
                              priceGBP: Math.round(quote.totalGBP * 1.00),
                              extras: "VIP clients, faster results, luxury environment",
                              guarantee: "10 Years",
                              location: "Levent District",
                              rating: "⭐⭐⭐⭐⭐"
                            }
                          ];
                          
                          // Calculate the selected clinic's price for total GBP and USD with new price factors
                          const clinicPriceFactors = [0.80, 0.90, 1.00]; // Price factors for each clinic
                          const selectedFactor = clinicPriceFactors[selectedClinic];
                          const selectedClinicTotalGBP = Math.round(quote.totalGBP * selectedFactor);
                          const selectedClinicTotalUSD = Math.round(quote.totalUSD * selectedFactor);
                          
                          // Set the selected clinic as the first in the array (so it's used for UK comparisons)
                          const orderedClinics = [
                            allClinics[selectedClinic],  // Put selected clinic first
                            ...allClinics.filter((_, idx) => idx !== selectedClinic) // Add the others
                          ];
                          
                          return (
                            <JSPDFGenerator
                              items={quote.items}
                              totalGBP={selectedClinicTotalGBP} // Use the selected clinic's total
                              totalUSD={selectedClinicTotalUSD} // Use the selected clinic's total
                              patientName={form.getValues('name')}
                              patientEmail={form.getValues('email')}
                              patientPhone={form.getValues('phone')}
                              travelMonth={form.getValues('travelMonth')}
                              departureCity={form.getValues('departureCity')}
                              clinics={orderedClinics}
                              hasXrays={hasXrays}
                              xrayCount={form.getValues('xrayFiles')?.length || 0}
                              selectedClinicIndex={selectedClinic}
                            />
                          );
                        })()}
                      </div>
                      
                      {/* X-ray Accuracy Disclaimer */}
                      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                        <p>
                          <span className="font-medium">Note about accuracy:</span> This quote is based on the information you've provided and the selections you've chosen. After an X-ray (which we can help arrange), your final treatment plan and price will be confirmed — usually within ±10% of this quote.
                        </p>
                      </div>
                      
                      {/* Download Quote Button */}
                      <div className="mt-4">
                        <button
                          onClick={downloadQuotePDF}
                          className="flex items-center justify-center w-full py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                          Download Your Custom Quote PDF
                        </button>
                        
                        <div className="mt-3 text-center">
                          <a 
                            href="/pdf-download-help.html" 
                            target="_blank" 
                            className="inline-flex items-center text-sm text-primary hover:underline"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="16"></line>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            Having trouble downloading? Click here for help
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[350px] flex flex-col items-center justify-center text-center text-neutral-500 bg-white rounded-lg border border-neutral-200 p-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-16 w-16 mb-6 text-primary/30"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <h4 className="text-xl font-semibold mb-2 text-primary">{t('pricing.no_quote_generated')}</h4>
                      <p className="mb-4">{t('pricing.select_treatments_to_generate')}</p>
                      <div className="text-sm p-3 bg-primary/5 rounded-lg max-w-md">
                        <p className="font-medium text-primary mb-2">{t('pricing.how_it_works')}:</p>
                        <ol className="text-left space-y-2">
                          <li className="flex">
                            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">1</span>
                            <span>{t('pricing.step_select_treatments')}</span>
                          </li>
                          <li className="flex">
                            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">2</span>
                            <span>{t('pricing.step_enter_details')}</span>
                          </li>
                          <li className="flex">
                            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">3</span>
                            <span>{t('pricing.step_calculate_quote')}</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <p className="text-lg font-medium text-primary mb-4">{t('pricing.why_choose_istanbul')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                <div className="text-3xl text-primary mb-2">70%</div>
                <p className="text-sm text-neutral-600">{t('pricing.benefit_savings')}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                <div className="text-3xl text-primary mb-2">5★</div>
                <p className="text-sm text-neutral-600">{t('pricing.benefit_quality')}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                <div className="text-3xl text-primary mb-2">24/7</div>
                <p className="text-sm text-neutral-600">{t('pricing.benefit_support')}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                <div className="text-3xl text-primary mb-2">100%</div>
                <p className="text-sm text-neutral-600">{t('pricing.benefit_guarantee')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* HTML Quote Dialog */}
      <Dialog open={showHtmlQuote} onOpenChange={setShowHtmlQuote}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Your Dental Treatment Quote
            </DialogTitle>
            <DialogDescription>
              Quote Number: {htmlQuoteData?.quoteNumber} | Date: {htmlQuoteData?.date}
            </DialogDescription>
          </DialogHeader>
          
          {htmlQuoteData && (
            <div id="quote-content" className="space-y-6 py-4">
              {/* Patient Information */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <h3 className="text-lg font-semibold text-primary mb-2">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Name</p>
                    <p className="font-medium">{htmlQuoteData.patientName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="font-medium">{htmlQuoteData.patientEmail || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Phone</p>
                    <p className="font-medium">{htmlQuoteData.patientPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {/* Treatments Table */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Treatment Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Treatment</th>
                        <th className="px-4 py-2 text-right">Price (GBP)</th>
                        <th className="px-4 py-2 text-right">Price (USD)</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-left">Guarantee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {htmlQuoteData.items.map((item: any, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                          <td className="px-4 py-3 border-b border-neutral-200">
                            {formatTreatmentName(item.treatment)}
                          </td>
                          <td className="px-4 py-3 border-b border-neutral-200 text-right">
                            £{item.priceGBP.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 border-b border-neutral-200 text-right">
                            ${item.priceUSD.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 border-b border-neutral-200 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 border-b border-neutral-200">
                            {item.guarantee}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-primary/5">
                        <td className="px-4 py-3">TOTAL</td>
                        <td className="px-4 py-3 text-right">£{htmlQuoteData.totalGBP.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">${htmlQuoteData.totalUSD.toLocaleString()}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* X-ray Accuracy Disclaimer */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Note About Quote Accuracy</h3>
                <p className="text-amber-700">
                  This quote is based on the information you've provided and the treatments you've selected. After an X-ray review (which we can help arrange), your final treatment plan and price will be confirmed — usually within ±10% of this quote.
                </p>
              </div>
              
              {/* UK Cost Comparison */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <h3 className="text-lg font-semibold text-primary mb-2">Cost Comparison</h3>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Equivalent UK Cost Range:</p>
                    <p className="text-xl font-bold">
                      £{(htmlQuoteData.totalGBP * 2.5).toLocaleString()} - £{(htmlQuoteData.totalGBP * 3).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 bg-green-50 p-2 rounded-md border border-green-200">
                    <p className="text-sm text-green-600">Your Savings with Istanbul Dental Smile:</p>
                    <p className="text-xl font-bold text-green-700">
                      £{(htmlQuoteData.totalGBP * 1.75).toLocaleString()} (65% saving)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Istanbul Clinic Comparison Table */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Istanbul Clinic Comparison</h3>
                <p className="text-sm mb-3">We work with these partner clinics in Istanbul - compare their offers below:</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Clinic</th>
                        <th className="px-4 py-2 text-right">Price (GBP)</th>
                        <th className="px-4 py-2 text-left">Location</th>
                        <th className="px-4 py-2 text-left">Features</th>
                        <th className="px-4 py-2 text-left">Guarantee</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-primary/5 font-medium">
                        <td className="px-4 py-3 border-b border-neutral-200">Maltepe Dental Clinic</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{Math.round(htmlQuoteData.totalGBP * 0.85).toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">Maltepe District</td>
                        <td className="px-4 py-3 border-b border-neutral-200">
                          <div className="flex items-center space-x-2">
                            <img src="icons/clinic.png" className="w-4 h-4" alt="Clinic" /> 
                            <span>Modern Facilities</span>
                            <span className="mx-1">·</span>
                            <img src="icons/car.png" className="w-4 h-4" alt="Transfer" /> 
                            <span>Airport Transfer</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-neutral-200">5 Years</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border-b border-neutral-200">Denteste Istanbul</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{Math.round(htmlQuoteData.totalGBP * 0.80).toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">City Center</td>
                        <td className="px-4 py-3 border-b border-neutral-200">
                          <div className="flex items-center space-x-2">
                            <img src="icons/hotel.png" className="w-4 h-4" alt="Hotel" /> 
                            <span>All-inclusive Package</span>
                            <span className="mx-1">·</span>
                            <img src="icons/hotel.png" className="w-4 h-4" alt="Hotel" /> 
                            <span>Hotel Stay</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-neutral-200">3 Years</td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="px-4 py-3 border-b border-neutral-200">Istanbulsmilecenter</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{Math.round(htmlQuoteData.totalGBP * 0.90).toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">Sisli District</td>
                        <td className="px-4 py-3 border-b border-neutral-200">
                          <div className="flex items-center space-x-2">
                            <img src="icons/clinic.png" className="w-4 h-4" alt="Premium" /> 
                            <span>Premium Materials</span>
                            <span className="mx-1">·</span>
                            <img src="icons/chat.png" className="w-4 h-4" alt="VIP" /> 
                            <span>VIP Service</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-neutral-200">7 Years</td>
                      </tr>
                      <tr className="bg-primary/5 font-bold">
                        <td className="px-4 py-3 border-b border-neutral-200" colSpan={5}>
                          <div className="text-sm text-center text-primary">
                            All prices include consultation, treatment, and aftercare. The clinic with the best value for your specific needs will be recommended during your consultation.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* UK vs Istanbul Cost Comparison */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">UK vs Istanbul Cost Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Clinic Location</th>
                        <th className="px-4 py-2 text-right">Price (GBP)</th>
                        <th className="px-4 py-2 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 border-b border-neutral-200">London clinic average price*</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{Math.round(htmlQuoteData.totalGBP * 3.2).toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">Price without travel costs</td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="px-4 py-3 border-b border-neutral-200">Manchester clinic average price*</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{Math.round(htmlQuoteData.totalGBP * 2.8).toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">Price without travel costs</td>
                      </tr>
                      <tr className="bg-primary/5 font-medium">
                        <td className="px-4 py-3 border-b border-neutral-200">Istanbul Dental Smile</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{htmlQuoteData.totalGBP.toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">Includes flights, hotel & transfers</td>
                      </tr>
                      <tr className="font-bold bg-green-50">
                        <td className="px-4 py-3 border-b border-neutral-200">Your Savings</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right text-green-700">
                          £{Math.round((Math.round(htmlQuoteData.totalGBP * 3.2) + Math.round(htmlQuoteData.totalGBP * 2.8))/2 - htmlQuoteData.totalGBP).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-green-700">
                          {Math.round(((Math.round(htmlQuoteData.totalGBP * 3.2) + Math.round(htmlQuoteData.totalGBP * 2.8))/2 - htmlQuoteData.totalGBP) / ((Math.round(htmlQuoteData.totalGBP * 3.2) + Math.round(htmlQuoteData.totalGBP * 2.8))/2) * 100)}% off UK prices
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="text-xs mt-2 text-neutral-500 text-right">
                  UK pricing data sourced from Gemini AI deep research of private clinic rates
                </div>
              </div>
              
              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">What's Included With Your Treatment</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <img src="icons/tick.png" className="w-5 h-5 mr-2" alt="✓" />
                    <span>Free Consultation & Treatment Plan</span>
                  </li>
                  <li className="flex items-center">
                    <img src="icons/tick.png" className="w-5 h-5 mr-2" alt="✓" />
                    <span>VIP Airport Transfers Included</span>
                  </li>
                  <li className="flex items-center">
                    <img src="icons/tick.png" className="w-5 h-5 mr-2" alt="✓" />
                    <span>5-Star Hotel Accommodation Options</span>
                  </li>
                  <li className="flex items-center">
                    <img src="icons/tick.png" className="w-5 h-5 mr-2" alt="✓" />
                    <span>English-Speaking Staff Throughout Your Stay</span>
                  </li>
                  <li className="flex items-center">
                    <img src="icons/tick.png" className="w-5 h-5 mr-2" alt="✓" />
                    <span>Dedicated Patient Coordinator Available 24/7</span>
                  </li>
                  <li className="flex items-center">
                    <img src="icons/tick.png" className="w-5 h-5 mr-2" alt="✓" />
                    <span>All Treatments with Written Guarantees</span>
                  </li>
                </ul>
              </div>
              
              {/* Next Steps */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-primary mb-2">Next Steps</h3>
                <ol className="space-y-2 pl-5 list-decimal">
                  <li className="pl-2">Contact Istanbul Dental Smile to confirm your treatment plan</li>
                  <li className="pl-2">Book your flight to Istanbul for your chosen dates</li>
                  <li className="pl-2">We will arrange airport transfer and accommodation options</li>
                </ol>
                
                <div className="mt-4 bg-white p-4 rounded-lg border border-neutral-200">
                  <p className="font-medium">Ready to Book?</p>
                  <p>Email us at <strong>info@istanbuldentalsmile.com</strong> or message us on WhatsApp: <strong>+447572445856</strong></p>
                  <p className="text-sm text-neutral-500 mt-2">We'll handle your travel, treatment, and care — all you do is show up and smile!</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              id="quote-close-button"
              variant="outline" 
              onClick={() => setShowHtmlQuote(false)}
            >
              Close
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                id="quote-download-button"
                onClick={downloadQuotePDF}
                className="bg-primary hover:bg-primary/90"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                Download Your Custom Quote PDF
              </Button>
              
              {/* Hidden PDF generator components */}
              <div style={{ display: "none" }}>
                {htmlQuoteData && (
                  <>
                    <ServerPdfGenerator
                      items={htmlQuoteData.items}
                      totalGBP={htmlQuoteData.totalGBP}
                      totalUSD={htmlQuoteData.totalUSD}
                      patientName={htmlQuoteData.patientName}
                      patientEmail={htmlQuoteData.patientEmail}
                      patientPhone={htmlQuoteData.patientPhone}
                      travelMonth={htmlQuoteData.travelMonth}
                      departureCity={htmlQuoteData.departureCity}
                      onComplete={() => setShowHtmlQuote(false)}
                    />
                    <PythonPdfGenerator
                      items={htmlQuoteData.items}
                      totalGBP={htmlQuoteData.totalGBP}
                      totalUSD={htmlQuoteData.totalUSD}
                      patientName={htmlQuoteData.patientName}
                      patientEmail={htmlQuoteData.patientEmail}
                      patientPhone={htmlQuoteData.patientPhone}
                      travelMonth={htmlQuoteData.travelMonth}
                      departureCity={htmlQuoteData.departureCity}
                      onComplete={() => setShowHtmlQuote(false)}
                    />
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}