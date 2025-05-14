# Quote Management System Documentation

## System Overview
The Quote Management System allows users to create custom quotes for dental treatments with support for promo codes and special offers.

## Key Components

### Core Components
- **QuoteBuilder**: Core component for selecting treatments and building quotes
- **QuoteFlow**: Multi-step flow for guiding users through quote creation
- **QuoteSummary**: Displays quote details and pricing information
- **QuoteConfirmation**: Final step for confirming and submitting quotes
- **QuoteConfirmationEmail**: Handles sending quote confirmation emails

### Integration Points
- **Special Offers**: Integrated via useSpecialOffersInQuote hook
- **Promo Codes**: Supported via URL parameters and manual entry
- **Analytics**: Tracks user interactions throughout the quote flow

## State Management
The system uses React hooks for state management:
- **useQuoteBuilder**: Manages quote state and operations
- **useSpecialOffersInQuote**: Handles special offer application
- **useAutoApplyCode**: Manages promo code application from URL

## API Endpoints
- **POST /api/quotes-api** - Create new quote
- **GET /api/quotes-api/:id** - Get quote by ID
- **PATCH /api/quotes-api/:id** - Update quote
- **DELETE /api/quotes-api/:id** - Delete quote
- **GET /api/promo-codes/validate** - Validate promo code
- **POST /api/quotes/:id/send-confirmation** - Send confirmation email

## User Flows

### Quote Creation Flow
1. User selects treatments, packages, and/or add-ons
2. System calculates pricing
3. User applies promo code (if applicable)
4. User reviews quote summary
5. User confirms quote
6. User receives confirmation via email (optional)

### Promo Code Application
1. System checks URL for promo code parameters
2. If found, system auto-applies the promo code
3. User can manually enter promo code
4. System validates promo code with backend
5. If valid, discount is applied to the quote

### Special Offer Application
1. User clicks on special offer
2. System applies the offer to the quote
3. Applicable treatments get discount
4. Offer displays in the quote summary

## Performance Optimizations
The system includes several performance optimizations:
- React.memo for preventing unnecessary re-renders
- useMemo for expensive calculations like price formatting
- Lazy loading for quote steps components
- Efficient state management with context API

## Error Handling
- Network error handling with fallback UI
- Input validation for promo codes
- Toast notifications for user feedback
- Analytics tracking for errors

## Integration Guidelines

### User Authentication
- Quotes are associated with authenticated users when available
- Anonymous quotes are supported for new users

### Clinic Selection
- Quotes can be associated with specific clinics
- Clinic-specific pricing is supported

### Treatment Data
- System supports up-to-date treatment pricing
- Treatments can be categorized and filtered

### Payment Integration
- Quote system connects with payment processing
- Stripe integration handles payments securely

## Testing Strategy

### Unit Testing
- Test individual components in isolation
- Test hooks with different scenarios

### Integration Testing
- Test component interactions
- Test data flow between components

### End-to-End Testing
- Test full quote creation flow
- Test promo code application
- Test special offer application

## Maintenance and Updates
- Regular updates to treatment pricing
- Adding new treatment options
- Updating discount calculation logic
- Managing promo code campaigns

## Troubleshooting
- Check browser console for errors
- Verify network requests in DevTools
- Test promo codes manually
- Check server logs for backend errors