import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PdfGenerator from "./PdfGenerator";
import JourneyPdf from "./JourneyPdf";
import JSPDFGenerator from "./JSPDFGenerator";
import TemplatePdfGenerator from "./TemplatePdfGenerator";
import ServerPdfGenerator from "./ServerPdfGenerator";
import PythonPdfGenerator from "./PythonPdfGenerator";
import jsPDF from "jspdf";
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
});

type FormValues = z.infer<typeof formSchema>;

export default function PriceCalculator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [treatments, setTreatments] = useState<TreatmentPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<ReturnType<typeof calculateTotal> | null>(null);
  
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
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    // Get the travel info for flight cost calculations
    const travelMonth = data.travelMonth || 'July';
    const departureCity = data.departureCity || 'London';
    
    // Calculate the total prices including flight costs
    const quoteResult = calculateTotal(
      data.treatments, 
      { city: departureCity, month: travelMonth }
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
    
    // Handle X-ray file uploads (in a real implementation, this would send files to a server)
    let xrayFileNames: string[] = [];
    if (data.xrayFiles && data.xrayFiles.length > 0) {
      // Get file names for record keeping
      xrayFileNames = Array.from(data.xrayFiles).map(file => file.name);
      
      // In a real implementation, you would upload these files to a server
      console.log('X-ray files to be uploaded:', xrayFileNames);
      
      // Show success message for file upload
      toast({
        title: 'X-rays Received',
        description: `${xrayFileNames.length} file(s) will be reviewed by our dental team.`,
        variant: 'default',
      });
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
        xrayCount: xrayFileNames.length
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
    
    toast({
      title: 'Quote Generated',
      description: 'Your quote has been calculated successfully.',
    });
  };
  
  // HTML Quote dialog state
  const [showHtmlQuote, setShowHtmlQuote] = useState<boolean>(false);
  const [htmlQuoteData, setHtmlQuoteData] = useState<any>(null);
  
  // Function to download quote as PDF
  const downloadQuotePDF = () => {
    try {
      // Try the global function first (for the main quote view)
      // @ts-ignore - Using the global function we added
      if (window.generateJsPdf) {
        // @ts-ignore
        window.generateJsPdf();
        return;
      }
      
      // Alternative approach: Try to find and click the hidden JSPDFGenerator component's button
      const jspdfGeneratorRef = document.getElementById('jspdf-generator-ref');
      if (jspdfGeneratorRef) {
        const button = jspdfGeneratorRef.querySelector('button');
        if (button) {
          button.click();
          return;
        }
      }
      
      // Fallback: Use the axios API directly (for the quote dialog)
      if (htmlQuoteData) {
        // Log data for debugging
        console.log('Quote dialog travel info:', {
          travelMonth: htmlQuoteData.travelMonth,
          departureCity: htmlQuoteData.departureCity
        });
        
        // Call the server-side jsPDF endpoint
        axios({
          method: 'post',
          url: '/api/jspdf-quote',
          data: {
            items: htmlQuoteData.items,
            totalGBP: htmlQuoteData.totalGBP,
            totalUSD: htmlQuoteData.totalUSD,
            patientName: htmlQuoteData.patientName,
            patientEmail: htmlQuoteData.patientEmail,
            patientPhone: htmlQuoteData.patientPhone,
            travelMonth: htmlQuoteData.travelMonth || 'year-round', // Ensure fallback value
            departureCity: htmlQuoteData.departureCity || 'UK', // Ensure fallback value
            clinics: [
              {
                name: "London Clinic",
                priceGBP: Math.round(htmlQuoteData.totalGBP * 2.5),
                extras: "Without travel"
              },
              {
                name: "Manchester Clinic",
                priceGBP: Math.round(htmlQuoteData.totalGBP * 2.2),
                extras: "Without travel"
              },
              {
                name: "Istanbul Dental Smile",
                priceGBP: htmlQuoteData.totalGBP,
                extras: "Including 5★ hotel"
              }
            ],
            hasXrays: htmlQuoteData.hasXrays,
            xrayCount: htmlQuoteData.xrayCount
          },
          responseType: 'blob'
        }).then(response => {
          // Create a download link for the PDF
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          
          // Generate formatted filename with date
          const now = new Date();
          const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, '');
          const filename = `IstanbulDentalSmile_Quote_${formattedDate}.pdf`;
          
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }).catch(error => {
          console.error('Error downloading PDF:', error);
          toast({
            title: 'Error',
            description: 'Could not generate PDF. Please try again.',
            variant: 'destructive'
          });
        });
      } else {
        toast({
          title: 'Error',
          description: 'No quote data available. Please generate a quote first.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Could not generate PDF. Please try again.',
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
      
      // Calculate total with flight costs included
      const calculatedQuote = calculateTotal(
        quoteData.treatments,
        { city: departureCity, month: travelMonth }
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
        xrayCount: hasXrays && quoteData.xrayFiles ? quoteData.xrayFiles.length : 0
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
                            <div key={index} className="flex gap-4 items-start bg-white p-3 rounded-lg mb-3 border border-neutral-200 shadow-sm">
                              <div className="flex-1">
                                <FormField
                                  control={form.control}
                                  name={`treatments.${index}.treatment`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex items-center">
                                        <FormLabel className="text-neutral-700">{t('pricing.treatment_type')}</FormLabel>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-neutral-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                          {treatments
                                            .filter(treatment => treatment.treatment && treatment.treatment.trim() !== '')
                                            .map((treatment, idx) => (
                                              <SelectItem key={idx} value={treatment.treatment}>
                                                {formatTreatmentName(treatment.treatment)}
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
                              
                              <div className="w-28">
                                <FormField
                                  control={form.control}
                                  name={`treatments.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex items-center">
                                        <FormLabel className="text-neutral-700">{t('pricing.quantity')}</FormLabel>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-neutral-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                              <p className="text-xs">Enter the number of teeth or areas that need this treatment. For example, if you need 4 dental implants, enter '4' here.</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
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
                                  className="mt-8 text-destructive hover:text-destructive/80"
                                  onClick={() => removeTreatment(index)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
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
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-xs">{t('pricing.travel_info_tooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="travelMonth"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center">
                                      <FormLabel>{t('pricing.travel_month')}</FormLabel>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-neutral-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                            <p className="text-xs">Select when you plan to travel. This helps us estimate flight costs and check clinic availability for your preferred dates.</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
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
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-neutral-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                            <p className="text-xs">Select your departure city to help us estimate the travel costs. We can arrange direct or connecting flights from many major cities.</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
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
                          className="w-full mt-8 py-6 text-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          {t('pricing.calculate_quote')}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <div>
                  {quote ? (
                    <div className="space-y-4">
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
                              <td className="px-4 py-3 text-right text-primary">£{quote.totalGBP.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td colSpan={2} className="px-4 py-3 text-primary">{t('pricing.total_usd')}</td>
                              <td className="px-4 py-3 text-right text-primary">${quote.totalUSD.toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      
                      {/* Simple testimonial section */}
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">{t('pricing.our_patients_save')}</h4>
                        <div className="flex space-x-4 pt-2">
                          {[
                            {
                              name: "London Clinic",
                              price: Math.round(quote.totalGBP * 2.5),
                              extra: "Without travel"
                            },
                            {
                              name: "Manchester Clinic",
                              price: Math.round(quote.totalGBP * 2.2),
                              extra: "Without travel"
                            },
                            {
                              name: "Istanbul Dental Smile",
                              price: quote.totalGBP,
                              extra: "Including 5★ hotel"
                            }
                          ].map((clinic, idx) => (
                            <div key={idx} className={`flex-1 p-3 rounded-lg ${idx === 2 ? 'bg-primary text-white' : 'bg-white'}`}>
                              <div className="text-sm font-semibold mb-1">{clinic.name}</div>
                              <div className={`text-lg font-bold ${idx === 2 ? 'text-white' : 'text-primary'}`}>£{clinic.price.toLocaleString()}</div>
                              <div className="text-xs mt-1">{clinic.extra}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Hidden PDF Generator component */}
                      <div style={{ display: "none" }}>
                        <JSPDFGenerator
                          items={quote.items}
                          totalGBP={quote.totalGBP}
                          totalUSD={quote.totalUSD}
                          patientName={form.getValues('name')}
                          patientEmail={form.getValues('email')}
                          patientPhone={form.getValues('phone')}
                          travelMonth={form.getValues('travelMonth')}
                          departureCity={form.getValues('departureCity')}
                          clinics={[
                            {
                              name: "London Clinic",
                              priceGBP: Math.round(quote.totalGBP * 2.5),
                              extras: "Without travel"
                            },
                            {
                              name: "Manchester Clinic",
                              priceGBP: Math.round(quote.totalGBP * 2.2),
                              extras: "Without travel"
                            },
                            {
                              name: "Istanbul Dental Smile",
                              priceGBP: quote.totalGBP,
                              extras: "Including 5★ hotel"
                            }
                          ]}
                          hasXrays={hasXrays}
                          xrayCount={form.getValues('xrayFiles')?.length || 0}
                        />
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
              
              {/* Clinic Comparison Table */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Clinic Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Clinic</th>
                        <th className="px-4 py-2 text-right">Price (GBP)</th>
                        <th className="px-4 py-2 text-left">Includes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-primary/5 font-medium">
                        <td className="px-4 py-3 border-b border-neutral-200">Istanbul Dental Smile</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{htmlQuoteData.totalGBP.toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">
                          <div className="flex items-center space-x-2">
                            <img src="icons/hotel.png" className="w-4 h-4" alt="Hotel" /> 
                            <span>5★ Hotel</span>
                            <span className="mx-1">·</span>
                            <img src="icons/car.png" className="w-4 h-4" alt="Transfer" /> 
                            <span>VIP Transfer</span>
                            <span className="mx-1">·</span>
                            <img src="icons/chat.png" className="w-4 h-4" alt="Support" /> 
                            <span>24/7 Support</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border-b border-neutral-200">Premium Dental Turkey</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{(htmlQuoteData.totalGBP * 1.05).toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">
                          <div className="flex items-center space-x-2">
                            <img src="icons/hotel.png" className="w-4 h-4" alt="Hotel" /> 
                            <span>4★ Hotel</span>
                            <span className="mx-1">·</span>
                            <img src="icons/car.png" className="w-4 h-4" alt="Transfer" /> 
                            <span>Airport Transfer</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-neutral-50">
                        <td className="px-4 py-3 border-b border-neutral-200">Vera Smile Clinic</td>
                        <td className="px-4 py-3 border-b border-neutral-200 text-right">£{(htmlQuoteData.totalGBP * 0.95).toLocaleString()}</td>
                        <td className="px-4 py-3 border-b border-neutral-200">
                          <div className="flex items-center space-x-2">
                            <img src="icons/car.png" className="w-4 h-4" alt="Transfer" /> 
                            <span>Airport Transfer</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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