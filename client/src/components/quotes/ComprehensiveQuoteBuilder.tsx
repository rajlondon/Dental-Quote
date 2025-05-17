import React, { useState } from 'react';
import { useQuoteStore } from '../../stores/quoteStore';
import { useTreatmentPackages } from '../../hooks/use-treatment-packages';
import { useSpecialOffers } from '../../hooks/use-special-offers';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from '../../hooks/use-toast';
import { TreatmentPackageSelector } from '../packages/TreatmentPackageSelector';
import { SpecialOffersSelector } from '../offers/SpecialOffersSelector';
import QuoteSummary from './QuoteSummary';
import { 
  PackageIcon, 
  TagIcon, 
  ShoppingCartIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  Loader2Icon, 
  UserIcon, 
  SendIcon,
  SmileIcon,
  HelpCircleIcon,
  ClipboardCheckIcon
} from 'lucide-react';

// Dental chart mock treatments
const mockTreatments = [
  { id: 'clean-1', name: 'Professional Cleaning', description: 'Complete dental cleaning', price: 75, category: 'Hygiene' },
  { id: 'xray-1', name: 'X-Ray (Full Mouth)', description: 'Complete x-ray examination', price: 120, category: 'Diagnostics' },
  { id: 'filling-1', name: 'Composite Filling', description: 'Tooth-colored filling', price: 100, category: 'Restorative' },
  { id: 'filling-2', name: 'Amalgam Filling', description: 'Silver filling', price: 85, category: 'Restorative' },
  { id: 'crown-1', name: 'Porcelain Crown', description: 'Full porcelain crown', price: 800, category: 'Restorative' },
  { id: 'root-1', name: 'Root Canal', description: 'Single root canal therapy', price: 750, category: 'Endodontics' },
  { id: 'extract-1', name: 'Simple Extraction', description: 'Simple tooth extraction', price: 120, category: 'Surgery' },
  { id: 'extract-2', name: 'Surgical Extraction', description: 'Complex surgical extraction', price: 250, category: 'Surgery' },
  { id: 'implant-1', name: 'Dental Implant', description: 'Titanium implant placement', price: 1500, category: 'Implants' },
  { id: 'implant-2', name: 'Implant Abutment', description: 'Connecting piece for implant', price: 500, category: 'Implants' },
  { id: 'implant-3', name: 'Implant Crown', description: 'Crown for dental implant', price: 1200, category: 'Implants' },
  { id: 'veneer-1', name: 'Porcelain Veneer', description: 'Single porcelain veneer', price: 900, category: 'Cosmetic' },
  { id: 'whitening-1', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 350, category: 'Cosmetic' },
  { id: 'bridge-1', name: '3-Unit Bridge', description: 'Fixed dental bridge (3 units)', price: 2500, category: 'Prosthetics' },
  { id: 'denture-1', name: 'Partial Denture', description: 'Removable partial denture', price: 1200, category: 'Prosthetics' },
  { id: 'denture-2', name: 'Complete Denture', description: 'Full removable denture', price: 1800, category: 'Prosthetics' },
  { id: 'denture-3', name: 'Implant-Supported Denture', description: 'Denture attached to implants', price: 3500, category: 'Prosthetics' },
  { id: 'perio-1', name: 'Periodontal Scaling', description: 'Deep cleaning for gum disease', price: 200, category: 'Periodontics' },
  { id: 'ortho-1', name: 'Braces (Traditional)', description: 'Complete orthodontic treatment', price: 5000, category: 'Orthodontics' },
  { id: 'ortho-2', name: 'Clear Aligners', description: 'Complete clear aligner treatment', price: 5500, category: 'Orthodontics' }
];

// Treatment categories
const treatmentCategories = [
  { id: 'all', name: 'All Treatments' },
  { id: 'Implants', name: 'Implants' },
  { id: 'Restorative', name: 'Restorative' },
  { id: 'Cosmetic', name: 'Cosmetic' },
  { id: 'Prosthetics', name: 'Prosthetics' },
  { id: 'Orthodontics', name: 'Orthodontics' },
  { id: 'Surgery', name: 'Surgery' },
  { id: 'Hygiene', name: 'Hygiene' }
];

