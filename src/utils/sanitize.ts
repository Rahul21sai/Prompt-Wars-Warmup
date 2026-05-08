/**
 * Input Sanitization Utilities
 * Strips dangerous HTML/script tags from user inputs to prevent XSS.
 */

/**
 * Strips HTML tags from input string to prevent XSS attacks.
 * Removes <script> tags and their content, then strips remaining HTML tags.
 * @param input - Raw user input string
 * @returns Sanitized string with HTML tags removed
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // Remove script tags and their content first
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Trim whitespace
  return sanitized.trim();
}

/**
 * Sanitizes a destination input specifically.
 * Allows alphanumeric characters, spaces, commas, periods, and hyphens.
 * @param destination - Raw destination input
 * @returns Sanitized destination string
 */
export function sanitizeDestination(destination: string): string {
  return sanitizeInput(destination).replace(/[^a-zA-Z0-9\s,.\-']/g, '');
}
