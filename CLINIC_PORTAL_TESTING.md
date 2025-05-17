# Clinic Portal Integration Testing Guide

This document provides steps to manually verify the integration between the clinic portal and enhanced quote builder.

## Test Case 1: Accessing Enhanced Quote Builder from Clinic Portal

1. **Login to Clinic Portal**
   - Navigate to http://localhost:5000/clinic-login
   - Enter your clinic credentials
   - Verify you are redirected to the clinic dashboard

2. **Navigate to Quote Management**
   - Click on "Quote Management" in the navigation menu
   - Verify you can see the list of quotes assigned to your clinic

3. **Create New Quote**
   - Click the "Create New Quote" button in the top-right corner
   - Verify you are redirected to the enhanced quote builder
   - Check the URL contains `?clinicId=YOUR_CLINIC_ID`
   - Confirm you see a "Clinic Mode Active" notification

## Test Case 2: Testing URL Parameters

1. **Direct URL Access with Clinic ID**
   - Navigate directly to: http://localhost:5000/enhanced-quote?clinicId=1
   - Verify "Clinic Mode Active" notification appears
   - Confirm the quote is being created in the context of the specified clinic

2. **Direct URL Access with Promo Code and Clinic ID**
   - Navigate to: http://localhost:5000/enhanced-quote?clinicId=1&promo=WELCOME10
   - Verify both "Clinic Mode Active" notification and "Promo code applied" notification appear
   - Create a quote and check that both the clinic association and promo code discount are applied

## Test Case 3: Submitting Quotes as Clinic Staff

1. **Create and Submit a Quote from Clinic Portal**
   - Start at the clinic portal
   - Click "Create New Quote"
   - Add several treatments to the quote
   - Apply a promo code if needed
   - Complete the patient information
   - Submit the quote
   - Verify the quote appears in your clinic's quote list

2. **Verify Quote Details**
   - Open the submitted quote from your clinic's quote list
   - Confirm it contains the correct:
     - Patient information
     - Treatment selections
     - Pricing with any applicable discounts
     - Clinic association

## Special Test Cases

### Testing Package Offers with Clinic ID
- Navigate to: http://localhost:5000/enhanced-quote?clinicId=1&promo=IMPLANTCROWN30
- Verify the Premium Implant Package is automatically added to the quote
- Confirm clinic association is maintained

### Testing Multiple Instances
- Open two browser windows side by side
- In one window, access the quote builder through the clinic portal
- In another window, access it as a patient
- Verify that each session maintains its own state and doesn't interfere with the other

## Troubleshooting Tips

If you encounter issues during testing:

1. **Clinic Mode Not Activating**
   - Check browser console logs for errors
   - Verify the clinicId parameter is correctly formatted in the URL
   - Make sure the clinic portal session is active

2. **Promo Codes Not Applying**
   - Confirm the promo code exists in the system
   - Check that the format is correct (case-sensitive)
   - Look for any error messages in the console

3. **Quote Not Associated with Clinic**
   - Verify the clinicPreference state is being correctly set in localStorage
   - Check that the clinic ID is passed through the entire quote creation flow