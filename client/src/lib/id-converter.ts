/**
 * ID Conversion Utilities for Client
 * These utilities help convert between numeric IDs and UUID format IDs for treatment plans.
 */

/**
 * Converts a numeric ID to UUID format with a standard pattern
 * @param numericId - The numeric ID to convert
 * @returns A UUID formatted string or empty string if the input is falsy
 * @throws Error if conversion fails
 */
export function convertNumericToUuid(numericId: string | number | undefined): string {
  if (!numericId) {
    console.warn('[ID Converter] Attempted to convert undefined/null ID to UUID');
    return '00000000-0000-4000-a000-000000000000';
  }
  
  const numericIdStr = String(numericId);
  
  // If it's already a UUID, return as is
  if (numericIdStr.includes('-')) {
    return numericIdStr;
  }
  
  // Only convert if it's actually a numeric string
  if (!/^\d+$/.test(numericIdStr)) {
    console.warn(`[ID Converter] Non-numeric ID provided: ${numericIdStr}`);
    return numericIdStr;
  }
  
  return `00000000-0000-4000-a000-${numericIdStr.padStart(12, '0')}`;
}

/**
 * Safely converts any ID (string or number) to its UUID representation if needed
 * @param id - The ID to convert
 * @returns A UUID string if conversion is needed, otherwise the original ID
 * @throws Error if conversion fails
 */
export function ensureUuidFormat(id: string | number | undefined): string {
  if (!id) {
    console.warn('[ID Converter] Attempted to format undefined/null ID to UUID');
    return '00000000-0000-4000-a000-000000000000';
  }
  
  const idStr = String(id);
  
  // If it's already a UUID format, return as is
  if (idStr.includes('-')) {
    return idStr;
  }
  
  // Only convert numeric IDs
  if (/^\d+$/.test(idStr)) {
    return convertNumericToUuid(idStr);
  }
  
  // Otherwise return as is
  return idStr;
}