/**
 * ID Conversion Utilities
 * These utilities help convert between numeric IDs and UUID format IDs for treatment plans.
 */

/**
 * Converts a numeric ID to UUID format with a standard pattern
 * @param numericId - The numeric ID to convert
 * @returns A UUID formatted string
 */
export function convertNumericToUuid(numericId: string | number): string {
  const numericIdStr = String(numericId);
  return `00000000-0000-4000-a000-${numericIdStr.padStart(12, '0')}`;
}

/**
 * Extracts the numeric ID from a UUID that was created with our pattern
 * @param uuid - UUID format string to extract from
 * @returns The numeric ID as a string, or the original UUID if extraction fails
 */
export function extractNumericFromUuid(uuid: string): string {
  // If it's not in our UUID format, return as-is
  if (!uuid || !uuid.includes('-') || !uuid.startsWith('00000000-0000-4000-a000-')) {
    return uuid;
  }
  
  try {
    const parts = uuid.split('-');
    if (parts.length !== 5) return uuid;
    
    const numericPart = parts[4];
    // Remove leading zeros
    const cleanNumeric = numericPart.replace(/^0+/, '');
    
    // Validate it's actually a number
    if (/^\d+$/.test(cleanNumeric)) {
      return cleanNumeric;
    }
    
    return uuid;
  } catch (error) {
    console.error(`[ERROR] Failed to extract numeric ID from UUID: ${uuid}`, error);
    return uuid;
  }
}

/**
 * Determines if a string is already in UUID format
 * @param id - The ID to check
 * @returns True if the ID is in UUID format
 */
export function isUuidFormat(id: string): boolean {
  return id.includes('-');
}