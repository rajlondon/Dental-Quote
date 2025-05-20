# Clinic-Initiated Promotions System

## Overview

The Clinic-Initiated Promotions system allows clinics to create and manage their own special offers and packages directly through the clinic portal. Once submitted, these promotions go through an approval process by the platform administrators before becoming visible to potential patients.

## Promotion Workflow

1. **Creation in Clinic Portal**
   * Clinic staff create a promotion draft
   * Can save and continue editing before submission
   * Two promotion types supported: Discount and Package

2. **Submission for Approval**
   * Clinic submits completed promotion
   * System records submission time and changes status to "Pending Approval"

3. **Admin Review**
   * Admin reviews pending promotions
   * Can approve or reject with feedback
   * Can modify dates and homepage display settings

4. **Active Period**
   * Once approved, promotions become active based on configured start date
   * Automatically expire after end date
   * Can be featured on the homepage based on admin settings

## Promotion Types

### Discount Promotions
* Apply percentage or fixed amount discounts to specific treatments
* Example: "20% off all dental implants" or "£100 off veneers"
* Applicable treatments must be specified

### Package Promotions
* Bundle multiple treatments at a discounted package price
* Include tourist attractions or additional services
* Example: "Complete Smile Makeover Package" with multiple treatments

## Dashboard Views

### Clinic Portal View
* All promotions with status filters (Draft, Pending, Approved, Rejected)
* Analytics for active promotions (Views, Applications, Bookings)
* Create and edit interface for promotions

### Admin Portal View
* Pending approvals queue
* Detailed review interface
* Ability to feature promotions on homepage
* Set priority level for homepage display

## Promotion Code System

Each promotion generates a unique promo code that patients can enter during the quote request process. This code can:

* Auto-apply discounts to eligible treatments
* Pre-select a complete package of treatments
* Direct patients to the specific clinic offering the promotion

## Benefits

### For Clinics
* Direct marketing control
* Ability to create time-limited offers
* Package bundling capabilities
* Increased visibility on platform

### For Patients
* Access to special discounts
* Simplified treatment bundles
* Clear savings information
* Complete health vacation packages

### For Platform
* Increased engagement
* Higher conversion rates
* Promotion management
* Quality control through approval process

## Technical Implementation

* React frontend with TypeScript
* Express backend with API routes
* Secure authentication and authorization
* Realtime status updates
* Analytics tracking

---

## Code Structure

The promotion system follows a clear architecture:

```
/client
  /components
    /clinic
      - PromotionsList.tsx  (List view of clinic promotions)
      - PromotionForm.tsx   (Creation/editing form)
    /admin
      - PendingApprovalsList.tsx (Admin review interface)
      - PromotionReview.tsx      (Detailed review dialog)
    /homepage
      - FeaturedPromotions.tsx   (Homepage display component)
  /pages
    /clinic
      - PromotionsPage.tsx       (Main clinic promotion management page)
    /admin
      - PendingApprovals.tsx     (Admin approval management page)

/server
  /routes
    - clinic-promotion-routes.ts (API endpoints)
  /services
    - clinic-promotion-service.ts (Business logic)
  /models
    - promo-code.ts              (Data models)
```