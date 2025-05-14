# Quote Management System Documentation

## Overview

The Quote Management System is a comprehensive solution for creating, managing, and sending dental treatment quotes. It features a modular, performance-optimized architecture with support for promo codes, special offers, and email notifications.

## Core Components

### 1. Quote Builder Hook (`use-quote-builder.ts`)

The heart of the quote management system, this custom React hook handles:

- Loading available treatments, packages, and add-ons
- Adding/removing items to/from quotes
- Calculating totals and discounts
- Applying promo codes
- Saving and finalizing quotes
- Performance-optimized with debounced saving

```typescript
const {
  quote,                 // Current quote state
  treatments,            // Available treatments
  packages,              // Available packages
  addons,                // Available add-ons
  isLoading,             // Loading status
  isDirty,               // Whether the quote has unsaved changes
  error,                 // Any error messages
  addTreatment,          // Add treatment to quote
  removeTreatment,       // Remove treatment from quote
  addPackage,            // Add package to quote
  removePackage,         // Remove package from quote
  addAddon,              // Add add-on to quote
  removeAddon,           // Remove add-on from quote
  applyPromoCode,        // Apply promo code to quote
  saveQuote,             // Save quote
  finalizeQuote,         // Finalize quote
  resetQuote,            // Reset quote to defaults
  setQuoteId             // Set an existing quote ID (for editing)
} = useQuoteBuilder();
```

### 2. Quote Flow Components

#### LazyQuoteFlow Component

A performance-optimized flow that uses React.lazy for code-splitting:

```tsx
<LazyQuoteFlow
  initialStep="builder"   // 'builder', 'summary', or 'confirmation'
  quoteId="123"           // Optional existing quote ID
  specialOfferId="abc"    // Optional special offer ID
  promoCode="DISCOUNT10"  // Optional promo code
  onComplete={handleComplete}
  onCancel={handleCancel}
/>
```

#### QuoteSummaryOptimized Component

A memoized quote summary component that prevents unnecessary re-renders:

```tsx
<QuoteSummaryOptimized
  quote={quoteData}
  onRemoveTreatment={handleRemoveTreatment}
  onRemovePackage={handleRemovePackage}
  onRemoveAddon={handleRemoveAddon}
  currency="GBP"
  readonly={false}
  printMode={false}
  showPromoDetails={true}
/>
```

#### QuoteConfirmationEmail Component

A form component for sending quote confirmations via email:

```tsx
<QuoteConfirmationEmail
  quoteId="123"
  onSuccess={handleEmailSuccess}
  onError={handleEmailError}
/>
```

## API Routes

The quote management system interacts with several backend API endpoints:

### Quote Operations

- `GET /api/quotes` - List quotes
- `GET /api/quotes/:id` - Get quote details
- `POST /api/quotes` - Create a new quote
- `PATCH /api/quotes/:id` - Update an existing quote
- `POST /api/quotes/:id/finalize` - Finalize a quote
- `POST /api/quotes/send-email` - Send quote details via email

### Items & Promotions

- `GET /api/treatments` - List available treatments
- `GET /api/treatment-packages` - List available treatment packages
- `GET /api/addons` - List available add-ons
- `POST /api/validate-promo` - Validate a promo code
- `GET /api/promo-codes/validate` - Alternative promo code validation

## Database Schema

The quote management system uses the following database tables:

| Table | Description |
|-------|-------------|
| quotes | Stores quote information including subtotal, discount, and total |
| quote_items | Stores individual items in quotes with references to treatments, packages, or add-ons |
| promotions | Stores promotion information including discount type and value |
| treatments | Stores available dental treatments |
| packages | Stores treatment packages which can contain multiple treatments |
| addons | Stores additional services or items |

## Performance Optimizations

The quote management system incorporates several performance optimizations:

1. **Debounced Quote Saving**: Prevents excessive API calls during user editing by delaying save requests
2. **Memoized Components**: Uses React.memo and useMemo to prevent unnecessary re-renders
3. **Code Splitting with React.lazy**: Loads components on-demand to reduce initial load time
4. **Optimized State Management**: Tracks dirty state to minimize state updates

## Promo & Special Offer Integration

The system integrates with both promo codes and special offers:

1. **Promo Codes**: 
   - Can be applied manually in the builder
   - Can be auto-applied via URL parameters using the `use-auto-apply-code` hook
   - Support both percentage and fixed amount discounts

2. **Special Offers**:
   - Can be applied from the homepage or offers page
   - Are tracked through the quote flow via the `use-special-offers-in-quote` hook
   - Display visually in the quote summary

## Email Notifications

Quote confirmations can be sent via email using the following process:

1. User enters their email details in the QuoteConfirmationEmail component
2. Front-end validates the email format using Zod
3. API request is sent to `/api/quotes/send-email` with quote and recipient details
4. Server processes the request, generates a PDF quote (if applicable), and sends the email
5. The email includes quote details, pricing information, and clinic contact info

## Analytics Tracking

The quote management system includes comprehensive analytics tracking:

- **Quote Creation**: Tracks when quotes are created or updated
- **Promo Usage**: Tracks promo code application attempts and successes
- **Flow Navigation**: Tracks user progression through the quote flow
- **Email Sending**: Tracks email request and delivery events

## Error Handling

The system implements robust error handling:

1. **Form Validation**: Zod schemas validate user inputs
2. **API Error Handling**: Structured error handling for API requests
3. **User Feedback**: Toast notifications for success and error states
4. **Error Recovery**: Mechanisms to recover from failed API calls

## User Experience Improvements

Key UX enhancements include:

1. **Optimistic Updates**: UI updates immediately while saving happens in the background
2. **Loading States**: Clear loading indicators for async operations
3. **Toast Notifications**: Non-intrusive feedback for user actions
4. **Dirty State Tracking**: Visual indicators when changes need to be saved

## Future Enhancements

Potential future improvements include:

1. **Quote Templates**: Allow saving and reusing quote templates
2. **Bulk Operations**: Adding/removing multiple items at once
3. **Enhanced PDF Generation**: More customizable PDF quote generation
4. **Comparison View**: Side-by-side comparison of different quote options
5. **Treatment Recommendations**: AI-powered treatment recommendations

## Integration Points

The quote management system integrates with several other platform components:

1. **Authentication System**: For user identification and access control
2. **Clinic Management**: For clinic-specific pricing and treatments
3. **Payment Processing**: For handling payments based on quotes
4. **Notification System**: For alerting users about quote updates
5. **Analytics**: For tracking user behavior and conversion metrics

## Getting Started for Developers

To work with the quote management system:

1. **Import the hook**: `import { useQuoteBuilder } from '@/hooks/use-quote-builder'`
2. **Use optimized components**: Import the performance-optimized components
3. **Handle events**: Connect the appropriate callbacks for quote flow events
4. **Style consistently**: Follow the established design patterns

## Troubleshooting

Common issues and solutions:

1. **Quote not saving**: Ensure the database connection is properly configured
2. **Promo codes not applying**: Check that the promo validation endpoint is working
3. **Email not sending**: Verify the email service credentials are set
4. **Performance issues**: Use React DevTools Profiler to identify unnecessary re-renders