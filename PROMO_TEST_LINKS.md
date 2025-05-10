# Promo Code Test Links

Use these links to test various aspects of the promotional system.

## URL Auto-Apply Testing

The following links will automatically apply a promo code when opening the quote page:

### Test Link 1: Apply WELCOME20
[Quote with WELCOME20 Code](/quote?code=WELCOME20)
- 20% discount applied to all treatments
- Tests percentage-based discounts

### Test Link 2: Apply SUMMER10
[Quote with SUMMER10 Code](/quote?code=SUMMER10)
- 10% discount applied to all treatments
- Tests smaller percentage discounts

### Test Link 3: Apply TEETH100
[Quote with TEETH100 Code](/quote?code=TEETH100)
- €100 fixed discount applied to applicable treatments
- Tests fixed amount discounts

## Special Offer Testing

The following links will navigate to special offers which redirect to the quote builder:

### Special Offer 1: Summer Teeth Whitening
[Summer Whitening Special](/special-offers/summer-whitening)
- Tests special offer integration with quote flow
- Applies a 15% discount on whitening treatments

### Special Offer 2: Dental Implant Package
[Implant Special](/special-offers/implant-special)
- Tests package bundling with special offers
- Includes free consultation and discounted CT scan

## Testing Manual Entry

To test manual promo code entry:
1. Navigate to the regular [Quote Builder](/quote)
2. Scroll down to the clinic selection section
3. Find the "Have a promo code?" input field
4. Enter one of the test codes (WELCOME20, SUMMER10, TEETH100)
5. Click "Apply" to see the discount applied

## Expected Behavior

When a promo code is applied (via URL or manual entry):
- A blue PromoCodeBadge should appear showing the applied code
- Treatment prices should update to reflect the discount
- When the quote is submitted, the promo data should be saved with it
- The patient should see the promo code and discount on their account