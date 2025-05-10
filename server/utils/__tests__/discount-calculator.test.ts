/**
 * Tests for discount calculator utility functions
 */
import { 
  calculateDiscountedPrice, 
  calculateDiscountAmount, 
  calculateDiscountPercentage,
  gbpToUsd,
  roundPrice
} from '../discount-calculator';

describe('calculateDiscountedPrice', () => {
  it('should correctly calculate discounted price with valid inputs', () => {
    expect(calculateDiscountedPrice(100, 20)).toBe(80);
    expect(calculateDiscountedPrice(99.99, 15)).toBe(84.99);
    expect(calculateDiscountedPrice(50, 0)).toBe(50);
    expect(calculateDiscountedPrice(200, 100)).toBe(0);
  });

  it('should handle small decimal values correctly', () => {
    expect(calculateDiscountedPrice(100, 0.5)).toBe(99.5);
    expect(calculateDiscountedPrice(19.99, 3.33)).toBe(19.32);
  });

  it('should throw error for negative original price', () => {
    expect(() => calculateDiscountedPrice(-100, 20)).toThrow('Original price cannot be negative');
  });

  it('should throw error for invalid discount percentage', () => {
    expect(() => calculateDiscountedPrice(100, -10)).toThrow('Discount percentage must be between 0 and 100');
    expect(() => calculateDiscountedPrice(100, 101)).toThrow('Discount percentage must be between 0 and 100');
  });
});

describe('calculateDiscountAmount', () => {
  it('should correctly calculate discount amount', () => {
    expect(calculateDiscountAmount(100, 80)).toBe(20);
    expect(calculateDiscountAmount(99.99, 49.99)).toBe(50);
    expect(calculateDiscountAmount(50, 50)).toBe(0);
  });

  it('should throw error for negative prices', () => {
    expect(() => calculateDiscountAmount(-100, 80)).toThrow('Prices cannot be negative');
    expect(() => calculateDiscountAmount(100, -20)).toThrow('Prices cannot be negative');
  });

  it('should throw error when discounted price is greater than original', () => {
    expect(() => calculateDiscountAmount(50, 60)).toThrow('Discounted price cannot be greater than original price');
  });
});

describe('calculateDiscountPercentage', () => {
  it('should correctly calculate discount percentage', () => {
    expect(calculateDiscountPercentage(100, 80)).toBe(20);
    expect(calculateDiscountPercentage(200, 100)).toBe(50);
    expect(calculateDiscountPercentage(50, 50)).toBe(0);
    expect(calculateDiscountPercentage(99.99, 0)).toBe(100);
  });

  it('should handle small decimal values correctly', () => {
    expect(calculateDiscountPercentage(100, 99.5)).toBe(0.5);
    expect(calculateDiscountPercentage(19.99, 19.32)).toBe(3.35);
  });

  it('should throw error for invalid original price', () => {
    expect(() => calculateDiscountPercentage(0, 0)).toThrow('Original price must be greater than zero');
    expect(() => calculateDiscountPercentage(-100, 80)).toThrow('Original price must be greater than zero');
  });

  it('should throw error for negative discounted price', () => {
    expect(() => calculateDiscountPercentage(100, -20)).toThrow('Discounted price cannot be negative');
  });

  it('should throw error when discounted price is greater than original', () => {
    expect(() => calculateDiscountPercentage(50, 60)).toThrow('Discounted price cannot be greater than original price');
  });
});

describe('gbpToUsd', () => {
  it('should convert GBP to USD using the default exchange rate', () => {
    expect(gbpToUsd(100)).toBe(130);
    expect(gbpToUsd(99.99)).toBe(129.99);
    expect(gbpToUsd(0)).toBe(0);
  });

  it('should convert GBP to USD using a custom exchange rate', () => {
    expect(gbpToUsd(100, 1.5)).toBe(150);
    expect(gbpToUsd(200, 1.2)).toBe(240);
  });

  it('should throw error for negative amounts', () => {
    expect(() => gbpToUsd(-100)).toThrow('Amount cannot be negative');
  });
});

describe('roundPrice', () => {
  it('should correctly round prices', () => {
    expect(roundPrice(99.99)).toBe(100);
    expect(roundPrice(99.01)).toBe(99);
    expect(roundPrice(99.5)).toBe(100);
    expect(roundPrice(0.49)).toBe(0);
  });
});

// Test for city-specific edge cases
describe('discount calculations with city context', () => {
  it('should work the same way regardless of city', () => {
    // These functions are city-agnostic and should work the same regardless of city context
    expect(calculateDiscountedPrice(100, 20)).toBe(80);
    expect(calculateDiscountAmount(100, 80)).toBe(20);
    expect(calculateDiscountPercentage(100, 80)).toBe(20);
  });
});