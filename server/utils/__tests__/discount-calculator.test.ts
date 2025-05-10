import {
  calculateDiscountedPrice,
  calculateDiscountAmount,
  calculateDiscountPercentage,
  gbpToUsd,
  roundPrice
} from '../discount-calculator';

describe('Discount Calculator', () => {
  describe('calculateDiscountedPrice', () => {
    it('should correctly calculate discounted price with discount percentage', () => {
      expect(calculateDiscountedPrice(100, 20)).toBe(80);
      expect(calculateDiscountedPrice(150.50, 15)).toBe(127.93);
      expect(calculateDiscountedPrice(99.99, 10)).toBe(89.99);
    });

    it('should return original price when discount is 0%', () => {
      expect(calculateDiscountedPrice(100, 0)).toBe(100);
      expect(calculateDiscountedPrice(150.50, 0)).toBe(150.50);
    });
    
    it('should return 0 when discount is 100%', () => {
      expect(calculateDiscountedPrice(100, 100)).toBe(0);
      expect(calculateDiscountedPrice(150.50, 100)).toBe(0);
    });
    
    it('should throw an error for negative original price', () => {
      expect(() => calculateDiscountedPrice(-100, 20)).toThrow('Original price cannot be negative');
    });
    
    it('should throw an error for out-of-range discount percentage', () => {
      expect(() => calculateDiscountedPrice(100, -10)).toThrow('Discount percentage must be between 0 and 100');
      expect(() => calculateDiscountedPrice(100, 110)).toThrow('Discount percentage must be between 0 and 100');
    });
  });
  
  describe('calculateDiscountAmount', () => {
    it('should correctly calculate discount amount', () => {
      expect(calculateDiscountAmount(100, 80)).toBe(20);
      expect(calculateDiscountAmount(150.50, 127.93)).toBe(22.57);
    });
    
    it('should return 0 when original price equals discounted price', () => {
      expect(calculateDiscountAmount(100, 100)).toBe(0);
    });
    
    it('should return original price when discounted price is 0', () => {
      expect(calculateDiscountAmount(100, 0)).toBe(100);
    });
    
    it('should throw an error for negative prices', () => {
      expect(() => calculateDiscountAmount(-100, 80)).toThrow('Prices cannot be negative');
      expect(() => calculateDiscountAmount(100, -80)).toThrow('Prices cannot be negative');
    });
    
    it('should throw an error when discounted price is greater than original price', () => {
      expect(() => calculateDiscountAmount(100, 120)).toThrow('Discounted price cannot be greater than original price');
    });
  });
  
  describe('calculateDiscountPercentage', () => {
    it('should correctly calculate discount percentage', () => {
      expect(calculateDiscountPercentage(100, 80)).toBe(20);
      expect(calculateDiscountPercentage(150.50, 127.93)).toBe(15);
      expect(calculateDiscountPercentage(99.99, 89.99)).toBe(10);
    });
    
    it('should return 0 when original price equals discounted price', () => {
      expect(calculateDiscountPercentage(100, 100)).toBe(0);
    });
    
    it('should return 100 when discounted price is 0', () => {
      expect(calculateDiscountPercentage(100, 0)).toBe(100);
    });
    
    it('should throw an error for zero or negative original price', () => {
      expect(() => calculateDiscountPercentage(0, 0)).toThrow('Original price must be greater than zero');
      expect(() => calculateDiscountPercentage(-100, 80)).toThrow('Original price must be greater than zero');
    });
    
    it('should throw an error for negative discounted price', () => {
      expect(() => calculateDiscountPercentage(100, -80)).toThrow('Discounted price cannot be negative');
    });
    
    it('should throw an error when discounted price is greater than original price', () => {
      expect(() => calculateDiscountPercentage(100, 120)).toThrow('Discounted price cannot be greater than original price');
    });
  });
  
  describe('gbpToUsd', () => {
    it('should correctly convert GBP to USD with default exchange rate', () => {
      expect(gbpToUsd(100)).toBe(130);
      expect(gbpToUsd(150.50)).toBe(195.65);
    });
    
    it('should correctly convert GBP to USD with custom exchange rate', () => {
      expect(gbpToUsd(100, 1.5)).toBe(150);
      expect(gbpToUsd(150.50, 1.2)).toBe(180.60);
    });
    
    it('should throw an error for negative amounts', () => {
      expect(() => gbpToUsd(-100)).toThrow('Amount cannot be negative');
    });
  });
  
  describe('roundPrice', () => {
    it('should correctly round prices', () => {
      expect(roundPrice(100.4)).toBe(100);
      expect(roundPrice(100.5)).toBe(101);
      expect(roundPrice(99.99)).toBe(100);
    });
  });
});

// Test for integration between the discount calculation functions
describe('Discount Calculation Integration', () => {
  it('should maintain consistency between discount functions', () => {
    const originalPrice = 100;
    const discountPercentage = 20;
    
    // Calculate the discounted price
    const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
    
    // Calculate the discount amount from the original and discounted prices
    const calculatedDiscountAmount = calculateDiscountAmount(originalPrice, discountedPrice);
    
    // Calculate the discount percentage from the original and discounted prices
    const calculatedDiscountPercentage = calculateDiscountPercentage(originalPrice, discountedPrice);
    
    // Verify that the calculated values match the expected values
    expect(discountedPrice).toBe(80);
    expect(calculatedDiscountAmount).toBe(20);
    expect(calculatedDiscountPercentage).toBe(20);
  });
});

// Test the functions with real-world examples from the application
describe('Real-world Use Cases', () => {
  it('should handle package discount calculations correctly', () => {
    // Example: A dental implant package with 15% discount
    const originalPrice = 1850;
    const discountPercentage = 15;
    
    const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
    const discountAmount = calculateDiscountAmount(originalPrice, discountedPrice);
    const calculatedPercentage = calculateDiscountPercentage(originalPrice, discountedPrice);
    
    expect(discountedPrice).toBe(1572.50);
    expect(discountAmount).toBe(277.50);
    expect(calculatedPercentage).toBe(15);
    
    // Convert to USD for display
    const priceInUSD = gbpToUsd(discountedPrice);
    expect(priceInUSD).toBe(2044.25);
  });
  
  it('should handle special offer calculations correctly', () => {
    // Example: A teeth whitening special offer with 30% discount
    const originalPrice = 399;
    const discountPercentage = 30;
    
    const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
    const discountAmount = calculateDiscountAmount(originalPrice, discountedPrice);
    
    expect(discountedPrice).toBe(279.30);
    expect(discountAmount).toBe(119.70);
    
    // When rounding for display
    const roundedOriginal = roundPrice(originalPrice);
    const roundedDiscounted = roundPrice(discountedPrice);
    
    expect(roundedOriginal).toBe(399);
    expect(roundedDiscounted).toBe(279);
  });
});