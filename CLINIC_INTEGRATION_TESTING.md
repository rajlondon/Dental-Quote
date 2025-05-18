# Clinic Portal Integration Testing

This document provides instructions for testing the integration between the clinic portal and the enhanced quote builder system.

## Overview

The clinic integration allows clinic staff to create quotes for patients directly from the clinic portal. The quotes will be automatically associated with the clinic, and the clinic context will be maintained throughout the quote creation process.

## Testing Methods

There are three ways to test the clinic portal integration:

### 1. Direct URL Testing

You can test the integration by directly accessing the quote flow with a clinic ID parameter:

```
/quote-flow?clinic=40
```

Replace `40` with any valid clinic ID in your system. This will simulate a quote being created from the clinic portal.

### 2. Testing from Clinic Portal UI

1. Log in as a clinic staff member
2. Navigate to the clinic dashboard
3. Click on the "Create New Quote" button
4. Verify that you are redirected to the quote builder with the clinic context preserved

### 3. Automated Testing

Run the automated test script to verify the integration:

```bash
node test-clinic-integration.mjs
```

This script:
1. Logs in as a clinic user
2. Accesses the quote builder from the clinic portal
3. Verifies that the clinic ID is properly passed
4. Checks that the clinic mode indicator is displayed

## What to Look For

When testing the integration, verify the following:

1. **Clinic Mode Indicator**: When accessing the quote builder from the clinic portal, a blue "Clinic Mode" indicator should appear at the top of the page showing which clinic is creating the quote.

2. **Clinic ID in URL**: The URL should contain the clinic ID parameter (`?clinic=XX`) when accessing from the clinic portal.

3. **Clinic Preference in Quote**: The created quote should have the clinic preference set to the clinic ID.

4. **Navigation**: You should be able to navigate through the entire quote flow while maintaining the clinic context.

5. **Final Destination**: After completing the quote, it should be saved to the patient portal and also be visible in the clinic's dashboard.

## Troubleshooting

If the integration is not working as expected:

1. Check session storage for clinic ID:
   - Open browser dev tools
   - Go to Application > Storage > Session Storage
   - Verify that `clinic_id` or `selected_clinic_id` is present

2. Verify clinic detection:
   - Open browser dev tools
   - Check console for the message "Clinic ID detected in URL: XX"

3. Check for errors in the network requests:
   - Look for any failed API requests in the Network tab
   - Verify that the clinic ID is being included in relevant API calls

## Main Integration Points

The integration is built using these key components:

1. `ClinicModeIndicator` - A component that displays when a quote is being created in clinic mode
2. `useClinic` hook - Manages clinic data throughout the application
3. `IntegratedQuoteFlowPage` - Connects all steps of the quote flow with clinic context awareness
4. "Create New Quote" button on the clinic dashboard - Entry point for creating quotes from the clinic portal

## Recent Updates

- Added a "Create New Quote" button to the clinic dashboard
- Enhanced the IntegratedQuoteFlowPage to detect and utilize clinic IDs
- Created the ClinicModeIndicator component to show when in clinic mode
- Implemented persistent clinic context throughout the quote flow