interface ComprehensiveQuoteBuilderProps {
  initialActiveTab?: string;
  dentalChartData?: any; // Dental chart data from previous step
  preSelectedTreatments?: string[]; // Treatment IDs from dental chart
}

export function ComprehensiveQuoteBuilder({
  initialActiveTab = "quiz",
  dentalChartData,
  preSelectedTreatments = []
}: ComprehensiveQuoteBuilderProps) {
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // State for active tab (quiz, treatments, packages, offers, info)
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  
  // State for quiz progress
  const [quizStep, setQuizStep] = useState(0);
  const [quizResponses, setQuizResponses] = useState<{
    treatments: string[];
    concerns: string[];
    budget: string;
    timeline: string;
  }>({
    treatments: [],
    concerns: [],
    budget: '',
    timeline: '',
  });

  // Quote store for state management
  const {
    treatments,
    addTreatment,
    removeTreatment,
    updateQuantity,
    promoCode,
    applyPromoCode,
    clearPromoCode,
    patientInfo,
    updatePatientInfo,
    clearPatientInfo,
    selectedPackage,
    selectedOffer,
    selectPackage,
    selectOffer,
    saveQuote,
    loading,
    resetQuote
  } = useQuoteStore();

  // Get special offers and treatment packages
  const { 
    packages, 
    isLoading: isLoadingPackages, 
    selectedPackage: storeSelectedPackage,
    selectPackage: storeSelectPackage
  } = useTreatmentPackages();
  
  const { 
    offers, 
    isLoading: isLoadingOffers,
    selectedOffer: storeSelectedOffer,
    selectOffer: storeSelectOffer
  } = useSpecialOffers();

  // State for promo code input
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Handle treatment selection (add to quote)
  const handleAddTreatment = (treatment: any) => {
    // Find if treatment is already in the list
    const existingTreatment = treatments.find(t => t.id === treatment.id);
    
    if (existingTreatment) {
      // If found, increment quantity
      updateQuantity(treatment.id, existingTreatment.quantity + 1);
    } else {
      // If not found, add treatment with quantity of 1
      addTreatment({
        ...treatment,
        quantity: 1
      });
    }
    
    toast({
      title: "Treatment added",
      description: `${treatment.name} has been added to your quote`,
    });
  };

  // Handle treatment removal
  const handleRemoveTreatment = (id: string) => {
    removeTreatment(id);
    
    toast({
      title: "Treatment removed",
      description: "The treatment has been removed from your quote",
    });
  };

  // Handle treatment quantity update
  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  // Handle promo code submission
  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCodeInput.trim()) {
      toast({
        title: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingPromo(true);
    
    try {
      const success = await applyPromoCode(promoCodeInput);
      
      if (success) {
        toast({
          title: "Promo code applied",
          description: `Promo code ${promoCodeInput} has been applied to your quote`,
        });
        setPromoCodeInput('');
      } else {
        toast({
          title: "Invalid promo code",
          description: "The promo code you entered is invalid or expired",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error applying promo code",
        description: "There was a problem applying your promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPromo(false);
    }
  };

  // Handle package selection
  const handlePackageSelect = (pkg: any) => {
    selectPackage(pkg);
    if (pkg) {
      // When a package is selected, clear any selected offer
      selectOffer(null);
      // Clear any promo code
      clearPromoCode();
      
      toast({
        title: "Package selected",
        description: `${pkg.name} has been applied to your quote`,
      });
    }
  };

  // Handle offer selection
  const handleOfferSelect = (offer: any) => {
    selectOffer(offer);
    if (offer) {
      // When an offer is selected, clear any selected package
      selectPackage(null);
      // Clear any promo code
      clearPromoCode();
      
      toast({
        title: "Special offer selected",
        description: `${offer.name} has been applied to your quote`,
      });
    }
  };

  // Handle patient info update
  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updatePatientInfo({ [name]: value });
  };

  // Handle quote submission
  const handleSubmitQuote = async () => {
    if (!patientInfo || !patientInfo.firstName || !patientInfo.email) {
      toast({
        title: "Missing information",
        description: "Please provide your name and email before submitting the quote",
        variant: "destructive",
      });
      setActiveTab('patient-info');
      return;
    }
    
    if (treatments.length === 0) {
      toast({
        title: "Empty quote",
        description: "Please add at least one treatment to your quote",
        variant: "destructive",
      });
      setActiveTab('treatments');
      return;
    }
    
    try {
      // Prepare quote data to be saved
      const quoteData = {
        treatments,
        patientInfo,
        promoCode,
        packageId: selectedPackage?.id,
        offerId: selectedOffer?.id
      };
      
      const success = await saveQuote(quoteData);
      
      if (success) {
        toast({
          title: "Quote submitted successfully!",
          description: "We've received your quote request and will be in touch shortly.",
        });
        
        // Reset the form after successful submission
        resetQuote();
        setActiveTab('treatments');
      }
    } catch (error) {
      toast({
        title: "Error submitting quote",
        description: "There was a problem submitting your quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter treatments based on selected category
  const filteredTreatments = selectedCategory === 'all'
    ? mockTreatments
    : mockTreatments.filter(treatment => treatment.category === selectedCategory);

  // Check if a treatment is in the quote and return its quantity
  const getTreatmentQuantity = (id: string) => {
    const treatment = treatments.find(t => t.id === id);
    return treatment ? treatment.quantity : 0;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content area */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Build Your Dental Treatment Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
                  <TabsTrigger value="quiz" className="flex items-center gap-1">
                    <HelpCircleIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Quote Quiz</span>
                  </TabsTrigger>
                  <TabsTrigger value="treatments" className="flex items-center gap-1">
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Treatments</span>
                  </TabsTrigger>
                  <TabsTrigger value="packages" className="flex items-center gap-1">
                    <PackageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Packages</span>
                  </TabsTrigger>
                  <TabsTrigger value="offers" className="flex items-center gap-1">
                    <TagIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Special Offers</span>
                  </TabsTrigger>
                  <TabsTrigger value="patient-info" className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Patient Info</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Quote Quiz Tab */}
                <TabsContent value="quiz">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Treatment Quote Quiz</h3>
                      <div className="text-sm text-muted-foreground">
                        Step {quizStep + 1} of 4
                      </div>
                    </div>
                    
                    <div className="min-h-[400px] flex flex-col">
                      {/* Quiz step 1: Treatment types */}
                      {quizStep === 0 && (
                        <div className="space-y-4">
                          <h4 className="text-xl font-semibold">What dental treatments are you interested in?</h4>
                          <p className="text-muted-foreground">Select all that apply</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
                            {[
                              { id: 'implants', label: 'Dental Implants' },
                              { id: 'veneers', label: 'Veneers' },
                              { id: 'crowns', label: 'Crowns' },
                              { id: 'whitening', label: 'Teeth Whitening' },
                              { id: 'braces', label: 'Braces/Orthodontics' },
                              { id: 'cleaning', label: 'Professional Cleaning' },
                              { id: 'rootcanal', label: 'Root Canal' },
                              { id: 'extraction', label: 'Extractions' },
                              { id: 'dentures', label: 'Dentures' },
                              { id: 'bridges', label: 'Bridges' },
                              { id: 'fillings', label: 'Fillings' },
                              { id: 'gum', label: 'Gum Treatment' },
                            ].map(option => (
                              <div 
                                key={option.id}
                                className={`
                                  flex items-center gap-2 p-3 border rounded-md cursor-pointer
                                  ${quizResponses.treatments.includes(option.id) 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border hover:border-primary/50'
                                  }
                                `}
                                onClick={() => {
                                  setQuizResponses(prev => {
                                    // Toggle selection
                                    const newTreatments = prev.treatments.includes(option.id)
                                      ? prev.treatments.filter(id => id !== option.id)
                                      : [...prev.treatments, option.id];
                                    
                                    return {
                                      ...prev,
                                      treatments: newTreatments
                                    };
                                  });
                                }}
                              >
                                <div className={`
                                  h-5 w-5 border rounded-sm flex items-center justify-center
                                  ${quizResponses.treatments.includes(option.id) 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'border-gray-300'
                                  }
                                `}>
                                  {quizResponses.treatments.includes(option.id) && (
                                    <CheckCircleIcon className="h-4 w-4" />
                                  )}
                                </div>
                                <span>{option.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Quiz step 2: Concerns */}
                      {quizStep === 1 && (
                        <div className="space-y-4">
                          <h4 className="text-xl font-semibold">What are your main concerns?</h4>
                          <p className="text-muted-foreground">Select all that apply</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
                            {[
                              { id: 'pain', label: 'Pain or Discomfort' },
                              { id: 'appearance', label: 'Appearance of Teeth' },
                              { id: 'missing', label: 'Missing Teeth' },
                              { id: 'chewing', label: 'Difficulty Chewing' },
                              { id: 'confidence', label: 'Smile Confidence' },
                              { id: 'sensitivity', label: 'Tooth Sensitivity' },
                              { id: 'bleeding', label: 'Bleeding Gums' },
                              { id: 'preventive', label: 'Preventive Care' },
                            ].map(option => (
                              <div 
                                key={option.id}
                                className={`
                                  flex items-center gap-2 p-3 border rounded-md cursor-pointer
                                  ${quizResponses.concerns.includes(option.id) 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border hover:border-primary/50'
                                  }
                                `}
                                onClick={() => {
                                  setQuizResponses(prev => {
                                    // Toggle selection
                                    const newConcerns = prev.concerns.includes(option.id)
                                      ? prev.concerns.filter(id => id !== option.id)
                                      : [...prev.concerns, option.id];
                                    
                                    return {
                                      ...prev,
                                      concerns: newConcerns
                                    };
                                  });
                                }}
                              >
                                <div className={`
                                  h-5 w-5 border rounded-sm flex items-center justify-center
                                  ${quizResponses.concerns.includes(option.id) 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'border-gray-300'
                                  }
                                `}>
                                  {quizResponses.concerns.includes(option.id) && (
                                    <CheckCircleIcon className="h-4 w-4" />
                                  )}
                                </div>
                                <span>{option.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Quiz step 3: Budget */}
                      {quizStep === 2 && (
                        <div className="space-y-4">
                          <h4 className="text-xl font-semibold">What is your approximate budget?</h4>
                          <p className="text-muted-foreground">This helps us recommend suitable treatment options</p>
                          
                          <div className="space-y-3 py-4">
                            {[
                              { id: 'budget-1', value: 'under-1000', label: 'Under £1,000' },
                              { id: 'budget-2', value: '1000-3000', label: '£1,000 - £3,000' },
                              { id: 'budget-3', value: '3000-5000', label: '£3,000 - £5,000' },
                              { id: 'budget-4', value: '5000-10000', label: '£5,000 - £10,000' },
                              { id: 'budget-5', value: 'over-10000', label: 'Over £10,000' },
                              { id: 'budget-6', value: 'flexible', label: 'Flexible / Not sure yet' },
                            ].map(option => (
                              <div 
                                key={option.id}
                                className={`
                                  flex items-center gap-2 p-3 border rounded-md cursor-pointer
                                  ${quizResponses.budget === option.value 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border hover:border-primary/50'
                                  }
                                `}
                                onClick={() => {
                                  setQuizResponses(prev => ({
                                    ...prev,
                                    budget: option.value
                                  }));
                                }}
                              >
                                <div className={`
                                  h-5 w-5 border rounded-full flex items-center justify-center
                                  ${quizResponses.budget === option.value 
                                    ? 'border-primary' 
                                    : 'border-gray-300'
                                  }
                                `}>
                                  {quizResponses.budget === option.value && (
                                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                                  )}
                                </div>
                                <span>{option.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Quiz step 4: Timeline */}
                      {quizStep === 3 && (
                        <div className="space-y-4">
                          <h4 className="text-xl font-semibold">When are you planning to get treatment?</h4>
                          <p className="text-muted-foreground">This helps us prioritize your request</p>
                          
                          <div className="space-y-3 py-4">
                            {[
                              { id: 'time-1', value: 'asap', label: 'As soon as possible' },
                              { id: 'time-2', value: 'within-month', label: 'Within a month' },
                              { id: 'time-3', value: '1-3-months', label: '1-3 months' },
                              { id: 'time-4', value: '3-6-months', label: '3-6 months' },
                              { id: 'time-5', value: 'just-researching', label: 'Just researching options' },
                            ].map(option => (
                              <div 
                                key={option.id}
                                className={`
                                  flex items-center gap-2 p-3 border rounded-md cursor-pointer
                                  ${quizResponses.timeline === option.value 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border hover:border-primary/50'
                                  }
                                `}
                                onClick={() => {
                                  setQuizResponses(prev => ({
                                    ...prev,
                                    timeline: option.value
                                  }));
                                }}
                              >
                                <div className={`
                                  h-5 w-5 border rounded-full flex items-center justify-center
                                  ${quizResponses.timeline === option.value 
                                    ? 'border-primary' 
                                    : 'border-gray-300'
                                  }
                                `}>
                                  {quizResponses.timeline === option.value && (
                                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                                  )}
                                </div>
                                <span>{option.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Quiz Results */}
                      {quizStep === 4 && (
                        <div className="space-y-6">
                          <div className="text-center">
                            <h4 className="text-2xl font-semibold mb-2">Your Personalized Quote Recommendation</h4>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                              Based on your responses, we've analyzed the best options for your dental treatment needs.
                            </p>
                          </div>
                          
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <ClipboardCheckIcon className="h-6 w-6 text-primary" />
                              <h5 className="text-lg font-medium">Summary of Your Preferences</h5>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <h6 className="font-medium mb-1">Treatments of Interest</h6>
                                <div className="flex flex-wrap gap-2">
                                  {quizResponses.treatments.length > 0 ? (
                                    quizResponses.treatments.map(treatment => (
                                      <span key={treatment} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary">
                                        {treatment.charAt(0).toUpperCase() + treatment.slice(1)}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground">No treatments selected</span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h6 className="font-medium mb-1">Main Concerns</h6>
                                <div className="flex flex-wrap gap-2">
                                  {quizResponses.concerns.length > 0 ? (
                                    quizResponses.concerns.map(concern => (
                                      <span key={concern} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary">
                                        {concern.charAt(0).toUpperCase() + concern.slice(1)}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground">No concerns selected</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h6 className="font-medium mb-1">Budget Range</h6>
                                  <span className="text-sm">
                                    {quizResponses.budget ? quizResponses.budget.replace(/-/g, ' ').toUpperCase() : 'Not specified'}
                                  </span>
                                </div>
                                
                                <div>
                                  <h6 className="font-medium mb-1">Treatment Timeline</h6>
                                  <span className="text-sm">
                                    {quizResponses.timeline ? quizResponses.timeline.replace(/-/g, ' ').toUpperCase() : 'Not specified'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <h5 className="text-lg font-medium mb-4">Recommended Next Steps</h5>
                            
                            <div className="space-y-4">
                              {quizResponses.treatments.includes('implants') && (
                                <div 
                                  className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => {
                                    setActiveTab('packages');
                                    // Focus on implant packages
                                  }}
                                >
                                  <h6 className="font-medium">Explore Dental Implant Packages</h6>
                                  <p className="text-sm text-muted-foreground">We offer special packages for dental implants that can save you money.</p>
                                </div>
                              )}
                              
                              {(quizResponses.treatments.includes('veneers') || quizResponses.treatments.includes('crowns')) && (
                                <div 
                                  className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => {
                                    setActiveTab('offers');
                                    // Focus on cosmetic special offers
                                  }}
                                >
                                  <h6 className="font-medium">Check Our Cosmetic Dentistry Special Offers</h6>
                                  <p className="text-sm text-muted-foreground">We have ongoing promotions for cosmetic treatments like veneers and crowns.</p>
                                </div>
                              )}
                              
                              <div 
                                className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => {
                                  setActiveTab('treatments');
                                }}
                              >
                                <h6 className="font-medium">Build Your Custom Treatment Plan</h6>
                                <p className="text-sm text-muted-foreground">Select individual treatments based on your exact needs.</p>
                              </div>
                              
                              <div 
                                className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => {
                                  setActiveTab('patient-info');
                                }}
                              >
                                <h6 className="font-medium">Get a Personalized Consultation</h6>
                                <p className="text-sm text-muted-foreground">Fill in your details for a customized treatment plan from our specialists.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-auto pt-6 flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setQuizStep(Math.max(0, quizStep - 1))}
                          disabled={quizStep === 0}
                        >
                          Previous
                        </Button>
                        
                        <Button
                          onClick={() => {
                            if (quizStep < 4) {
                              // Validate current step
                              if (quizStep === 0 && quizResponses.treatments.length === 0) {
                                toast({
                                  title: "Please select at least one treatment",
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              if (quizStep === 2 && !quizResponses.budget) {
                                toast({
                                  title: "Please select a budget range",
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              if (quizStep === 3 && !quizResponses.timeline) {
                                toast({
                                  title: "Please select a timeline",
                                  variant: "destructive",
                                });
                                return;
                              }
                              
                              setQuizStep(quizStep + 1);
                            } else {
                              // Create recommended treatments based on quiz responses
                              const recommendedTreatments = [];
                              
                              // Map quiz treatment selections to actual treatment IDs
                              const treatmentMap = {
                                'implants': ['implant-1', 'implant-2', 'implant-3'],
                                'veneers': ['veneer-1'],
                                'crowns': ['crown-1'],
                                'whitening': ['whitening-1'],
                                'braces': ['ortho-1', 'ortho-2'],
                                'cleaning': ['clean-1', 'perio-1'],
                                'rootcanal': ['root-1'],
                                'extraction': ['extract-1', 'extract-2'],
                                'dentures': ['denture-1', 'denture-2', 'denture-3'],
                                'bridges': ['bridge-1'],
                                'fillings': ['filling-1', 'filling-2'],
                                'gum': ['perio-1']
                              };
                              
                              // Add a sample treatment for each selected category
                              quizResponses.treatments.forEach(treatmentType => {
                                const treatmentIds = treatmentMap[treatmentType] || [];
                                if (treatmentIds.length > 0) {
                                  // Select the first treatment from each category
                                  const treatmentId = treatmentIds[0];
                                  const treatment = mockTreatments.find(t => t.id === treatmentId);
                                  
                                  if (treatment) {
                                    // Add the treatment to the quote
                                    recommendedTreatments.push(treatment);
                                  }
                                }
                              });
                              
                              // Add treatments to the quote
                              recommendedTreatments.forEach(treatment => {
                                handleAddTreatment(treatment);
                              });
                              
                              // Auto-apply promo code if budget is tight
                              if (quizResponses.budget === 'under-1000' || quizResponses.budget === '1000-3000') {
                                // Apply a discount code automatically
                                applyPromoCode('NEWPATIENT');
                              }
                              
                              // Move to treatments tab
                              setActiveTab('treatments');
                              
                              toast({
                                title: "Quote recommendations added",
                                description: "We've added some recommended treatments based on your preferences",
                              });
                            }
                          }}
                        >
                          {quizStep < 4 ? 'Next' : 'View Recommended Treatments'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Treatments Tab */}
                <TabsContent value="treatments">
                  <div className="space-y-6">
                    {/* Categories selector */}
                    <div className="flex flex-wrap gap-2">
                      {treatmentCategories.map(category => (
                        <Button 
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    {/* Treatments grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTreatments.map(treatment => {
                        const quantity = getTreatmentQuantity(treatment.id);
                        
                        return (
                          <Card key={treatment.id} className="overflow-hidden">
                            <CardHeader className="p-4 pb-0">
                              <CardTitle className="text-base">{treatment.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{treatment.description}</p>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <div className="flex justify-between items-center">
                                <p className="font-bold">£{treatment.price}</p>
                                
                                {quantity > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-8 w-8"
                                      onClick={() => handleQuantityChange(treatment.id, Math.max(0, quantity - 1))}
                                    >
                                      -
                                    </Button>
                                    <span className="w-6 text-center">{quantity}</span>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-8 w-8"
                                      onClick={() => handleQuantityChange(treatment.id, quantity + 1)}
                                    >
                                      +
                                    </Button>
                                  </div>
                                ) : (
                                  <Button onClick={() => handleAddTreatment(treatment)}>
                                    Add
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    {/* Selected treatments */}
                    {treatments.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Selected Treatments</h3>
                        <div className="space-y-2">
                          {treatments.map(treatment => (
                            <div 
                              key={treatment.id} 
                              className="flex justify-between items-center p-3 bg-secondary rounded-md"
                            >
                              <div>
                                <p className="font-medium">{treatment.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  £{treatment.price} x {treatment.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">
                                  £{(treatment.price * treatment.quantity).toFixed(2)}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleRemoveTreatment(treatment.id)}
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Promo code input */}
                    {!promoCode && !selectedPackage && !selectedOffer && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Have a Promo Code?</h3>
                        <form 
                          className="flex gap-2" 
                          onSubmit={handlePromoCodeSubmit}
                        >
                          <Input
                            className="max-w-xs"
                            placeholder="Enter promo code"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                          />
                          <Button 
                            type="submit"
                            disabled={isSubmittingPromo || !promoCodeInput.trim()}
                          >
                            {isSubmittingPromo ? (
                              <Loader2Icon className="h-4 w-4 animate-spin" />
                            ) : (
                              'Apply'
                            )}
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Packages Tab */}
                <TabsContent value="packages">
                  <TreatmentPackageSelector
                    packages={packages}
                    selectedPackageId={selectedPackage?.id}
                    onSelectPackage={handlePackageSelect}
                    isLoading={isLoadingPackages}
                  />
                </TabsContent>
                
                {/* Special Offers Tab */}
                <TabsContent value="offers">
                  <SpecialOffersSelector
                    offers={offers}
                    selectedOfferId={selectedOffer?.id}
                    onSelectOffer={handleOfferSelect}
                    isLoading={isLoadingOffers}
                  />
                </TabsContent>
                
                {/* Patient Info Tab */}
                <TabsContent value="patient-info">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Your Information</h3>
                      <p className="text-muted-foreground mb-4">
                        Please provide your contact information so we can send you the quote
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">
                          First Name*
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={patientInfo?.firstName || ''}
                          onChange={handlePatientInfoChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={patientInfo?.lastName || ''}
                          onChange={handlePatientInfoChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email*
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={patientInfo?.email || ''}
                          onChange={handlePatientInfoChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={patientInfo?.phone || ''}
                          onChange={handlePatientInfoChange}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="preferredDate" className="text-sm font-medium">
                          Preferred Date
                        </label>
                        <Input
                          id="preferredDate"
                          name="preferredDate"
                          type="date"
                          value={patientInfo?.preferredDate || ''}
                          onChange={handlePatientInfoChange}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="notes" className="text-sm font-medium">
                          Additional Notes
                        </label>
                        <Input
                          id="notes"
                          name="notes"
                          value={patientInfo?.notes || ''}
                          onChange={handlePatientInfoChange}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => clearPatientInfo()}
                      >
                        Clear Info
                      </Button>

                      <div className="space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab('treatments')}
                        >
                          Back to Treatments
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={handleSubmitQuote}
                          disabled={!patientInfo?.email || !patientInfo?.firstName || treatments.length === 0}
                        >
                          Review Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Submit quote button */}
              <div className="flex justify-between items-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => resetQuote()}
                >
                  Reset Quote
                </Button>
                <Button
                  className="gap-2"
                  size="lg"
                  onClick={handleSubmitQuote}
                  disabled={loading.saveQuote || treatments.length === 0}
                >
                  {loading.saveQuote ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4" />
                      Submit Quote
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar summary */}
        <div className="md:w-80">
          <div className="md:sticky md:top-4 space-y-4">
            <QuoteSummary />
            
            {/* Navigation guidance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <SmileIcon className="mr-2 h-5 w-5" />
                  Quick Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ShoppingCartIcon className="h-4 w-4 mt-0.5 text-primary" />
                    <span><strong>Treatments:</strong> Select individual dental treatments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <PackageIcon className="h-4 w-4 mt-0.5 text-primary" />
                    <span><strong>Packages:</strong> Pre-bundled treatments at a discount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TagIcon className="h-4 w-4 mt-0.5 text-primary" />
                    <span><strong>Special Offers:</strong> Time-limited promotional discounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <UserIcon className="h-4 w-4 mt-0.5 text-primary" />
                    <span><strong>Patient Info:</strong> Provide your contact details</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}