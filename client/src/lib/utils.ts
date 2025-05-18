import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a more readable format
 * Default format: "Jan 1, 2023"
 * With time: "Jan 1, 2023, 12:00 PM"
 */
export function formatDate(dateString: string, includeTime: boolean = false): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
    options.hour12 = true;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format a number as currency
 * Default currency: USD ($)
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount === undefined || amount === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a file size from bytes to human-readable format
 * e.g. 1024 -> "1.0 KB", 2048000 -> "2.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
