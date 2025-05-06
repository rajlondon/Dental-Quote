/**
 * Format a date string or timestamp to a readable format
 * @param dateInput Date string, timestamp, or Date object
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateInput: string | number | Date | undefined | null,
  options: { includeTime?: boolean; shortMonth?: boolean } = {}
): string {
  if (!dateInput) return 'N/A';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const { includeTime = false, shortMonth = true } = options;
    
    // Format for date part
    const formatter = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: shortMonth ? 'short' : 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Get the time elapsed since a given date
 * @param dateInput Date string, timestamp, or Date object
 * @returns Time elapsed string (e.g. "3 days ago", "Just now")
 */
export function getTimeElapsed(dateInput: string | number | Date | undefined | null): string {
  if (!dateInput) return 'N/A';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    
    return formatDate(date);
  } catch (error) {
    console.error('Error calculating time elapsed:', error);
    return 'Unknown';
  }
}

/**
 * Compare two dates and return the number of days between them
 * @param date1 First date
 * @param date2 Second date (defaults to current date)
 * @returns Number of days between the dates
 */
export function getDaysBetween(
  date1: string | number | Date | undefined | null,
  date2: string | number | Date | undefined | null = new Date()
): number | null {
  if (!date1 || !date2) return null;
  
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    
    // Reset time part for both dates to compare only dates
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffMs = d2.getTime() - d1.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days between dates:', error);
    return null;
  }
}

/**
 * Check if a date is in the future
 * @param dateInput Date to check
 * @returns True if the date is in the future
 */
export function isFutureDate(dateInput: string | number | Date | undefined | null): boolean {
  if (!dateInput) return false;
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return false;
    
    return date.getTime() > Date.now();
  } catch (error) {
    console.error('Error checking if date is in future:', error);
    return false;
  }
}

/**
 * Check if a date is in the past
 * @param dateInput Date to check
 * @returns True if the date is in the past
 */
export function isPastDate(dateInput: string | number | Date | undefined | null): boolean {
  if (!dateInput) return false;
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return false;
    
    return date.getTime() < Date.now();
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
}

/**
 * Checks if a date is recent (within the specified number of days)
 * @param dateInput Date to check
 * @param days Number of days to consider as recent (default: 7)
 */
export function isRecentDate(
  dateInput: string | number | Date | undefined | null,
  days: number = 7
): boolean {
  const daysBetween = getDaysBetween(dateInput);
  if (daysBetween === null) return false;
  
  return daysBetween <= days && daysBetween >= 0;
}