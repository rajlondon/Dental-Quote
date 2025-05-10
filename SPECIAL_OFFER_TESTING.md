# Special Offers & Promo Codes Testing Guide

This document provides instructions for testing the hybrid promotional system, which combines automatic token-based special offers with manual coupon code redemption.

## Testing Promo Codes

### Step 1: Create a Test Promo Code

Run the test script to create a sample promotional code:

```bash
node test-promo-code.js
```

This will create a promo code "WELCOME20" that gives 20% off a quote and associates it with all clinics.

### Step 2: Access the Test UI

Navigate to the promo code testing page:

```
/promocode-test
```

This page provides a UI for testing the coupon code functionality without needing to go through the entire quote creation flow.

### Step 3: Test Coupon Code Entry

On the test page:
1. Enter "WELCOME20" in the coupon code field
2. Click "Apply"
3. You should see a success message and the code applied with a 20% discount
4. Verify the discount calculation is correct

### Step 4: Try Invalid Scenarios

Test the following invalid scenarios to verify error handling:
1. Enter an invalid code like "INVALID"
2. Enter an empty code
3. Try to apply the same code twice

### Step 5: Test Removal

1. Apply a valid code
2. Click the "X" button to remove the code
3. Verify the discount is removed and totals are recalculated

## Testing Special Offers (Token-Based)

### Step 1: Create a Test Special Offer

Run the special offer creation script:

```bash
node test-special-offer-end-to-end.js
```

This creates a special offer and generates a tracking token for it.

### Step 2: Access the Special Offer Link

The script will output a link like:
```
/special-offer?promoId=1234&token=abc123
```

Visit this link to simulate clicking on a special offer from an email or advertisement.

### Step 3: Verify Quote Flow

1. The system should take you to the quote creation flow
2. Complete the quote flow
3. Verify the special offer is automatically applied to your quote
4. Check the final quote page to ensure the discount appears correctly

## Testing Integration in Patient Portal

### Step 1: Login to Patient Portal

Login to the patient portal using the test patient account.

### Step 2: View an Existing Quote

Navigate to a quote that has a promotion applied to it.

### Step 3: Verify Display

Verify that the promotion appears correctly in the quote details, including:
1. Discount amount
2. Promo code (if applicable)
3. Correct price calculation (original price, discount, final price)

## Testing in Clinic Portal

### Step 1: Login to Clinic Portal

Login to the clinic portal using the test clinic account.

### Step 2: Create a New Quote

1. Create a new quote for a patient
2. In the quote details, expand the "Apply Promotion" section
3. Enter "WELCOME20" and apply it
4. Verify the discount is applied correctly

### Step 3: Verify Reporting

1. Go to the "Promotions" section of the clinic portal
2. Verify that applied promotions appear in the reports
3. Check that analytics data is being tracked correctly

## Testing Analytics Tracking

To verify analytics tracking is working:

```bash
node test-notification-analytics.js
```

This will create test notifications including promotion usage analytics.

## Important Notes

- Promo codes are not case-sensitive (WELCOME20 = welcome20)
- Promotions have validity dates, ensure you're testing with active promos
- Each promotion can only be applied once per quote
- The hybrid system allows both automatic (token-based) and manual (code-based) promotions