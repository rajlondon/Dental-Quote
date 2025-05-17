# Testing the Clinic Portal Integration with Enhanced Quote Builder

This document provides instructions for testing the integration between the clinic portal and the enhanced quote builder.

## Overview

The enhanced quote builder can be accessed from different contexts:
1. Directly from the homepage by patients
2. From the clinic portal by clinic staff
3. Via direct URL with query parameters

When accessed from the clinic portal, the quote builder should:
- Display a clinic mode indicator
- Pre-select the clinic in the workflow
- Maintain clinic context throughout the quote creation process
- Associate the created quote with the clinic

## Test Methods

There are three ways to test this integration:

### 1. Manual Testing via Browser

#### Prerequisites
- A valid clinic staff account
- Access to the clinic portal

#### Test Steps
1. Log in to the clinic portal using clinic staff credentials
2. Navigate to the "Quotes" section
3. Click on "Create New Quote" button
4. Verify that the quote builder opens with the clinic mode indicator visible
5. Complete the quote creation process
6. Verify that the quote appears in the clinic's quote list

### 2. Direct URL Testing

The quote builder can be directly accessed with clinic context via URL parameters.

#### URL Parameters
- `clinic`: The clinic ID to associate with the quote
- `code`: (Optional) A promo code to apply automatically

#### Test URLs
- `/quote-builder?clinic=123` - Opens quote builder in clinic mode for clinic ID 123
- `/quote-builder?clinic=123&code=WELCOME10` - Opens quote builder in clinic mode with a promo code

#### Test Steps
1. Access the URL directly in your browser
2. Verify the clinic mode indicator appears
3. Verify any promo code is automatically applied
4. Complete the quote process
5. Verify the association with the correct clinic

### 3. Automated Testing

We provide an automated test script that verifies the clinic portal integration.

#### Running the Test Script
```bash
node test-clinic-quote-builder-flow.js
```

The script performs the following checks:
- Logs in as a clinic user
- Verifies the clinic session is active
- Accesses the quote builder through the clinic portal
- Confirms the clinic mode indicator is present
- Validates that the clinic ID is properly passed

## Successful Integration Indicators

A successful integration should show these indicators:

1. **Visual Indicator**: The clinic mode banner appears at the top of the quote builder
2. **Data Flow**: The clinic ID is properly passed through the workflow
3. **State Persistence**: The clinic association is maintained even if the page is refreshed
4. **Quote Attribution**: Completed quotes are properly attributed to the clinic

## Common Issues and Troubleshooting

### Session Expiration
If the clinic session expires during testing, you may need to log in again to the clinic portal.

### Missing Clinic ID
If the clinic mode indicator doesn't appear, check that:
- You're properly logged in to the clinic portal
- The clinic ID is correctly passed in the URL
- The `clinicPreference` field is being properly stored in the persistent quote state

### Browser Cache
If you encounter unexpected behavior, try clearing your browser cache or using an incognito/private browsing window.

## Integration Architecture

The integration works through these key components:

1. **ClinicProvider**: Makes clinic data available throughout the application
2. **useClinic Hook**: Provides access to clinic data and operations
3. **usePersistentQuote Hook**: Stores the clinic preference in persistent state
4. **ClinicModeIndicator**: Displays a visual indicator when in clinic mode
5. **URL Parameter Handling**: Auto-applies clinic ID from URL parameters

## Reporting Issues

When reporting issues with the clinic integration, please include:
- The exact steps to reproduce the issue
- Your browser and version
- Screenshots showing the problem
- Any console errors visible in the browser developer tools