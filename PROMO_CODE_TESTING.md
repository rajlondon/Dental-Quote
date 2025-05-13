# Promo Code URL Auto-Apply Testing Guide

This document outlines how to test the automatic application of promo codes from URL parameters in the MyDentalFly application.

## Overview

The URL auto-apply functionality allows promo codes to be automatically applied to a quote when a URL with a `code` parameter is visited. This feature enhances user experience by eliminating the need for manual code entry.

## Test Scenarios

### Scenario 1: Valid Promo Code Application

1. Navigate to the website with a valid promo code in the URL:
   ```
   http://localhost:5000/quote?code=TESTPROMO25
   ```

2. Expected behavior:
   - The system should automatically detect and apply the promo code
   - A success message should display confirming the code was applied
   - The discount should be reflected in the quote totals
   - The promo code information should be visible in the quote summary

### Scenario 2: Invalid Promo Code Rejection

1. Navigate to the website with an invalid promo code in the URL:
   ```
   http://localhost:5000/quote?code=INVALIDCODE
   ```

2. Expected behavior:
   - The system should attempt to apply the code but fail validation
   - An error message should indicate the code is invalid/expired/not found
   - No discount should be applied to the quote

### Scenario 3: Promo Code Persistence Through Quote Flow

1. Start with a URL containing a valid promo code:
   ```
   http://localhost:5000/quote?code=TESTPROMO25
   ```

2. Complete the entire quote flow:
   - Start a new quote
   - Add treatments
   - Navigate through all quote steps
   - Save/complete the quote

3. Expected behavior:
   - The promo code should remain applied at each step
   - The discount should be consistently applied throughout the flow
   - The final saved quote should include the promo code details

## Automated Testing

An automated test script is available to verify the functionality:

```bash
node test-promo-url-auto-apply.mjs
```

This script tests all three scenarios and provides detailed output of the test results.

## Technical Implementation Details

### Client-Side Components

- **useAutoApplyCode.ts**: Custom hook that extracts the code parameter from the URL and applies it
- **PromoCodeSummary.tsx**: Component that displays applied promo code information
- **QuoteFlowContext.tsx**: Contextual state management for maintaining promo code information throughout the quote flow

### Server-Side Components

- **apply-code.ts**: API route handler for validating and applying promo codes
- **promo-utils.ts**: Utility functions for promo code validation and processing
- **schema.ts**: Database schema definitions including promo-related fields in the quotes table

### Database Schema

The following fields have been added to the quotes table to support promo code persistence:

- **promo_code**: VARCHAR(50) - Stores the actual promo code string
- **promo_type**: VARCHAR(20) - 'percentage' or 'fixed' discount type
- **promo_value**: DECIMAL(10,2) - The discount amount or percentage
- **promo_applied_at**: TIMESTAMP - When the promo code was applied

## Troubleshooting Common Issues

1. **Promo code not being detected from URL**
   - Check that the URL parameter is exactly `code=PROMOCODE` (case-sensitive)
   - Verify the useAutoApplyCode hook is correctly implemented in the page component

2. **Promo code shows as applied but no discount is visible**
   - Check the discount calculations in the server-side code
   - Verify the discount is being correctly persisted in the database

3. **Error "Promo code already applied"**
   - This occurs when trying to apply a promo code to a quote that already has one
   - The system prevents multiple codes from being applied to the same quote