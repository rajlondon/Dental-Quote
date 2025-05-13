# Promo Code Test Links

These links can be used to quickly test the promo code URL auto-apply functionality in different scenarios.

## Valid Promo Codes

| Description | Link | Expected Behavior |
|-------------|------|-------------------|
| Base 25% Discount | [Test 25% Promo](http://localhost:5000/quote?code=TESTPROMO25) | 25% discount applied successfully |
| Free Consultation | [Free Consult](http://localhost:5000/quote?code=FREECONSULT) | Free consultation offer applied |
| Implant Bundle | [Implant + Crown](http://localhost:5000/quote?code=IMPLANTCROWN30) | 30% discount on implant+crown bundle |
| Hotel Discount | [Hotel Discount](http://localhost:5000/quote?code=LUXHOTEL20) | 20% discount on hotel accommodation |
| Teeth Whitening | [Free Whitening](http://localhost:5000/quote?code=FREEWHITE) | Free teeth whitening with veneer/crown packages |
| Airport Transfer | [Airport Transfer](http://localhost:5000/quote?code=LUXTRAVEL) | Complimentary airport transfer with major treatments |

## Invalid Promo Codes

| Description | Link | Expected Behavior |
|-------------|------|-------------------|
| Invalid Code | [Invalid Promo](http://localhost:5000/quote?code=INVALIDCODE) | Error message about invalid code |
| Expired Code | [Expired Promo](http://localhost:5000/quote?code=EXPIREDCODE) | Error message about expired code |
| Malformed Code | [Malformed](http://localhost:5000/quote?code=TEST%20SPACE) | Error message about invalid code format |
| Missing Code | [Missing Value](http://localhost:5000/quote?code=) | No code applied, no error message |

## Edge Cases

| Description | Link | Expected Behavior |
|-------------|------|-------------------|
| Lowercase Code | [Lowercase](http://localhost:5000/quote?code=testpromo25) | Code should be case-insensitive and still work |
| Different Parameter | [Wrong Param](http://localhost:5000/quote?promocode=TESTPROMO25) | No code applied (incorrect parameter name) |
| No Treatment Selected | [No Treatment](http://localhost:5000/quote?code=TESTPROMO25&treatment=none) | Code applied but may show warning about treatment requirements |

## Product URLs with Promo Codes

These URLs simulate a user clicking through from a marketing campaign directly to a specific treatment with a promo code already applied.

| Description | Link | Expected Behavior |
|-------------|------|-------------------|
| Implant with Code | [Implant Promo](http://localhost:5000/quote?treatment=dental_implant&code=TESTPROMO25) | Quote started for implant with promo applied |
| Veneers with Code | [Veneers Promo](http://localhost:5000/quote?treatment=porcelain_veneers&code=FREEWHITE) | Quote started for veneers with whitening offer |
| Full Mouth with Code | [Full Mouth Promo](http://localhost:5000/quote?treatment=full_mouth_reconstruction&code=LUXTRAVEL) | Quote started for full mouth with travel offer |

## Advanced Testing

For automated testing, run:

```bash
node test-promo-url-auto-apply.mjs
```

This script will test the API endpoints directly for:
- Valid promo code application
- Invalid promo code rejection
- Promo code persistence through the quote flow