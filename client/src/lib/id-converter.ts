/**
 * ID Conversion Utilities for Client
 * These utilities help convert between numeric IDs and UUID format IDs for treatment plans.
 */

/**
 * Converts a numeric ID to UUID format with a standard pattern
 * @param numericId - The numeric ID to convert
 * @returns A UUID formatted string
 */
export function convertNumericToUuid(numericId: string | number | undefined): string | undefined {
  if (!numericId) return undefined;
  
  const numericIdStr = String(numericId);
  
  // If it's already a UUID, return as is
  if (numericIdStr.includes('-')) {
    return numericIdStr;
  }
  
  // Only convert if it's actually a numeric string
  if (!/^\d+$/.test(numericIdStr)) {
    return numericIdStr;
  }
  
  return `00000000-0000-4000-a000-${numericIdStr.padStart(12, '0')}`;
}

/**
 * Safely converts any ID (string or number) to its UUID representation if needed
 * @param id - The ID to convert
 * @returns A UUID string if conversion is needed, otherwise the original ID
 */
export function ensureUuidFormat(id: string | number | undefined): string | undefined {
  if (!id) return undefined;
  
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