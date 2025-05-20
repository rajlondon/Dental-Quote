# MyDentalFly Promo Code System Documentation

## Overview

The promo code system allows patients to apply special discounts or access curated treatment packages through the MyDentalFly platform. This document explains how the system works, the different types of promo codes available, and the technical implementation details.

## Types of Promo Codes

### 1. Discount Promo Codes

These codes apply a simple discount to the total treatment price:

- **Percentage Discount**: Reduces the total price by a percentage (e.g., 10%, 20%, 50%)
- **Fixed Amount Discount**: Reduces the total price by a specific amount (e.g., £100, £200)

**Examples**:
- `TEST50`: 50% off the total price
- `SAVE100`: £100 off the total price

### 2. Package Promo Codes

These codes apply a complete treatment package with multiple treatments bundled together, often offering:

- Pre-selected treatments with quantities
- Special pricing (usually with significant savings)
- Association with specific clinics
- Additional benefits (e.g., free hotel stay, airport transfer, tourist activities)

**Examples**:
- `IMPLANT2023`: Dental implant package associated with DentSpa Clinic
- `SMILE2023`: Smile makeover package associated with Beyaz Ada Clinic
- `FULLMOUTH2023`: Full mouth reconstruction package associated with Dental Harmony Clinic

## Technical Implementation

### Data Structure

Package promo codes contain the following data:

```typescript
interface PromoCode {
  id: string;                        // Unique identifier
  code: string;                      // The actual code (e.g., "IMPLANT2023")
  title: string;                     // Display title
  description: string;               // Description of the promo
  clinic_id: string;                 // Associated clinic ID (for packages)
  discount_type: "percentage" | "fixed_amount"; // Type of discount
  discount_value: number;            // The amount/percentage of discount
  applicable_treatments: string[];   // Treatments the code applies to
  start_date: string;                // When the code becomes active
  end_date: string;                  // When the code expires
  max_uses: number;                  // Maximum times it can be used
  is_active: boolean;                // Whether the code is currently active
  type: "discount" | "package";      // Type of promo code
  packageData?: {                    // Only for package type
    name: string;                    // Package name
    description: string;             // Package description
    treatments: Array<{              // Included treatments
      id: string;                    // Treatment ID
      name: string;                  // Treatment name
      quantity: number;              // Quantity of this treatment
      price: number;                 // Price per unit
    }>;
    originalPrice: number;           // Original price before discount
    packagePrice: number;            // Discounted package price
    savings: number;                 // Amount saved with package
    attractions?: Array<{            // Tourist attractions included
      name: string;                  // Attraction name
      description: string;           // Description
      value: number;                 // Monetary value
    }>;
    additionalServices?: string[];   // Additional services included
  };
}
```

### Workflow

1. **User Enters Promo Code**:
   - The `PromoCodeInput` component handles promo code entry and validation
   - The code is sent to the server for validation via the `/api/promo-codes/validate/:code` endpoint

2. **Server Validation**:
   - The server validates the code and returns relevant data
   - For packages, it includes complete treatment details, clinic ID, and package benefits
   - For discounts, it returns the discount type and value

3. **Client-Side Processing**:
   - For package codes, the treatments are auto-populated in the treatment builder
   - The application stores the promo code in session storage
   - If a package is associated with a specific clinic, that clinic ID is also stored

4. **Clinic Filtering**:
   - On the `MatchedClinicsPage`, only the specific clinic associated with the package promo code is displayed
   - This is implemented via a dedicated filtering logic in the component's `useEffect` hook
   - The clinic ID is retrieved from session storage and used to filter the clinic list

5. **Discount Application**:
   - The discount amount is calculated and displayed in the quote summary
   - For percentage discounts, the amount is calculated based on the total price
   - For fixed amount discounts, the amount is applied directly to the total

## Integration Points

### 1. PromoCodeInput Component

The entry point for promo code application, handling:
- User input and validation
- Displaying success/error messages
- Showing package details for package codes
- Storing validated codes in session storage

### 2. QuoteContext

Manages the state of the quote including:
- Promo code and its type
- Discount amount
- Treatment selections
- Package-specific information
- Calculations for subtotals and totals

### 3. MatchedClinicsPage Component

Handles clinic filtering based on promo codes:
- Maps specific promo codes to specific clinics
- Filters the clinic list to only show the associated clinic
- Ensures consistent behavior across the application

### 4. Backend Services

The server-side implementation includes:
- Validation of promo codes
- Retrieving package details
- Calculating discounts
- Checking code expiration and usage limits

## Sample Promo Codes for Testing

| Code | Type | Description | Associated Clinic |
|------|------|-------------|------------------|
| TEST50 | Discount | 50% off any treatment | Any clinic |
| SAVE100 | Discount | £100 off the total | Any clinic |
| IMPLANT2023 | Package | Dental implant package | DentSpa Clinic |
| SMILE2023 | Package | Smile makeover package | Beyaz Ada Clinic |
| FULLMOUTH2023 | Package | Full mouth reconstruction | Dental Harmony Clinic |

## Future Enhancements

Potential improvements to the promo code system:

1. **Time-Limited Promotions**: Add support for flash sales with countdown timers
2. **Referral Codes**: Allow patients to generate unique referral codes that provide discounts to both referrer and referee
3. **Multi-tier Discount System**: Apply different discount rates based on total price thresholds
4. **Seasonal Packages**: Create special packages for holiday seasons or specific events
5. **Loyalty Program Integration**: Connect promo codes with a patient loyalty program

## Troubleshooting

Common issues and solutions:

1. **Promo Code Not Applying**: Verify the code is active and hasn't expired or reached its usage limit
2. **Clinic Not Showing**: Ensure the clinic ID is correctly associated with the package promo code
3. **Discount Not Calculating**: Check that the discount type and value are properly defined
4. **Package Treatments Not Appearing**: Verify that the package data includes valid treatment IDs

---

## Developer Notes

When adding new package promo codes:

1. Always assign a specific clinic ID to ensure proper filtering
2. Include complete treatment details with quantities
3. Calculate the original price, package price, and savings accurately
4. Add any additional benefits like tourist attractions or hotel stays
5. Test the code thoroughly across the quote generation flow