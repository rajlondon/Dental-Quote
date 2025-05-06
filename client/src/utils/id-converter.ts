/**
 * ID Converter Utility
 * Provides functions to convert between different ID formats
 */

/**
 * Ensures a given ID is in the expected UUID format
 * @param id The ID to convert (can be numeric or UUID format)
 * @returns A properly formatted UUID string
 */
export function ensureUuidFormat(id: string | number): string {
  // If the ID is already in UUID format, return it
  if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  
  // If the ID is numeric, convert it to a deterministic UUID format
  const numericId = typeof id === 'string' ? id : id.toString();
  if (/^\d+$/.test(numericId)) {
    return `00000000-0000-4000-a000-${numericId.padStart(12, '0')}`;
  }
  
  // Otherwise, just return the ID as is
  return id.toString();
}

/**
 * Extracts a numeric ID from a UUID format if possible
 * @param uuid The UUID to extract from
 * @returns The extracted numeric ID or the original UUID if not extractable
 */
export function extractNumericId(uuid: string): string | number {
  // Check if the UUID matches our deterministic pattern
  const match = uuid.match(/^00000000-0000-4000-a000-(\d{12})$/);
  if (match) {
    // Extract the padded numeric ID and convert to number, removing leading zeros
    return parseInt(match[1], 10);
  }
  
  // If it doesn't match the pattern, return the original UUID
  return uuid;
}