# MyDentalFly - Dental Tourism Platform

## Project Overview
MyDentalFly is a comprehensive dental tourism platform that connects European patients with high-quality, affordable dental clinics in Turkey. The platform facilitates the entire treatment journey from initial quote generation to post-treatment follow-up.

## System Architecture
The platform consists of three distinct portals:
- **Patient Portal**: For patients seeking dental treatments abroad
- **Clinic Portal**: For dental clinics to manage patients and treatments
- **Admin Portal**: For platform administrators to oversee operations

## Quote Management System
Our recently enhanced quote system is the core functionality of the platform, allowing patients to quickly generate accurate treatment quotes with the following features:

### Core Components
1. **QuickQuote Component**
   - Interactive treatment selection interface
   - Real-time price calculations
   - Promo code application without state reset
   - Patient information collection
   - Quote saving and email functionality

2. **Quote List Page**
   - Displays all saved quotes in chronological order
   - Shows basic quote information and status
   - Provides navigation to individual quote details

3. **Quote Detail Page**
   - Comprehensive view of quote information
   - Displays patient details, selected treatments, and pricing
   - Supports email functionality and status updates

### Key Services

1. **Quote Service**
   - Save and retrieve quotes from localStorage
   - Calculate pricing with discounts
   - Apply promo codes and special offers
   - Track quote status

2. **Email Service**
   - Generate PDF quotes using jsPDF
   - Send quotes via email
   - Manage email sequences
   - Track email engagement

3. **Treatment Service**
   - Manage available treatments
   - Handle pricing variations
   - Apply special offers
   - Organize treatment packages

## Data Models

### Quote
```typescript
interface Quote {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  treatments: Treatment[];
  selectedPackage: TreatmentPackage | null;
  appliedOffer: SpecialOffer | null;
  promoCode: string | null;
  subtotal: number;
  savings: number;
  total: number;
  status: 'pending' | 'approved' | 'completed';
  createdAt: string;
  updatedAt: string;
}
```

### Treatment
```typescript
interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
}
```

### TreatmentPackage
```typescript
interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  treatments: string[]; // Treatment IDs
  price: number;
  savings: number;
}
```

### SpecialOffer
```typescript
interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableTreatments: string[]; // Treatment IDs
  expiryDate: string;
}
```

## Navigation
- **Main Navigation**: Includes links to Home, New Quote, and My Quotes
- **Layout Components**: MainLayout wraps all pages for consistent navigation

## Recent Improvements
1. Fixed the issue where applying promo codes would reset the quote state
2. Enhanced email service with PDF generation capability
3. Implemented proper quote saving and retrieval functionality
4. Created a robust navigation system for the quote management workflow
5. Fixed routing issues for viewing quote details

## Usage Instructions
1. **Creating a New Quote**
   - Click "New Quote" in the navigation
   - Select treatments from the available options
   - Apply promo codes (e.g., DENTAL10, SMILE20, DISCOUNT30)
   - Enter patient information
   - Save or email the quote

2. **Viewing Saved Quotes**
   - Click "My Quotes" in the navigation
   - Browse the list of all saved quotes
   - Click on a quote to view detailed information

3. **Using Promo Codes**
   - Enter a valid promo code in the promo code field
   - Click "Apply" to calculate the discount
   - Valid codes: DENTAL10, SMILE20, DISCOUNT30

## Technical Implementation Notes
- The QuickQuote component uses local state management for reliability
- Quotes are stored in localStorage for persistence
- Email service uses jsPDF for PDF generation
- Navigation uses wouter for routing
- Authentication errors in logs don't affect quote functionality

## Next Implementation Priorities
1. Treatment quantity selection
2. Special offers integration
3. Treatment package bundles
4. Additional patient information fields
5. More comprehensive quote summary