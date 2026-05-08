/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers and strings.
 * All constants are immutable and documented for maintainability.
 */

/** Maximum number of activities allowed per day slot */
export const MAX_ACTIVITIES_PER_DAY = 3 as const;

/** Maximum trip duration in days */
export const MAX_TRIP_DURATION_DAYS = 30 as const;

/** Minimum trip duration in days */
export const MIN_TRIP_DURATION_DAYS = 1 as const;

/** Minimum budget in USD */
export const MIN_BUDGET_USD = 100 as const;

/** Minimum destination string length */
export const MIN_DESTINATION_LENGTH = 2 as const;

/** Rate limit cooldown period in milliseconds */
export const RATE_LIMIT_COOLDOWN_MS = 3000 as const;

/** Cache time-to-live for Places API responses in milliseconds (10 minutes) */
export const PLACES_CACHE_TTL_MS = 10 * 60 * 1000;

/** Maximum number of nearby venues to fetch per search */
export const MAX_VENUE_RESULTS = 10 as const;

/** Copy link success message duration in milliseconds */
export const COPY_SUCCESS_DURATION_MS = 2000 as const;

/** Firestore collection name for itineraries */
export const FIRESTORE_COLLECTION = 'itineraries' as const;

/** Gemini model identifier */
export const GEMINI_MODEL = 'gemini-flash-latest' as const;

/** Travel style options */
export const TRAVEL_STYLES = ['Adventure', 'Relaxation', 'Cultural', 'Honeymoon', 'Family'] as const;

/** Dietary preference options */
export const DIETARY_OPTIONS = ['none', 'vegetarian', 'vegan', 'halal', 'gluten-free'] as const;

/** Mobility options */
export const MOBILITY_OPTIONS = ['standard', 'wheelchair-accessible', 'no-stairs'] as const;

/** Travel party type options */
export const PARTY_TYPE_OPTIONS = ['solo', 'couple', 'family', 'group'] as const;

/** Interest categories for multi-select */
export const INTEREST_OPTIONS = ['beaches', 'museums', 'nightlife', 'nature', 'food', 'shopping', 'temples', 'adventure'] as const;

