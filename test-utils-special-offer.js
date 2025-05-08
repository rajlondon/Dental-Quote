/**
 * Test script for the special-offer-utils.ts utility functions
 */
import { applySpecialOfferToTreatments, calculateTotalPrice, hasSpecialOffer } from './client/src/utils/special-offer-utils.js';
import assert from 'assert';

// Test data
const mockTreatments = [
  {
    name: "Dental Implant",
    quantity: 2,
    price: 1000,
    priceGBP: 1000
  },
  {
    name: "Teeth Whitening",
    quantity: 1,
    price: 200,
    priceGBP: 200
  }
];

const mockSpecialOffer = {
  id: "offer-123",
  title: "Special Dental Deal",
  discountType: "percentage",
  discountValue: 20,
  clinicId: "clinic-456"
};

const mockFixedSpecialOffer = {
  id: "offer-789",
  title: "£100 Off Implants",
  discountType: "fixed_amount",
  discountValue: 100,
  clinicId: "clinic-456"
};

const zeroDiscountOffer = {
  id: "offer-zero",
  title: "Special Price",
  discountType: "percentage",
  discountValue: 0,
  clinicId: "clinic-789"
};

// Test applySpecialOfferToTreatments function
console.log("Testing applySpecialOfferToTreatments function...");

// Test with percentage discount
const treatmentsWithPercentageDiscount = applySpecialOfferToTreatments(mockTreatments, mockSpecialOffer);
console.log("Treatments with percentage discount:", JSON.stringify(treatmentsWithPercentageDiscount, null, 2));

assert(treatmentsWithPercentageDiscount[0].isSpecialOffer === true, "isSpecialOffer flag not set");
assert(treatmentsWithPercentageDiscount[0].basePriceGBP === 1000, "Original price not preserved");
assert(treatmentsWithPercentageDiscount[0].priceGBP === 800, "Percentage discount not applied correctly");
assert(treatmentsWithPercentageDiscount[0].specialOffer?.id === "offer-123", "Special offer data not attached");

console.log("✅ Percentage discount test passed");

// Test with fixed amount discount
const treatmentsWithFixedDiscount = applySpecialOfferToTreatments(mockTreatments, mockFixedSpecialOffer);
console.log("Treatments with fixed discount:", JSON.stringify(treatmentsWithFixedDiscount, null, 2));

assert(treatmentsWithFixedDiscount[0].isSpecialOffer === true, "isSpecialOffer flag not set");
assert(treatmentsWithFixedDiscount[0].basePriceGBP === 1000, "Original price not preserved");
assert(treatmentsWithFixedDiscount[0].priceGBP === 900, "Fixed discount not applied correctly");
assert(treatmentsWithFixedDiscount[0].specialOffer?.id === "offer-789", "Special offer data not attached");

console.log("✅ Fixed amount discount test passed");

// Test with zero discount
const treatmentsWithZeroDiscount = applySpecialOfferToTreatments(mockTreatments, zeroDiscountOffer);
console.log("Treatments with zero discount:", JSON.stringify(treatmentsWithZeroDiscount, null, 2));

assert(treatmentsWithZeroDiscount[0].isSpecialOffer === true, "isSpecialOffer flag not set");
assert(treatmentsWithZeroDiscount[0].basePriceGBP === 1000, "Original price not preserved");
assert(treatmentsWithZeroDiscount[0].priceGBP === 1000, "Price should be unchanged with zero discount");
assert(treatmentsWithZeroDiscount[0].specialOffer?.id === "offer-zero", "Special offer data not attached");

console.log("✅ Zero discount test passed");

// Test calculateTotalPrice function
console.log("\nTesting calculateTotalPrice function...");

const totalPrice = calculateTotalPrice(mockTreatments);
console.log("Total price:", totalPrice);
assert(totalPrice === 2200, "Total price calculation incorrect");

const discountedTotalPrice = calculateTotalPrice(treatmentsWithPercentageDiscount);
console.log("Discounted total price:", discountedTotalPrice);
assert(discountedTotalPrice === 1800, "Discounted total price calculation incorrect");

console.log("✅ Total price calculation test passed");

// Test hasSpecialOffer function
console.log("\nTesting hasSpecialOffer function...");

const hasOfferResult = hasSpecialOffer(treatmentsWithPercentageDiscount);
console.log("Has special offer:", hasOfferResult);
assert(hasOfferResult === true, "hasSpecialOffer should return true for treatments with offers");

const noOfferResult = hasSpecialOffer(mockTreatments);
console.log("Has no special offer:", noOfferResult);
assert(noOfferResult === false, "hasSpecialOffer should return false for treatments without offers");

console.log("✅ hasSpecialOffer test passed");

console.log("\n🎉 All tests passed! The special offer utilities are working correctly.");