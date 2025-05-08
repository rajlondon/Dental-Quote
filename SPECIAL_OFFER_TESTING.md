# Special Offer Tracking - Testing Guide

This document provides instructions for testing the special offer tracking system in MyDentalFly.

## Automated Tests

We've created several automated test scripts to verify the special offer tracking functionality:

1. **test-special-offer-click.js** - Tests clicking on a special offer from the homepage
2. **test-special-offer-end-to-end.js** - Tests the complete flow from offer click to saved quote
3. **test-patient-portal-offer-display.js** - Tests that offers display correctly in the patient portal
4. **test-special-offers-master.js** - Runs all tests in sequence

To run all tests:

```bash
node test-special-offers-master.js
```

## Manual Testing Checklist

Use this checklist to manually verify the special offer tracking flow:

### 1. Homepage Special Offer Display
- [ ] Special offers appear on the homepage
- [ ] Each offer shows correct title, discount, and clinic information
- [ ] Offer cards have a CTA button to "Get a Quote"

### 2. Special Offer Click & Flow Initialization
- [ ] Clicking an offer correctly redirects to the quote form
- [ ] The special offer badge appears at the top of the quote form
- [ ] The special offer badge shows the correct offer title and discount

### 3. Treatment Selection with Special Offer
- [ ] Applicable treatments show the special offer discount
- [ ] The pricing displays both original and discounted prices
- [ ] Non-applicable treatments don't show discount pricing

### 4. Quote Summary with Special Offer
- [ ] The quote summary panel shows the special offer section
- [ ] Discounted treatments show the correct pricing
- [ ] The special offer section shows offer title, discount, and clinic
- [ ] Total savings calculation includes the special offer discount

### 5. Clinic Selection with Special Offer
- [ ] The matched clinics page maintains the active special offer
- [ ] The special offer badge remains visible
- [ ] Clinic offering the special offer is highlighted or marked

### 6. Quote Saving with Special Offer
- [ ] The quote is saved with the special offer data
- [ ] The confirmation page shows the applied special offer

### 7. Patient Portal Special Offer Display
- [ ] Login to the patient portal
- [ ] Navigate to quotes list
- [ ] Quotes with special offers are marked with a badge
- [ ] Opening a quote with a special offer shows offer details
- [ ] Treatment list in the quote shows discounted prices

### 8. Clinic Portal Special Offer Display
- [ ] Login to the clinic portal
- [ ] Incoming quotes with special offers are marked
- [ ] Quote details show which special offer generated the lead
- [ ] Offer analytics show conversion rates

### 9. Admin Portal Special Offer Display
- [ ] Login to the admin portal
- [ ] Quote management shows special offer information
- [ ] Special offer analytics display correctly
- [ ] Offer management tools work correctly

## Known Edge Cases to Test

1. **Session Handling**
   - [ ] Special offer is maintained if user refreshes the page
   - [ ] Special offer is maintained across page navigations
   - [ ] Special offer is cleared when quote flow is reset

2. **Multiple Offers**
   - [ ] Only one offer can be active at a time
   - [ ] Selecting a new offer replaces the current offer

3. **Offer Expiration**
   - [ ] Expired offers are not displayed or selectable
   - [ ] Offers approaching expiration show a warning

4. **Quote Modification**
   - [ ] If a quote with a special offer is modified, the offer is maintained
   - [ ] If treatments are changed, offer is only applied to applicable treatments

## Reporting Issues

When reporting issues with special offer tracking, please include:

1. The specific offer ID and title
2. Which step in the flow had an issue
3. Expected vs. actual behavior
4. Browser and device information
5. Screenshots showing the issue

## Performance Considerations

Special offer tracking should have minimal impact on application performance:
- Page load times should remain under 2 seconds
- Treatment price calculations should be instant
- Quote saving with special offers should complete within 3 seconds