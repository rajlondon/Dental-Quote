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
  if (!numericId) {
    console.warn('[ID Converter] Attempted to convert undefined/null ID to UUID');
    return '00000000-0000-4000-a000-000000000000';
  }
  
  const numericIdStr = String(numericId);
  return `00000000-0000-4000-a000-${numericIdStr.padStart(12, '0')}`;
}

/**
 * Extracts the numeric ID from a UUID that was created with our pattern
 * @param uuid - UUID format string to extract from
 * @returns The numeric ID as a string, or the original UUID if extraction fails
 */
export function extractNumericFromUuid(uuid: string): string {
  // If it's null or undefined, return a safe default
  if (!uuid) {
    console.warn('[ID Converter] Attempted to extract from undefined/null UUID');
    return '0';
  }
  
  // If it's not a string, convert it
  const uuidStr = String(uuid);
  
  // If it's already numeric, return as-is
  if (/^\d+$/.test(uuidStr)) {
    return uuidStr;
  }
  
  // If it's not in our UUID format, return as-is
  if (!uuidStr.includes('-') || !uuidStr.startsWith('00000000-0000-4000-a000-')) {
    return uuidStr;
  }
  
  try {
    const parts = uuidStr.split('-');
    if (parts.length !== 5) return uuidStr;
    
    const numericPart = parts[4];
    // Remove leading zeros
    const cleanNumeric = numericPart.replace(/^0+/, '');
    
    // If it's an empty string after removing zeros, return '0'
    if (cleanNumeric === '') return '0';
    
    // Validate it's actually a number
    if (/^\d+$/.test(cleanNumeric)) {
      return cleanNumeric;
    }
    
    return uuidStr;
  } catch (error) {
    console.error(`[ERROR] Failed to extract numeric ID from UUID: ${uuidStr}`, error);
    return uuidStr;
  }
}

/**
 * Determines if a string is already in UUID format
 * @param id - The ID to check
 * @returns True if the ID is in UUID format
 */
export function isUuidFormat(id: string): boolean {
  if (!id) return false;
  return String(id).includes('-');
}