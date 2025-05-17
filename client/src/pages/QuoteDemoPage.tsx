import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuoteIntegrationWidget from '@/components/quotes/QuoteIntegrationWidget';
import TreatmentList from '@/components/quotes/TreatmentList';
import { useToast } from '@/hooks/use-toast';
import { 
  formatPrice, 
  formatPriceInCurrency,
  CurrencyCode 
} from '@/utils/format-utils';

interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

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
  }
];

const QuoteDemoPage = () => {
  const { toast } = useToast();
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);
  const [promoValidationResult, setPromoValidationResult] = useState<any>(null);
  
  const handleApplyPromoCode = (code: string) => {
    setIsValidatingPromo(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (code === 'DENTAL25' || code === 'SUMMER15' || code === 'TEST10') {
        setPromoCode(code);
        setPromoValidationResult({
          isValid: true,
          code,
          message: 'Promo code applied successfully!',
          discountType: 'percentage',
          discountValue: code === 'DENTAL25' ? 25 : code === 'SUMMER15' ? 15 : 10
        });
        
        toast({
          title: 'Success',
          description: `Promo code ${code} applied successfully.`,
          variant: 'success',
        });
      } else {
        setPromoValidationResult({
          isValid: false,
          code,
          message: 'Invalid promo code. Please try again.',
          discountType: 'percentage',
          discountValue: 0
        });
        
        toast({
          title: 'Error',
          description: 'Invalid promo code. Please try again.',
          variant: 'destructive',
        });
      }
      
      setIsValidatingPromo(false);
    }, 1000);
  };
  
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    
    toast({
      title: 'Currency Changed',
      description: `Prices are now displayed in ${newCurrency}.`,
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          MyDentalFly Quote System
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern, interactive quote builder for dental treatments. Get an instant price estimate for your dental procedures.
        </p>
      </header>
      
      <div className="mb-6 flex justify-end space-x-2">
        <div className="border rounded-md overflow-hidden flex">
          {(['USD', 'EUR', 'GBP'] as CurrencyCode[]).map((curr) => (
            <button
              key={curr}
              onClick={() => handleCurrencyChange(curr)}
              className={`px-4 py-2 text-sm font-medium ${
                currency === curr 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>
      
      <Tabs defaultValue="complete">
        <TabsList className="w-full border-b mb-8 grid grid-cols-3">
          <TabsTrigger value="complete">Complete Widget</TabsTrigger>
          <TabsTrigger value="treatments">Treatment List</TabsTrigger>
          <TabsTrigger value="promo">URL Promo Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="complete" className="space-y-8">
          <div className="bg-muted/30 p-4 rounded-md mb-6">
            <h2 className="text-xl font-semibold mb-2">Complete Quote Integration Widget</h2>
            <p className="text-muted-foreground">
              This is the full quote integration widget that guides patients through the entire process:
              selecting treatments, applying promo codes, entering patient information, and generating a final quote.
            </p>
          </div>
          
          <QuoteIntegrationWidget 
            currency={currency}
            portalType="patient"
            mode="create"
            onQuoteSaved={(data) => {
              console.log('Quote data:', data);
              toast({
                title: 'Quote Saved',
                description: 'Your quote has been saved successfully.',
                variant: 'success',
              });
            }}
          />
        </TabsContent>
        
        <TabsContent value="treatments" className="space-y-8">
          <div className="bg-muted/30 p-4 rounded-md mb-6">
            <h2 className="text-xl font-semibold mb-2">Treatment Selection Component</h2>
            <p className="text-muted-foreground">
              This component displays available dental treatments with filtering and selection capabilities.
              It can be used as a standalone component in various contexts.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Available Dental Treatments</h3>
            <TreatmentList
              treatments={mockTreatments}
              currency={currency}
              showActions={false}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="promo" className="space-y-8">
          <div className="bg-muted/30 p-4 rounded-md mb-6">
            <h2 className="text-xl font-semibold mb-2">URL Promo Code Detection</h2>
            <p className="text-muted-foreground">
              This demo shows how the system can detect and apply promo codes from the URL.
              Try appending <span className="font-mono bg-muted px-1">?code=DENTAL25</span> to the URL.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">URL Promo Code Demo</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Try these sample promo codes:</h4>
                <div className="flex flex-wrap gap-2">
                  {['DENTAL25', 'SUMMER15', 'TEST10', 'INVALID'].map((code) => (
                    <button
                      key={code}
                      onClick={() => handleApplyPromoCode(code)}
                      className="px-3 py-1 text-sm rounded bg-primary/10 hover:bg-primary/20 text-primary font-medium"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Current Status:</h4>
                {isValidatingPromo ? (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                    <span>Validating promo code...</span>
                  </div>
                ) : promoCode ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-success">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Promo code <span className="font-mono">{promoCode}</span> is active!</span>
                    </div>
                    <div>
                      <p>Discount: {promoValidationResult?.discountValue}%</p>
                      <p>When applied to a $1000 treatment: Save {formatPriceInCurrency(1000 * (promoValidationResult?.discountValue / 100), currency)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No promo code applied. Click one of the sample codes above or add a code to the URL.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>MyDentalFly Quote System &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">Available promo codes: DENTAL25 (25% off), SUMMER15 (15% off), TEST10 (10% off)</p>
      </footer>
    </div>
  );
};

export default QuoteDemoPage;