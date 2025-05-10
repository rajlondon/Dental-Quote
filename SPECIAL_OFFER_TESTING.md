# MyDentalFly Promotional System Testing Guide

This document provides instructions for testing the hybrid promotional system which supports both automatic tokens and manual coupon codes.

## Setup Complete

The following components have been set up:

- ✅ Added `code` column to promos table to support coupon codes
- ✅ Added discount fields to quotes table (`subtotal`, `discount`, `total_price`)
- ✅ Created server-side API for promo code validation and application
- ✅ Implemented client-side components for coupon code entry and display
- ✅ Added analytics for tracking promotion usage

## Test Promo Code

A test promo code has been created in the database:

- **Promo Code**: `WELCOME20`
- **Discount**: 20% off
- **Details**: Welcome discount for new patients
- **Valid Period**: One year from creation date
- **City**: Istanbul

## Testing Methods

### Method 1: Direct URL Tokens (Automatic)

Users can access special offers directly through tokenized URLs:

1. Go to the homepage
2. Click on any special offer card
3. The system will automatically track the promo through the quote journey
4. The discount will be automatically applied at checkout

### Method 2: Manual Coupon Codes

Users can manually enter coupon codes:

1. Create a new quote or load an existing quote
2. Find the "Coupon Code" section in the sidebar
3. Enter `WELCOME20` into the input field
4. Click "Apply Code"
5. The discount will be applied to the quote

## API Testing

### Promo Filtering API

To test the promo filtering API:

```
GET /api/v1/promos?code=WELCOME20
```

This will return all promos matching the code.

### Apply Code API

To test applying a code to a quote:

```
POST /api/apply-code
{
  "code": "WELCOME20",
  "quoteId": "[QUOTE_ID]"
}
```

## Test Scenarios

1. **New Patient Registration + Code**
   - Register a new patient account
   - Create a new quote
   - Apply the `WELCOME20` code
   - Verify 20% discount is applied

2. **Click Through From Promo**
   - Click a promo on the homepage
   - Follow through to quote creation
   - Verify promo is automatically applied

3. **Clinic Applying Code For Patient**
   - Login to clinic portal
   - Create a quote for a patient
   - Apply the `WELCOME20` code
   - Verify discount is applied

4. **Invalid Code Testing**
   - Try to apply an invalid code (e.g., `INVALID`)
   - Verify appropriate error message is shown

5. **Double Discount Prevention**
   - Apply a promo through URL token
   - Try to apply an additional code
   - Verify system prevents double-discounting

## Verification

For each test, verify:

1. The UI correctly shows the discount amount
2. The subtotal reflects original price
3. The total price correctly applies the discount
4. The price breakdown in the PDF quote is accurate

## Analytics

The system tracks promo code usage through Mixpanel events:
- `promo_code_applied`
- `promo_code_invalid`
- `special_offer_selected`

These events include user ID, promo ID, and discount amount applied.