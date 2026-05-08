/**
 * SessionStorage Cache Utilities
 * Provides TTL-based caching in sessionStorage for API results
 * to reduce redundant API calls and improve efficiency.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Stores data in sessionStorage with a TTL.
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttlMs - Time to live in milliseconds (default: 10 minutes)
 */
export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  };
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // sessionStorage may be full or unavailable — fail silently
  }
}

/**
 * Retrieves cached data if it exists and has not expired.
 * Returns null if cache miss or expired.
 * @param key - Cache key
 * @returns Cached data or null
 */
export function getCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const isExpired = Date.now() - entry.timestamp > entry.ttl;

    if (isExpired) {
      sessionStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Clears a specific cache entry.
 * @param key - Cache key to clear
 */
export function clearCache(key: string): void {
  sessionStorage.removeItem(key);
}
