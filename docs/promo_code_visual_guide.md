# MyDentalFly Promo Code System - Visual Guide

## Promo Code Types & Features

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  PROMO CODE TYPES                                              │
│                                                                │
│  ┌───────────────────────────┐    ┌───────────────────────────┐│
│  │                           │    │                           ││
│  │  DISCOUNT CODES           │    │  PACKAGE CODES            ││
│  │                           │    │                           ││
│  │  • Percentage off         │    │  • Bundled treatments     ││
│  │  • Fixed amount off       │    │  • Specific clinic        ││
│  │  • Works with any clinic  │    │  • Tourist attractions    ││
│  │  • One-time use           │    │  • Price guarantee        ││
│  │                           │    │                           ││
│  └───────────────────────────┘    └───────────────────────────┘│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Promo Code Journey

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│         │     │         │     │         │     │         │     │         │
│  ENTER  │────▶│ VALIDATE│────▶│  APPLY  │────▶│  MATCH  │────▶│ GENERATE│
│  CODE   │     │         │     │         │     │  CLINIC │     │  QUOTE  │
│         │     │         │     │         │     │         │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
```

## How Package Codes Map to Clinics

```
┌────────────────────┐          ┌────────────────────┐
│                    │          │                    │
│    IMPLANT2023     │────────▶ │    DentSpa Clinic  │
│                    │          │                    │
└────────────────────┘          └────────────────────┘

┌────────────────────┐          ┌────────────────────┐
│                    │          │                    │
│     SMILE2023      │────────▶ │ Beyaz Ada Clinic   │
│                    │          │                    │
└────────────────────┘          └────────────────────┘

┌────────────────────┐          ┌────────────────────┐
│                    │          │                    │
│   FULLMOUTH2023    │────────▶ │ Dental Harmony     │
│                    │          │                    │
└────────────────────┘          └────────────────────┘
```

## Package Code Example (IMPLANT2023)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  IMPLANT2023 PACKAGE                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  TREATMENTS:                                               │  │
│  │  • 2x Dental Implants                                      │  │
│  │  • 2x Ceramic Crowns                                       │  │
│  │  • 1x Panoramic X-Ray                                      │  │
│  │  • 1x Dental Cleaning                                      │  │
│  │                                                            │  │
│  │  EXTRAS:                                                   │  │
│  │  • Free Airport Transfer                                   │  │
│  │  • Free Consultation                                       │  │
│  │  • Bosphorus Cruise Excursion                              │  │
│  │                                                            │  │
│  │  PRICE: £1,500 (Save £800 off regular price)               │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## User Interface Flow

```
┌─────────────────────┐
│                     │
│   HOMEPAGE          │
│                     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│                     │
│  TREATMENT BUILDER  │
│                     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│                     │
│   PROMO CODE INPUT  │◄───┐
│                     │    │
└──────────┬──────────┘    │
           │               │
           ▼               │
┌─────────────────────┐    │
│                     │    │
│  ENTER PATIENT INFO │    │
│                     │    │
└──────────┬──────────┘    │
           │               │
           ▼               │
┌─────────────────────┐    │
│                     │    │
│   MATCHED CLINICS   │────┘
│                     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│                     │
│     YOUR QUOTE      │
│                     │
└─────────────────────┘
```

## Technical Components

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  CLIENT COMPONENTS                                              │
│                                                                 │
│  ┌─────────────────────┐      ┌─────────────────────┐          │
│  │                     │      │                     │          │
│  │  PromoCodeInput     │◄────▶│   QuoteContext      │          │
│  │                     │      │                     │          │
│  └─────────────────────┘      └─────────────────────┘          │
│            ▲                           ▲                       │
│            │                           │                       │
│            ▼                           ▼                       │
│  ┌─────────────────────┐      ┌─────────────────────┐          │
│  │                     │      │                     │          │
│  │ MatchedClinicsPage  │◄────▶│  YourQuotePage      │          │
│  │                     │      │                     │          │
│  └─────────────────────┘      └─────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  SERVER ENDPOINTS                                               │
│                                                                 │
│  • GET   /api/promo-codes/validate/:code                        │
│  • POST  /api/promo-codes/apply                                 │
│  • POST  /api/promo-codes/apply-package                         │
│  • POST  /api/promo-codes/calculate-discount                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PROMO CODE SERVICE                                             │
│                                                                 │
│  • validateCode()       - Checks if a code is valid             │
│  • calculateDiscount()  - Calculates discount amount            │
│  • getPackagePromoCode() - Gets package details                 │
│  • getPackageTreatments() - Expands package treatments          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │     │           │
│ PROMO CODE│     │  SESSION  │     │  QUOTE    │     │  CLINIC   │
│ DATABASE  │     │  STORAGE  │     │  CONTEXT  │     │  FILTER   │
│           │     │           │     │           │     │           │
└─────┬─────┘     └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
      │                 │                 │                 │
      │                 │                 │                 │
      ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      APPLICATION FLOW                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Checklist

- [x] Promo code validation endpoint
- [x] Package code data structure
- [x] Clinic filtering mechanism
- [x] Auto-population of treatments
- [x] Discount calculation
- [x] Session storage integration
- [x] User interface components
- [x] Quote summary updates