# How to Test Promo Code URL Auto-Apply Feature

This document explains how to test the new promo code auto-apply feature that allows promo codes to be applied automatically to quotes via URL parameters.

## Testing URL Auto-Apply

1. Start by navigating to the quote builder page with a promo code in the URL:
   ```
   /quote?code=WELCOME20
   ```

2. The system will:
   - Automatically detect the promo code parameter
   - Call the API to validate the code
   - Apply the discount to the quote
   - Display a PromoCodeBadge showing the applied code

3. Discount will be applied to all applicable treatments in the quote.

4. When the quote is submitted, the promo code information will be saved with the quote.

## Valid Test Codes

The following codes are currently available for testing:

- `WELCOME20` - 20% off all treatments
- `SUMMER10` - 10% off all treatments
- `TEETH100` - €100 off selected treatments

## Technical Implementation

- URL auto-apply is handled by the `useAutoApplyCode` hook in `client/src/hooks/use-auto-apply-code.ts`
- Promo codes are validated through the `/api/promocodes/apply` endpoint
- Visual presentation is through the `PromoCodeBadge` component
- Quote submission includes the promo data when saving to the database

## Implementing in Other Pages

To implement URL auto-apply in other pages:

1. Import required components:
   ```typescript
   import { useAutoApplyCode } from '@/hooks/use-auto-apply-code';
   import { PromoCodeBadge } from '@/components/promo/PromoCodeBadge';
   ```

2. Add the hook to your component:
   ```typescript
   const { appliedPromo, clearAppliedPromo } = useAutoApplyCode(quoteId);
   ```

3. Add the badge to your UI:
   ```jsx
   {appliedPromo && (
     <PromoCodeBadge
       promo={appliedPromo}
       onDismiss={clearAppliedPromo}
       isDismissible={true}
     />
   )}
   ```

4. Include promo data when saving quotes:
   ```typescript
   promoCode: appliedPromo ? {
     promoId: appliedPromo.id,
     code: appliedPromo.code,
     discountType: appliedPromo.discount_type,
     discountValue: appliedPromo.discount_value
   } : null
   ```