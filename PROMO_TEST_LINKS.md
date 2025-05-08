# Promotional Code Testing Links

## Test Links

Copy and paste these URLs into your browser to test the promotional code filtering:

### 1. DENTSPA20 Promo Code

```
/matched-clinics?source=promo_token&clinicId=dentspa&promoToken=DENTSPA20&treatmentItems=[{"id":"dental_implant_standard","name":"Dental Implant","quantity":2,"priceGBP":1800,"subtotalGBP":3600,"category":"Implants"},{"id":"dental_crown","name":"Dental Crown","quantity":2,"priceGBP":600,"subtotalGBP":1200,"category":"Cosmetic"},{"id":"teeth_whitening","name":"Teeth Whitening","quantity":1,"priceGBP":350,"subtotalGBP":350,"category":"Cosmetic"}]
```

### 2. BEYAZ250 Promo Code

```
/matched-clinics?source=promo_token&clinicId=beyazada&promoToken=BEYAZ250&treatmentItems=[{"id":"dental_implant_standard","name":"Dental Implant","quantity":2,"priceGBP":1800,"subtotalGBP":3600,"category":"Implants"},{"id":"dental_crown","name":"Dental Crown","quantity":2,"priceGBP":600,"subtotalGBP":1200,"category":"Cosmetic"},{"id":"teeth_whitening","name":"Teeth Whitening","quantity":1,"priceGBP":350,"subtotalGBP":350,"category":"Cosmetic"}]
```

### 3. MALTEPE15 Promo Code

```
/matched-clinics?source=promo_token&clinicId=maltepe&promoToken=MALTEPE15&treatmentItems=[{"id":"dental_implant_standard","name":"Dental Implant","quantity":2,"priceGBP":1800,"subtotalGBP":3600,"category":"Implants"},{"id":"dental_crown","name":"Dental Crown","quantity":2,"priceGBP":600,"subtotalGBP":1200,"category":"Cosmetic"},{"id":"teeth_whitening","name":"Teeth Whitening","quantity":1,"priceGBP":350,"subtotalGBP":350,"category":"Cosmetic"}]
```

### 4. Control (No Promo Code)

```
/matched-clinics?source=promo_token&treatmentItems=[{"id":"dental_implant_standard","name":"Dental Implant","quantity":2,"priceGBP":1800,"subtotalGBP":3600,"category":"Implants"},{"id":"dental_crown","name":"Dental Crown","quantity":2,"priceGBP":600,"subtotalGBP":1200,"category":"Cosmetic"},{"id":"teeth_whitening","name":"Teeth Whitening","quantity":1,"priceGBP":350,"subtotalGBP":350,"category":"Cosmetic"}]
```

## Testing Instructions

1. Copy one of the URLs above
2. Append it to your application's base URL (e.g., `https://yourdomain.com`)
3. Open the URL in your browser
4. Observe that:
   - With a promo code, only one clinic is displayed with the appropriate badge
   - Without a promo code, all clinics are shown in comparison view

## Expected Results

When using a promo code URL, the application should:
1. Only show the clinic associated with that promo code
2. Display a special badge with the promo code name
3. Use the SingleClinicCard component rather than the standard comparison view

## Implementation Details

The filtering is implemented in the MatchedClinicsPage component with the following code:

```jsx
{isPromoTokenFlow && promoToken ? (
  // If we're in a promo flow, only show the clinic associated with the promo
  // We'll use the SingleClinicCard component for this
  clinicsData
    .filter(clinic => clinic.id === clinicId)
    .map(clinic => {
      const { clinicTreatments, totalPrice } = getClinicPricing(clinic.id, treatmentPlan);
      
      return (
        <SingleClinicCard 
          key={clinic.id}
          clinic={clinic}
          badge={`Special Offer: ${promoToken}`}
          onSelect={() => handleSelectClinic(clinic.id)}
          totalPrice={totalPrice}
        />
      );
    })
) : (
  // Normal flow - show all clinics
  // ...
)}
```