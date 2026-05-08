/**
 * Format Utilities
 * Reusable functions for string and data formatting.
 */

/**
 * Capitalizes the first letter of a string.
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
