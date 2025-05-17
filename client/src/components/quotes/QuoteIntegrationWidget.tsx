import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import TreatmentList from './TreatmentList';
import { 
  formatPrice, 
  formatPriceInCurrency,
  CurrencyCode
} from '@/utils/format-utils';
import TreatmentPackageService, { 
  TreatmentPackage, 
  AdditionalService 
} from '@/services/treatment-package-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Package, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  clinicId?: string;
  clinicName?: string;
  imageUrl?: string;
  quantity?: number;
}

interface PromoValidationResult {
  isValid: boolean;
  code: string;
  message: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  isPackage?: boolean;
  packageId?: string;
}

interface QuoteIntegrationWidgetProps {
  initialTreatments?: Treatment[];
  initialPromoCode?: string;
  onQuoteSaved?: (quoteData: any) => void;
  currency?: CurrencyCode;
  portalType?: 'patient' | 'clinic' | 'admin';
  mode?: 'create' | 'edit' | 'view';
}

const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  initialTreatments = [],
  initialPromoCode = '',
  onQuoteSaved,
  currency = 'USD',
  portalType = 'patient',
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>(initialTreatments);
  const [loadingTreatments, setLoadingTreatments] = useState<boolean>(true);
  const [currentPackage, setCurrentPackage] = useState<TreatmentPackage | null>(null);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [showPackageDialog, setShowPackageDialog] = useState<boolean>(false);
  const [pendingPackage, setPendingPackage] = useState<TreatmentPackage | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(initialPromoCode || null);
  const [promoInput, setPromoInput] = useState<string>('');
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);
  const [promoValidationResult, setPromoValidationResult] = useState<PromoValidationResult | null>(null);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  // Fetch treatments from API
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        // For demonstration, using mock data
        const mockTreatments: Treatment[] = [
          {
            id: '1',
            name: 'Dental Implant',
            description: 'Titanium post surgically placed into the jawbone',
            price: 1200,
            category: 'Implants'
          },
          {
            id: '2',
            name: 'Porcelain Crown',
            description: 'Custom-made porcelain cap placed over a damaged tooth',
            price: 800,
            category: 'Crowns'
          },
          {
            id: '3',
            name: 'Root Canal',
            description: 'Removal of infected pulp from inside the tooth',
            price: 650,
            category: 'Endodontics'
          },
          {
            id: '4',
            name: 'Teeth Whitening',
            description: 'Professional whitening treatment for brighter smile',
            price: 350,
            category: 'Cosmetic'
          },
          {
            id: '5',
            name: 'Dental Veneers (per tooth)',
            description: 'Thin shells custom-made to cover front surface of teeth',
            price: 900,
            category: 'Cosmetic'
          }
        ];
        
        setTreatments(mockTreatments);
        setLoadingTreatments(false);
      } catch (error) {
        console.error('Error fetching treatments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load treatments. Please try again.',
          variant: 'destructive',
        });
        setLoadingTreatments(false);
      }
    };
    
    fetchTreatments();
  }, [toast]);
  
  // Apply promo code
  const handleApplyPromoCode = async (code?: string) => {
    const codeToApply = code || promoInput;
    if (!codeToApply) return;
    
    setIsValidatingPromo(true);
    
    try {
      // First check if this is a package promo code
      const packageData = await TreatmentPackageService.getPackageByPromoCode(codeToApply);
      
      if (packageData) {
        // It's a package promo code
        if (selectedTreatments.length > 0) {
          // Ask if user wants to replace existing treatments
          setPendingPackage(packageData);
          setShowPackageDialog(true);
          setIsValidatingPromo(false);
          return;
        } else {
          // No existing treatments, apply package directly
          applyTreatmentPackage(packageData);
        }
      } else {
        // For standard promo codes, using mock validation
        const mockValidation = (code: string): PromoValidationResult => {
          // Define valid promo codes for demo
          const validCodes: Record<string, PromoValidationResult> = {
            'SUMMER15': {
              isValid: true,
              code: 'SUMMER15',
              message: 'Summer discount applied successfully!',
              discountType: 'percentage',
              discountValue: 15
            },
            'DENTAL25': {
              isValid: true,
              code: 'DENTAL25',
              message: 'Dental procedure discount applied!',
              discountType: 'percentage',
              discountValue: 25
            },
            'NEWPATIENT': {
              isValid: true,
              code: 'NEWPATIENT',
              message: 'New patient discount applied!',
              discountType: 'percentage',
              discountValue: 20
            },
            'TEST10': {
              isValid: true,
              code: 'TEST10',
              message: 'Test discount applied!',
              discountType: 'percentage',
              discountValue: 10
            },
            'FREECONSULT': {
              isValid: true,
              code: 'FREECONSULT',
              message: 'Free consultation added to your treatment plan!',
              discountType: 'fixed_amount',
              discountValue: 0
            }
          };
          
          return validCodes[code.toUpperCase()] || {
            isValid: false,
            code: code,
            message: 'Invalid promo code. Please try another.',
            discountType: 'percentage',
            discountValue: 0
          };
        };
        
        const result = mockValidation(codeToApply);
        setPromoValidationResult(result);
        
        if (result.isValid) {
          setPromoCode(result.code);
          toast({
            title: 'Promo Code Applied',
            description: result.message,
            variant: 'success',
          });
        } else {
          toast({
            title: 'Invalid Promo Code',
            description: result.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate promo code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsValidatingPromo(false);
      setPromoInput('');
    }
  };
  
  // Function to apply a treatment package
  const applyTreatmentPackage = (packageData: TreatmentPackage) => {
    // Set the package treatments as selected treatments
    const packageTreatments = packageData.treatments.map(treatment => ({
      ...treatment,
      price: treatment.price * (treatment.quantity || 1) // Adjust price for quantity
    }));
    
    setSelectedTreatments(packageTreatments);
    setCurrentPackage(packageData);
    setAdditionalServices(packageData.additionalServices);
    
    // Set promo code and validation result
    setPromoCode(packageData.promoCode);
    setPromoValidationResult({
      isValid: true,
      code: packageData.promoCode,
      message: `${packageData.name} package applied successfully!`,
      discountType: 'percentage',
      discountValue: packageData.discountPercentage,
      isPackage: true,
      packageId: packageData.id
    });
    
    toast({
      title: 'Package Applied',
      description: `${packageData.name} has been applied to your quote.`,
      variant: 'default',
    });
    
    setIsValidatingPromo(false);
  };
  
  // Clear promo code
  const handleClearPromoCode = () => {
    setPromoCode(null);
    setPromoValidationResult(null);
    setCurrentPackage(null);
    setAdditionalServices([]);
    
    toast({
      title: 'Promo Code Removed',
      description: 'Promo code has been removed from your quote.',
    });
  };
  
  // Handle adding a treatment
  const handleAddTreatment = (treatment: Treatment) => {
    setSelectedTreatments(prev => [...prev, treatment]);
  };
  
  // Handle removing a treatment
  const handleRemoveTreatment = (treatmentId: string) => {
    setSelectedTreatments(prev => prev.filter(t => t.id !== treatmentId));
  };
  
  // Calculate quote totals
  const calculateTotals = () => {
    const subtotal = selectedTreatments.reduce((sum, item) => sum + item.price, 0);
    let discount = 0;
    
    if (promoValidationResult?.isValid) {
      if (promoValidationResult.discountType === 'percentage') {
        discount = subtotal * (promoValidationResult.discountValue / 100);
      } else {
        discount = promoValidationResult.discountValue;
      }
    }
    
    const total = subtotal - discount;
    
    return { subtotal, discount, total };
  };
  
  // Handle patient info input
  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle quote submission
  const handleSubmitQuote = () => {
    // Validate required fields
    if (!patientInfo.name || !patientInfo.email || !patientInfo.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all required patient information fields.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create quote data
    const { subtotal, discount, total } = calculateTotals();
    const quoteData = {
      treatments: selectedTreatments,
      patientInfo,
      promoCode,
      subtotal,
      discount,
      total,
      currency,
      createdAt: new Date().toISOString()
    };
    
    // Call the onQuoteSaved callback if provided
    if (onQuoteSaved) {
      onQuoteSaved(quoteData);
    }
    
    toast({
      title: 'Quote Saved',
      description: 'Your dental treatment quote has been saved successfully.',
      variant: 'success',
    });
    
    // Reset the form
    setSelectedTreatments([]);
    setPromoCode(null);
    setPromoValidationResult(null);
    setPatientInfo({
      name: '',
      email: '',
      phone: '',
      notes: ''
    });
    setStep(1);
  };
  
  // Navigation between steps
  const goToNextStep = () => {
    if (step === 1 && selectedTreatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    setStep(prev => prev + 1);
  };
  
  const goToPreviousStep = () => {
    setStep(prev => prev - 1);
  };
  
  const { subtotal, discount, total } = calculateTotals();
  
  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 1: // Select Treatments
        return (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold">Select Dental Treatments</h2>
              <p className="text-muted-foreground">
                Choose the dental treatments you're interested in to get a personalized quote.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Available Treatments</h3>
                <TreatmentList
                  treatments={treatments}
                  onSelectTreatment={handleAddTreatment}
                  selectedTreatments={selectedTreatments}
                  loading={loadingTreatments}
                  currency={currency}
                />
              </div>
              
              {selectedTreatments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Selected Treatments</h3>
                  <div className="border rounded-md p-4">
                    <ul className="divide-y">
                      {selectedTreatments.map(treatment => (
                        <li key={treatment.id} className="py-3 flex justify-between">
                          <div>
                            <p className="font-medium">{treatment.name}</p>
                            <p className="text-sm text-muted-foreground">{treatment.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPriceInCurrency(treatment.price, currency)}</p>
                            <button 
                              onClick={() => handleRemoveTreatment(treatment.id)}
                              className="text-sm text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold">{formatPriceInCurrency(subtotal, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 2: // Apply Promo Code (Optional)
        return (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold">Apply Promo Code</h2>
              <p className="text-muted-foreground">
                Have a promo code? Apply it to get a discount on your treatments.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 border rounded-md px-3 py-2"
                    disabled={!!promoCode || isValidatingPromo}
                  />
                  
                  {promoCode ? (
                    <button
                      onClick={handleClearPromoCode}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 py-2 rounded-md"
                      disabled={isValidatingPromo}
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyPromoCode()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md"
                      disabled={!promoInput || isValidatingPromo}
                    >
                      {isValidatingPromo ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                
                {promoValidationResult && (
                  <div className={`p-3 rounded-md ${promoValidationResult.isValid ? 'bg-success/20' : 'bg-destructive/20'}`}>
                    <p className={`text-sm ${promoValidationResult.isValid ? 'text-success-foreground' : 'text-destructive-foreground'}`}>
                      {promoValidationResult.message}
                    </p>
                    
                    {promoValidationResult.isValid && promoValidationResult.discountType === 'percentage' && (
                      <p className="text-sm font-medium mt-1">
                        You save {promoValidationResult.discountValue}% 
                        ({formatPriceInCurrency(discount, currency)})
                      </p>
                    )}
                    
                    {promoValidationResult.isValid && promoValidationResult.isPackage && currentPackage && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Treatment Package Applied</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{currentPackage.description}</p>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Regular Price:</span>
                            <span className="line-through text-muted-foreground">
                              {formatPriceInCurrency(currentPackage.regularPrice, currency)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Special Price:</span>
                            <span className="font-semibold text-primary">
                              {formatPriceInCurrency(currentPackage.discountedPrice, currency)}
                            </span>
                          </div>
                        </div>
                        
                        {additionalServices.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium mb-1">Includes:</p>
                            <ul className="grid grid-cols-1 gap-1">
                              {additionalServices.filter(s => s.included).map((service, idx) => (
                                <li key={idx} className="text-xs flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-500" />
                                  <span>{service.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-3">Quote Summary</h3>
                <ul className="divide-y">
                  {selectedTreatments.map(treatment => (
                    <li key={treatment.id} className="py-2 flex justify-between">
                      <span>{treatment.name}</span>
                      <span>{formatPriceInCurrency(treatment.price, currency)}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPriceInCurrency(subtotal, currency)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount ({promoCode}):</span>
                      <span>-{formatPriceInCurrency(discount, currency)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatPriceInCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3: // Patient Information
        return (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold">Patient Information</h2>
              <p className="text-muted-foreground">
                Please provide your contact information to complete your quote.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={patientInfo.name}
                      onChange={handlePatientInfoChange}
                      required
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={patientInfo.email}
                      onChange={handlePatientInfoChange}
                      required
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="phone">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={patientInfo.phone}
                      onChange={handlePatientInfoChange}
                      required
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="notes">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={patientInfo.notes}
                      onChange={handlePatientInfoChange}
                      className="w-full border rounded-md px-3 py-2 min-h-[100px]"
                    />
                  </div>
                </form>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-3">Quote Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Treatments:</span>
                    <span>{selectedTreatments.length} items</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPriceInCurrency(subtotal, currency)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount ({promoCode}):</span>
                      <span>-{formatPriceInCurrency(discount, currency)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatPriceInCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4: // Review & Confirm
        return (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold">Review & Confirm</h2>
              <p className="text-muted-foreground">
                Please review your quote details before confirming.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-3">Selected Treatments</h3>
                <ul className="divide-y">
                  {selectedTreatments.map(treatment => (
                    <li key={treatment.id} className="py-2 flex justify-between">
                      <div>
                        <p className="font-medium">{treatment.name}</p>
                        <p className="text-sm text-muted-foreground">{treatment.category}</p>
                      </div>
                      <span>{formatPriceInCurrency(treatment.price, currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{patientInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{patientInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{patientInfo.phone}</p>
                  </div>
                  {patientInfo.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p>{patientInfo.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-3">Quote Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPriceInCurrency(subtotal, currency)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount ({promoCode}):</span>
                      <span>-{formatPriceInCurrency(discount, currency)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatPriceInCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-md p-4">
                <p className="text-sm">
                  By confirming this quote, you agree to our terms and conditions. This quote is valid for 30 days.
                  A representative will contact you within 24 hours to discuss your treatment options and answer any questions.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-background rounded-lg border shadow-sm p-6 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Select Treatments', 'Promo Code', 'Patient Information', 'Confirm'].map((stepName, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${index + 1 <= step ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index + 1 < step 
                  ? 'bg-primary text-primary-foreground' 
                  : index + 1 === step 
                    ? 'border-2 border-primary text-primary' 
                    : 'border-2 border-muted text-muted-foreground'
              }`}>
                {index + 1 < step ? '✓' : index + 1}
              </div>
              <span className={`text-xs sm:text-sm ${index + 1 === step ? 'font-medium' : ''}`}>{stepName}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute h-1 bg-muted inset-x-0 top-0"></div>
          <div 
            className="absolute h-1 bg-primary inset-y-0 left-0 transition-all duration-300"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Current Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={goToPreviousStep}
          className="px-4 py-2 border rounded-md bg-background hover:bg-muted transition-colors"
          disabled={step === 1}
        >
          Back
        </button>
        
        {step < 4 ? (
          <button
            onClick={goToNextStep}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmitQuote}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Confirm Quote
          </button>
        )}
      </div>
      
      {/* Treatment Package Dialog */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Apply Treatment Package
            </DialogTitle>
            <DialogDescription>
              This promo code will apply a complete treatment package. This will replace your current treatment selection.
            </DialogDescription>
          </DialogHeader>
          
          {pendingPackage && (
            <div className="py-4">
              <h3 className="font-semibold text-lg mb-2">{pendingPackage.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{pendingPackage.description}</p>
              
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Regular Price:</span>
                    <span className="line-through text-muted-foreground">
                      {formatPriceInCurrency(pendingPackage.regularPrice, pendingPackage.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Package Price:</span>
                    <span className="font-bold text-lg text-primary">
                      {formatPriceInCurrency(pendingPackage.discountedPrice, pendingPackage.currency)}
                    </span>
                  </div>
                  <div className="flex justify-end mt-1">
                    <Badge variant="outline" className="bg-primary/10">
                      Save {pendingPackage.discountPercentage}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <h4 className="font-medium">Included Treatments:</h4>
                <ul className="list-disc list-inside text-sm space-y-1.5">
                  {pendingPackage.treatments.map(treatment => (
                    <li key={treatment.id} className="flex justify-between">
                      <span>{treatment.name} {treatment.quantity && treatment.quantity > 1 ? `(×${treatment.quantity})` : ''}</span>
                      <span className="font-medium">{formatPriceInCurrency(treatment.price * (treatment.quantity || 1), pendingPackage.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {pendingPackage.additionalServices.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Additional Services:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1.5">
                    {pendingPackage.additionalServices.map((service, index) => (
                      <li key={index} className="flex items-center">
                        <span>{service.name}</span>
                        {service.included ? (
                          <Check className="text-green-500 h-4 w-4 ml-2" />
                        ) : (
                          <span className="text-muted-foreground ml-2">(Not included)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowPackageDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (pendingPackage) {
                  applyTreatmentPackage(pendingPackage);
                  setPendingPackage(null);
                  setShowPackageDialog(false);
                }
              }} 
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Apply Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { QuoteIntegrationWidget };
export default QuoteIntegrationWidget;