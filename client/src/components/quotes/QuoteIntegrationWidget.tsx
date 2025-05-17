import { useState, useEffect } from 'react';
import { useQuoteSystem } from '@/hooks/use-quote-system';
import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';
import { useToast } from '@/hooks/use-toast';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import TreatmentList from './TreatmentList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Loader2, RefreshCw, Check, X, Tag } from 'lucide-react';

interface QuoteIntegrationWidgetProps {
  showTreatmentSelector?: boolean;
  showPromoSection?: boolean;
  showCurrencySelector?: boolean;
  showQuoteActions?: boolean;
  initialTreatments?: string[];
  initialPromoCode?: string;
  initialCurrency?: string;
  isCompact?: boolean;
  applyCodeAutomatically?: boolean;
}

/**
 * A comprehensive widget for the Quote Integration System
 * 
 * This component provides a complete interface for managing dental treatment quotes,
 * including treatment selection, promo code application, and currency conversion.
 */
const QuoteIntegrationWidget: React.FC<QuoteIntegrationWidgetProps> = ({
  showTreatmentSelector = true,
  showPromoSection = true,
  showCurrencySelector = true,
  showQuoteActions = true,
  initialTreatments = [],
  initialPromoCode = '',
  initialCurrency = 'USD',
  isCompact = false,
  applyCodeAutomatically = false
}) => {
  // Get quote system hook
  const quoteSystem = useQuoteSystem();
  
  // Local state
  const [promoCodeInput, setPromoCodeInput] = useState(initialPromoCode);
  const [currency, setCurrency] = useState(initialCurrency);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>('');
  const { toast } = useToast();
  
  // Auto-apply promo code from URL if enabled
  const autoAppliedPromoCode = useAutoApplyCode(code => {
    if (applyCodeAutomatically) {
      handleApplyPromoCode(code);
      toast({
        title: "Promo Code Auto-Applied",
        description: `The promo code ${code} has been automatically applied to your quote.`,
      });
    } else {
      setPromoCodeInput(code);
      toast({
        title: "Promo Code Detected",
        description: `The promo code ${code} has been detected from the URL. Click "Apply" to use it.`,
      });
    }
  });
  
  // Handle treatment selection
  const handleAddTreatment = async () => {
    if (!selectedTreatmentId) return;
    
    try {
      await quoteSystem.addTreatment(selectedTreatmentId, 1);
      setSelectedTreatmentId('');
    } catch (error) {
      console.error('Error adding treatment:', error);
    }
  };
  
  // Handle treatment quantity change
  const handleQuantityChange = async (treatmentId: string, newQuantity: number) => {
    try {
      await quoteSystem.updateTreatmentQuantity(treatmentId, newQuantity);
    } catch (error) {
      console.error('Error updating treatment quantity:', error);
    }
  };
  
  // Handle treatment removal
  const handleRemoveTreatment = async (treatmentId: string) => {
    try {
      await quoteSystem.removeTreatment(treatmentId);
    } catch (error) {
      console.error('Error removing treatment:', error);
    }
  };
  
  // Handle promo code application
  const handleApplyPromoCode = async (code?: string) => {
    const codeToApply = code || promoCodeInput;
    if (!codeToApply) return;
    
    try {
      const result = await quoteSystem.applyPromoCode(codeToApply);
      
      // Show toast notification with result
      if (result.isValid) {
        toast({
          title: "Promo Code Applied",
          description: result.message,
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: "Error",
        description: "Failed to apply promo code. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle promo code clearing
  const handleClearPromoCode = async () => {
    try {
      await quoteSystem.clearPromoCode();
      setPromoCodeInput('');
      
      toast({
        title: "Promo Code Cleared",
        description: "The promo code has been removed from your quote.",
      });
    } catch (error) {
      console.error('Error clearing promo code:', error);
    }
  };
  
  // Handle quote reset
  const handleResetQuote = async () => {
    try {
      await quoteSystem.resetQuote();
      setPromoCodeInput('');
      
      toast({
        title: "Quote Reset",
        description: "Your quote has been reset successfully.",
      });
    } catch (error) {
      console.error('Error resetting quote:', error);
    }
  };
  
  // Add initial treatments when component mounts
  useEffect(() => {
    const addInitialTreatments = async () => {
      if (initialTreatments && initialTreatments.length > 0) {
        try {
          for (const treatmentId of initialTreatments) {
            await quoteSystem.addTreatment(treatmentId, 1);
          }
        } catch (error) {
          console.error('Error adding initial treatments:', error);
        }
      }
    };
    
    addInitialTreatments();
  }, []);
  
  // Apply initial promo code when component mounts
  useEffect(() => {
    const applyInitialPromoCode = async () => {
      if (initialPromoCode) {
        try {
          await quoteSystem.applyPromoCode(initialPromoCode);
        } catch (error) {
          console.error('Error applying initial promo code:', error);
        }
      }
    };
    
    applyInitialPromoCode();
  }, []);
  
  return (
    <Card className={isCompact ? 'shadow-md' : 'shadow-lg'}>
      <CardHeader className={isCompact ? 'pb-3' : 'pb-6'}>
        <CardTitle className="flex items-center justify-between">
          <span>Dental Treatment Quote</span>
          {quoteSystem.promoCode && (
            <Badge variant="outline" className="ml-2 text-sm flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {quoteSystem.promoCode}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Select treatments and apply promo codes to see your custom quote
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Treatment selector */}
        {showTreatmentSelector && (
          <div className="space-y-2">
            <Label htmlFor="treatment-select">Add Treatment</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedTreatmentId} 
                onValueChange={setSelectedTreatmentId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a treatment" />
                </SelectTrigger>
                <SelectContent>
                  {quoteSystem.treatments.length === 0 && quoteSystem.isLoadingTreatments ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    quoteSystem.treatments.map(treatment => (
                      <SelectItem 
                        key={treatment.id} 
                        value={treatment.id}
                        disabled={!!currentMockQuote.find(t => t.id === treatment.id)}
                      >
                        {treatment.name} - {formatCurrency(treatment.price, currency)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleAddTreatment} disabled={!selectedTreatmentId}>
                Add
              </Button>
            </div>
          </div>
        )}
        
        {/* Treatment list */}
        <div className={showTreatmentSelector ? 'pt-3' : ''}>
          <TreatmentList 
            treatments={quoteSystem.treatments.filter(t => t.quantity > 0)}
            currency={currency}
            discountType={quoteSystem.discountType}
            discountValue={quoteSystem.discountValue}
            promoCode={quoteSystem.promoCode}
            onQuantityChange={handleQuantityChange}
            onRemoveTreatment={handleRemoveTreatment}
          />
        </div>
        
        {/* Promo code section */}
        {showPromoSection && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="promo-code">Promo Code</Label>
            <div className="flex gap-2">
              <Input 
                id="promo-code"
                placeholder="Enter promo code"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
              />
              <Button
                onClick={() => handleApplyPromoCode()}
                disabled={!promoCodeInput || quoteSystem.isValidatingPromo}
                variant="secondary"
              >
                {quoteSystem.isValidatingPromo ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  quoteSystem.promoCode && quoteSystem.promoCode === promoCodeInput ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null
                )}
                Apply
              </Button>
              {quoteSystem.promoCode && (
                <Button
                  onClick={handleClearPromoCode}
                  variant="outline"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {quoteSystem.promoValidationResult && (
              <div className={`text-sm ${quoteSystem.promoValidationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {quoteSystem.promoValidationResult.message}
              </div>
            )}
          </div>
        )}
        
        {/* Currency selector */}
        {showCurrencySelector && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="currency-select">Currency</Label>
            <Select 
              value={currency} 
              onValueChange={setCurrency}
            >
              <SelectTrigger id="currency-select" className="w-40">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      
      {/* Quote actions */}
      {showQuoteActions && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="ghost"
            onClick={handleResetQuote}
            disabled={quoteSystem.treatments.filter(t => t.quantity > 0).length === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Quote
          </Button>
          
          <Button disabled={quoteSystem.treatments.filter(t => t.quantity > 0).length === 0}>
            Continue
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// Mock helper for the demo
const currentMockQuote: any[] = [];

// Mock helper for currency formatting
function formatCurrency(value: number, currency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(value);
}

export default QuoteIntegrationWidget;