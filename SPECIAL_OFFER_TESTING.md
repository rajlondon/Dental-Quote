# Special Offers and Promo Codes Testing Guide

## Overview

This document provides instructions on testing the new promotional code functionality. The feature allows filtering clinics based on promotional codes, showing only the associated clinic when a promotional code is present.

## Implementation Details

The promotional code filtering is implemented through the following components:

1. **QuoteFlowContext**: Handles promotional code detection using the `isPromoTokenFlow` flag
2. **SingleClinicCard**: A specialized component for displaying a single clinic with promotional information
3. **MatchedClinicsPage**: Contains the filtering logic using `clinicsData.filter(clinic => clinic.id === clinicId)`
4. **WhatsAppButton**: Added international number format support

## Testing Instructions

### Method 1: Using Test Link Page

1. Navigate to `/test-promo-urls.html` in your browser
2. Click on any of the promo code test links
3. Observe that only one clinic is displayed when using a promo code
4. Notice the special offer badge below the clinic card
5. Verify that the regular link (without promo) shows all clinics

### Method 2: Manual URL Testing

You can manually test the functionality by adding the following parameters to the matched-clinics URL:

```
/matched-clinics?source=promo_token&clinicId=dentspa&promoToken=DENTSPA20&treatmentItems=[...]
```

Required parameters:
- `source=promo_token` - Indicates this is a promotional code flow
- `clinicId=CLINIC_ID` - The ID of the clinic to display (e.g., dentspa, beyazada, maltepe)
- `promoToken=TOKEN_ID` - The promotional code to display (e.g., DENTSPA20, BEYAZ250)
- `treatmentItems=[...]` - JSON array of treatment items

## Test Cases

1. **DENTSPA20 Promo Code**
   - Expected Behavior: Only DentSpa clinic is displayed with "DENTSPA20" badge
   - Clinic Features: Premium tier, 5-star hotel included

2. **BEYAZ250 Promo Code**
   - Expected Behavior: Only Beyaz Ada clinic is displayed with "BEYAZ250" badge
   - Clinic Features: Standard tier, 4-star hotel discounted

3. **MALTEPE15 Promo Code**
   - Expected Behavior: Only Maltepe clinic is displayed with "MALTEPE15" badge
   - Clinic Features: Affordable tier, airport transfers included

4. **No Promo Code (Control)**
   - Expected Behavior: All clinics are displayed in comparison view
   - No promotional badges visible

## Validation Criteria

The implementation is considered successful if:

1. When a promotional URL with valid parameters is accessed, only the specified clinic is shown
2. The promotional badge displays the correct promo code
3. The filtering is consistent across page refreshes
4. Selecting the clinic properly continues the quote flow
5. The user experience feels seamless when coming from a promotional link

## Future Enhancements

1. Add ability to apply/remove promo codes during the quote flow
2. Implement promo code validation against database of valid codes
3. Add expiration dates and usage limits to promotional codes
4. Develop analytics tracking for promotional code usage
5. Create admin interface for generating and managing promotional codes