/// <reference types="vite/client" />

declare module '@/utils/currency-formatter' {
  export function formatCurrency(amount: number, currency?: string, locale?: string): string;
  export function formatPercentage(value: number, locale?: string): string;
  export function formatSavings(originalPrice: number, discountedPrice: number, currency?: string, locale?: string): string;
  export function formatDiscountPercentage(originalPrice: number, discountedPrice: number, locale?: string): string;
}