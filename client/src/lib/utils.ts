import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Merges class names using clsx and tailwind-merge
 * Useful for conditional styling with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this
    
    const later = () => {
      timeout = null
      func.apply(context, args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generates a random string ID
 * @param length The length of the ID to generate
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * Format a date object into a human-readable string
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions to customize the formatting
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

/**
 * Truncate a string to a specified length and append an ellipsis
 * @param str The string to truncate
 * @param length The maximum length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

/**
 * Capitalize the first letter of a string
 * @param str The string to capitalize
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}