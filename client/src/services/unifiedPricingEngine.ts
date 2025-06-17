// client/src/services/unifiedPricingEngine.ts
import {
  getTreatmentByName,
  calculateTotal as csvCalculateTotal,
} from "./pricingService";
import { quoteStateManager } from "./enhancedQuoteState";

interface TreatmentItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category?: string;
}

interface PromoCodeResult {
  valid: boolean;
  code?: string;
  type?: "discount" | "package";
  discountType?: "percentage" | "fixed_amount";
  discountValue?: number;
  discountAmount?: number;
  error?: string;
}

interface QuoteCalculation {
  sessionId: string;
  treatments: TreatmentItem[];
  subtotal: number;
  promoDiscount: number;
  promoCode?: string;
  total: number;
  ukComparison: number;
  savings: number;
  savingsPercentage: number;
  warnings: string[];
  calculations: {
    treatmentTotal: number;
    promoDiscount: number;
    finalTotal: number;
  };
}

class UnifiedPricingEngine {
  private readonly API_BASE = "/api";

  // Calculate quote with full consistency
  async calculateQuote(
    treatments: Array<{ treatment: string; quantity: number }>,
    promoCode?: string,
    options?: {
      flightInfo?: { city: string; month: string };
      londonConsult?: boolean;
    },
  ): Promise<QuoteCalculation> {
    // Get or create session
    let sessionId = quoteStateManager.getSessionId();
    if (!sessionId) {
      sessionId = quoteStateManager.initializeSession();
    }

    const warnings: string[] = [];

    // 1. Calculate base treatment costs using CSV data
    const treatmentItems: TreatmentItem[] = [];
    let treatmentTotal = 0;

    for (const item of treatments) {
      const treatmentData = getTreatmentByName(item.treatment);
      if (treatmentData) {
        const unitPrice = treatmentData.priceGBP;
        const total = unitPrice * item.quantity;

        treatmentItems.push({
          id: item.treatment.toLowerCase().replace(/\s+/g, "-"),
          name: treatmentData.treatment,
          quantity: item.quantity,
          unitPrice,
          category: treatmentData.category,
        });

        treatmentTotal += total;
      } else {
        warnings.push(
          `Treatment "${item.treatment}" not found in pricing database`,
        );
      }
    }

    // 2. Handle promo code validation and locking
    let promoDiscount = 0;
    let validatedPromoCode: string | undefined;

    if (promoCode) {
      const promoResult = await this.validateAndApplyPromoCode(
        promoCode,
        treatmentItems,
        sessionId,
      );

      if (promoResult.valid) {
        promoDiscount = promoResult.discountAmount || 0;
        validatedPromoCode = promoResult.code;

        // Lock the promo code to prevent inconsistencies
        quoteStateManager.updateQuoteData({}, [promoCode]);
      } else {
        warnings.push(promoResult.error || "Invalid promo code");
      }
    }

    // 3. Calculate UK comparison using CSV data
    const ukComparison = await this.calculateUKComparison(treatmentItems);

    // 4. Final calculations
    const subtotal = treatmentTotal;
    const total = Math.max(0, subtotal - promoDiscount);
    const savings = ukComparison - total;
    const savingsPercentage =
      ukComparison > 0 ? Math.round((savings / ukComparison) * 100) : 0;

    // 5. Update quote state
    const quoteData = {
      treatments: treatmentItems.map((item, index) => ({
        id: index + 1,
        treatmentName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.quantity,
        category: item.category,
      })),
      subtotal,
      discount: promoDiscount,
      discountReason: validatedPromoCode
        ? `Promo code: ${validatedPromoCode}`
        : undefined,
      total,
      currency: "GBP",
    };

    quoteStateManager.updateQuoteData(quoteData);

    return {
      sessionId,
      treatments: treatmentItems,
      subtotal,
      promoDiscount,
      promoCode: validatedPromoCode,
      total,
      ukComparison,
      savings,
      savingsPercentage,
      warnings,
      calculations: {
        treatmentTotal,
        promoDiscount,
        finalTotal: total,
      },
    };
  }

  // Validate promo code with session locking
  private async validateAndApplyPromoCode(
    code: string,
    treatments: TreatmentItem[],
    sessionId: string,
  ): Promise<PromoCodeResult> {
    // Check if code is already locked in this session
    if (quoteStateManager.isPromoCodeLocked(code)) {
      // If locked, return the stored result without re-validation
      const session = quoteStateManager.getSession();
      const quoteData = session?.quoteData;

      if (quoteData?.discount && quoteData.discountReason?.includes(code)) {
        return {
          valid: true,
          code: code.toUpperCase(),
          discountAmount: quoteData.discount,
        };
      }
    }

    try {
      // Call your existing promo code API
      const response = await fetch(
        `${this.API_BASE}/promo-codes/validate/${encodeURIComponent(code)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!result.valid) {
        return {
          valid: false,
          error: result.message || "Invalid promo code",
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      const treatmentTotal = treatments.reduce(
        (sum, t) => sum + t.unitPrice * t.quantity,
        0,
      );

      if (result.discountType === "percentage") {
        discountAmount = treatmentTotal * (result.discountValue / 100);
      } else if (result.discountType === "fixed_amount") {
        discountAmount = Math.min(treatmentTotal, result.discountValue);
      }

      return {
        valid: true,
        code: result.code,
        type: result.type,
        discountType: result.discountType,
        discountValue: result.discountValue,
        discountAmount,
      };
    } catch (error) {
      console.error("Error validating promo code:", error);
      return {
        valid: false,
        error: "Failed to validate promo code",
      };
    }
  }

  // Calculate UK comparison prices
  private async calculateUKComparison(
    treatments: TreatmentItem[],
  ): Promise<number> {
    // UK pricing multipliers (approximate)
    const ukMultipliers: Record<string, number> = {
      implants: 2.8,
      veneers: 2.5,
      crowns: 2.2,
      whitening: 2.0,
      "root-canal": 2.5,
      default: 2.5,
    };

    let ukTotal = 0;

    for (const treatment of treatments) {
      const category = treatment.category?.toLowerCase() || "default";
      const multiplier = ukMultipliers[category] || ukMultipliers.default;
      const ukPrice = treatment.unitPrice * multiplier;
      ukTotal += ukPrice * treatment.quantity;
    }

    return Math.round(ukTotal);
  }

  // Get current quote calculation
  getCurrentQuote(): QuoteCalculation | null {
    const session = quoteStateManager.getSession();
    if (!session?.quoteData) return null;

    const quoteData = session.quoteData;

    return {
      sessionId: session.sessionId,
      treatments:
        quoteData.treatments?.map((t) => ({
          id: t.treatmentName.toLowerCase().replace(/\s+/g, "-"),
          name: t.treatmentName,
          quantity: t.quantity,
          unitPrice: t.unitPrice,
          category: t.category,
        })) || [],
      subtotal: quoteData.subtotal,
      promoDiscount: quoteData.discount || 0,
      promoCode: quoteData.discountReason?.replace("Promo code: ", ""),
      total: quoteData.total,
      ukComparison: 0, // Would need to recalculate
      savings: 0,
      savingsPercentage: 0,
      warnings: [],
      calculations: {
        treatmentTotal: quoteData.subtotal,
        promoDiscount: quoteData.discount || 0,
        finalTotal: quoteData.total,
      },
    };
  }
}

// Export singleton
export const unifiedPricingEngine = new UnifiedPricingEngine();
