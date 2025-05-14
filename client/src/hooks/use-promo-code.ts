import { toast } from '@/hooks/use-toast';

// Utility formatter for consistent currency formatting
export const formatCurrency = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return formatter.format(amount || 0);
};

// Response type for promo code application
export interface PromoCodeResponse {
  success: boolean;
  message: string;
}

/**
 * Apply a promo code to a quote with enhanced persistence and error handling
 * This is a standalone function that can be used by the useQuoteBuilder hook
 */
export async function applyPromoCode(
  code: string,
  quote: any,
  setQuote: (quote: any) => void
): Promise<PromoCodeResponse> {
  console.log('[PromoCode] Starting promo code application for:', code);
  
  try {
    // Validate input
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return { success: false, message: "Please enter a valid promo code" };
    }
    
    // Check if we're in test mode
    const isTestMode = window.location.pathname.includes('quote-test') || 
                      window.location.pathname.includes('test-dashboard');
    
    // Use test API endpoint if in test mode
    const apiEndpoint = isTestMode 
      ? `/api/test-promo-codes/${encodeURIComponent(code.trim())}/validate` 
      : `/api/promo-codes/${encodeURIComponent(code.trim())}/validate`;
      
    console.log(`[PromoCode] Using promo code validation endpoint: ${apiEndpoint}`);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        subtotal: quote.subtotal,
        treatments: quote.treatments 
      })
    });
    
    // Handle network or server errors
    if (!response.ok) {
      const errorMessage = response.status === 503 
        ? "Service temporarily unavailable. Please try again later."
        : `Server error: ${response.status} ${response.statusText}`;
        
      return { success: false, message: errorMessage };
    }
    
    const data = await response.json();
    console.log('[PromoCode] Validation response:', data);
    
    if (data.success) {
      // Use functional update to ensure we have the latest state
      setQuote((prevQuote: any) => {
        // Calculate the subtotal first - it might be missing
        let calculatedSubtotal = 0;
        
        // Add up treatment prices
        prevQuote.treatments?.forEach((treatment: any) => {
          if (treatment.price) {
            calculatedSubtotal += treatment.price * (treatment.quantity || 1);
          }
        });
        
        // Add up package prices
        prevQuote.packages?.forEach((pkg: any) => {
          if (pkg.price) {
            calculatedSubtotal += pkg.price * (pkg.quantity || 1);
          }
        });
        
        // Add up addon prices
        prevQuote.addons?.forEach((addon: any) => {
          if (addon.price) {
            calculatedSubtotal += addon.price * (addon.quantity || 1);
          }
        });
        
        // Use the calculated subtotal if the quote subtotal is 0 or undefined
        const effectiveSubtotal = prevQuote.subtotal || calculatedSubtotal;
        
        // Calculate new totals with discount
        let calculatedDiscount = 0;
        if (data.data.discount_type === 'percentage') {
          calculatedDiscount = effectiveSubtotal * (data.data.discount_value / 100);
        } else if (data.data.discount_type === 'fixed_amount') {
          calculatedDiscount = Math.min(data.data.discount_value, effectiveSubtotal);
        }
        
        // Ensure discount is a valid number and properly rounded
        calculatedDiscount = !isNaN(calculatedDiscount) && isFinite(calculatedDiscount)
          ? Math.round(calculatedDiscount * 100) / 100
          : 0;
        
        // Ensure discount doesn't exceed subtotal
        calculatedDiscount = Math.min(calculatedDiscount, effectiveSubtotal);
        
        // Calculate total discount (combining offer discount and promo discount)
        const offerDiscount = prevQuote.offerDiscount || 0;
        const totalDiscount = offerDiscount + calculatedDiscount;
        
        // Calculate new total with rounding
        const newTotal = Math.max(0, Math.round((effectiveSubtotal - totalDiscount) * 100) / 100);
        
        console.log('[PromoCode] Discount calculation:', {
          effectiveSubtotal,
          discountType: data.data.discount_type,
          discountValue: data.data.discount_value,
          calculatedDiscount,
          offerDiscount,
          totalDiscount,
          newTotal
        });
        
        // Return updated quote object with all necessary fields
        return {
          ...prevQuote,
          subtotal: effectiveSubtotal,
          promoCode: code,
          promoCodeId: data.data.id,
          discountType: data.data.discount_type,
          discountValue: data.data.discount_value,
          offerDiscount: offerDiscount,
          promoDiscount: calculatedDiscount,
          discount: totalDiscount,
          total: newTotal
        };
      });
      
      // Add a short delay to ensure state is updated before showing the toast
      setTimeout(() => {
        // Show success toast with discount details
        toast({
          title: "Promo Code Applied",
          description: `${code} applied successfully!`
        });
        
        // Track successful application if analytics is available
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'promo_code_applied', {
            event_category: 'promotions',
            event_label: code,
            value: data.data.discount_value
          });
        }
      }, 100);
      
      return { 
        success: true, 
        message: "Promo code applied successfully" 
      };
    } else {
      return { 
        success: false, 
        message: data.message || "Invalid promo code" 
      };
    }
  } catch (error) {
    console.error('[PromoCode] Error applying promo code:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}