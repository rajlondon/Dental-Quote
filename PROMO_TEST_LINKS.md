# Promo Code URL Auto-Apply Test Links

Use these links to test the promo code URL auto-apply functionality.

## Valid Promo Code Tests

### Test 1: WELCOME20
```
/your-quote?code=WELCOME20
```
Expected behavior:
- Promo banner appears showing "WELCOME20" and discount amount
- Discount is reflected in the quote total
- Dismissing the banner makes it disappear
- Refreshing the page keeps the promo applied
- Code persists through the quote flow

### Test 2: SUMMER50
```
/your-quote?code=SUMMER50
```
Expected behavior:
- Promo banner appears showing "SUMMER50" and discount amount
- Higher discount percentage than WELCOME20
- Discount is reflected in the quote total
- Code persists through all steps of the quote flow

### Test 3: Special Offer Codes

Try these special offer promo codes that match actual offers:

```
/your-quote?code=IMPLANTCROWN30
/your-quote?code=LUXHOTEL20
/your-quote?code=FREECONSULT
/your-quote?code=FREEWHITE
/your-quote?code=LUXTRAVEL
```

## Invalid Promo Code Tests

### Test 1: INVALID123
```
/your-quote?code=INVALID123
```
Expected behavior:
- Error toast appears indicating invalid promo code
- No discount is applied to the quote
- No promo banner appears

### Test 2: Expired Code
```
/your-quote?code=EXPIRED2024
```
Expected behavior:
- Error toast appears indicating expired promo code
- No discount is applied to the quote
- No promo banner appears

## Persistence Through Quote Flow Test

To test that a promo code persists through the entire quote journey:

1. Start at:
```
/your-quote?code=SUMMER50
```

2. Complete each step in the quote flow:
   - Select treatments
   - Enter patient information
   - Select clinic
   - Review summary
   - Proceed to payment (if applicable)

3. Verify at each step:
   - The promo banner remains visible
   - The discount continues to be applied
   - The final confirmation page includes promo details

## Edge Cases

### Multiple Codes (First One Should Be Used)
```
/your-quote?code=WELCOME20&code=SUMMER50
```

### Empty Code
```
/your-quote?code=
```

### Case Sensitivity Test
```
/your-quote?code=welcome20
```

## How to Run Automated Tests

Run the automated test script to validate the promo code API endpoints:

```bash
node test-promo-url-auto-apply.js
```

This script will test:
1. Valid promo code application
2. Invalid promo code rejection
3. Promo code persistence through quote flow