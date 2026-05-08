/**
 * Constraint Engine - Pure validation functions
 * All functions are pure (no side effects, no API calls)
 * Called BEFORE generating itinerary to validate user inputs
 */

/** Venue type used by the dietary filter */
export interface Venue {
  name: string;
  tags: string[];
}

/**
 * Validates that the total estimated cost does not exceed the user's budget.
 * Returns false if totalCost > budget or if budget is zero/negative.
 * @param totalCost - The estimated total cost of the itinerary
 * @param budget - The user's maximum budget in USD
 * @returns true if within budget, false otherwise
 */
export function validateBudget(totalCost: number, budget: number): boolean {
  if (budget <= 0) return false;
  return totalCost <= budget;
}

/**
 * Validates that the start and end dates form a valid future date range.
 * Rejects past dates and cases where end is before start.
 * @param startDate - ISO date string for trip start
 * @param endDate - ISO date string for trip end
 * @returns true if date range is valid and in the future
 */
export function validateDates(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Strip time component for date-only comparison
  now.setHours(0, 0, 0, 0);

  // Reject if start is in the past
  if (start < now) return false;

  // Reject if end is before start
  if (end < start) return false;

  return true;
}

/**
 * Filters venues based on the user's dietary preference.
 * Returns all venues when dietary is 'none'.
 * Otherwise, only returns venues whose tags include the dietary preference.
 * @param venues - Array of venue objects with tags
 * @param dietary - User's dietary preference string
 * @returns Filtered array of venues matching dietary requirements
 */
export function filterByDietary(venues: Venue[], dietary: string): Venue[] {
  if (dietary === 'none') return venues;
  return venues.filter((venue) => venue.tags.includes(dietary));
}

/**
 * Enforces a maximum of 3 activities per day slot.
 * Truncates the array to 3 items if it exceeds the limit.
 * @param activities - Array of activity names
 * @returns Array truncated to at most 3 items
 */
export function enforceActivityLimit(activities: string[]): string[] {
  const MAX_ACTIVITIES_PER_DAY = 3;
  return activities.slice(0, MAX_ACTIVITIES_PER_DAY);
}

/**
 * Validates that the destination string is non-empty and at least 2 characters.
 * @param destination - The travel destination string
 * @returns true if destination is valid, false otherwise
 */
export function validateDestination(destination: string): boolean {
  if (!destination || destination.trim().length < 2) return false;
  return true;
}
