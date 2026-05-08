/**
 * Google Places API Service
 * Handles venue search, photo retrieval, and place details.
 * Uses the Google Places API (New) via REST endpoints.
 * Implements sessionStorage caching with 10-minute TTL for efficiency.
 */

import { getCache, setCache } from '../utils/cache';
import { getConfig } from '../utils/config';

/** Structure of a venue returned from Places API */
export interface PlaceVenue {
  name: string;
  placeId: string;
  rating: number;
  priceLevel: number;
  address: string;
  photoReference: string | null;
  photoUrl: string | null;
  location: { lat: number; lng: number };
  types: string[];
  tags: string[];
  userRatingsTotal: number;
  openNow?: boolean;
}

/**
 * Searches for venues near a destination using the Google Places API.
 * Results are cached in sessionStorage with a 10-minute TTL.
 * @param query - Search query (e.g., "restaurants in Paris")
 * @param destination - The travel destination for contextual search
 * @param type - Place type filter (e.g., "restaurant", "tourist_attraction", "lodging")
 * @returns Array of PlaceVenue objects
 */
export async function searchVenues(
  query: string,
  destination: string,
  type: string = 'tourist_attraction'
): Promise<PlaceVenue[]> {
  const cacheKey = `places_${destination}_${type}_${query}`;
  const cached = getCache<PlaceVenue[]>(cacheKey);
  if (cached) return cached;

  const apiKey = getConfig().GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured. Set VITE_GOOGLE_MAPS_API_KEY in .env');
  }

  const searchQuery = `${query} in ${destination}`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=${type}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('Places API returned status:', data.status);
      return [];
    }

    const venues: PlaceVenue[] = (data.results || []).slice(0, 5).map((place: Record<string, unknown>) => ({
      name: place.name as string,
      placeId: place.place_id as string,
      rating: (place.rating as number) || 0,
      priceLevel: (place.price_level as number) || 2,
      address: (place.formatted_address as string) || '',
      photoReference: (place.photos as Array<Record<string, unknown>>)?.[0]?.photo_reference as string || null,
      photoUrl: (place.photos as Array<Record<string, unknown>>)?.[0]?.photo_reference
        ? getVenuePhotoUrl((place.photos as Array<Record<string, unknown>>)[0].photo_reference as string)
        : null,
      location: {
        lat: (place.geometry as Record<string, Record<string, number>>)?.location?.lat || 0,
        lng: (place.geometry as Record<string, Record<string, number>>)?.location?.lng || 0,
      },
      types: (place.types as string[]) || [],
      tags: mapPlaceTypesToTags(place.types as string[]),
      userRatingsTotal: (place.user_ratings_total as number) || 0,
      openNow: (place.opening_hours as Record<string, boolean>)?.open_now,
    }));

    // Cache results with 10-minute TTL
    setCache(cacheKey, venues);

    return venues;
  } catch (error) {
    console.error('Places API search error:', error);
    return [];
  }
}

/**
 * Generates the URL for a Google Places photo using the photo reference.
 * @param photoReference - Photo reference string from Places API
 * @param maxWidth - Maximum width of the photo (default 400px)
 * @returns Full URL to the photo
 */
export function getVenuePhotoUrl(photoReference: string, maxWidth: number = 400): string {
  const apiKey = getConfig().GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
}

/**
 * Maps Google Places API types to dietary/category tags for filtering.
 * @param types - Array of place type strings from Google
 * @returns Array of simplified tag strings
 */
function mapPlaceTypesToTags(types: string[]): string[] {
  if (!types) return [];
  const tagMap: Record<string, string[]> = {
    restaurant: ['restaurant'],
    meal_delivery: ['restaurant'],
    meal_takeaway: ['restaurant'],
    cafe: ['cafe', 'vegetarian'],
    bakery: ['cafe'],
    lodging: ['hotel'],
    museum: ['museum', 'cultural'],
    art_gallery: ['cultural', 'museum'],
    park: ['nature', 'outdoor'],
    beach: ['beach', 'outdoor'],
    church: ['cultural', 'temple'],
    hindu_temple: ['cultural', 'temple'],
    mosque: ['cultural', 'temple'],
    tourist_attraction: ['attraction'],
    amusement_park: ['adventure', 'attraction'],
    zoo: ['nature', 'attraction'],
  };

  const tags: string[] = [];
  types.forEach((type) => {
    if (tagMap[type]) {
      tags.push(...tagMap[type]);
    }
  });
  return [...new Set(tags)];
}

/**
 * Searches for restaurants with dietary filter.
 * @param destination - Travel destination
 * @param dietary - Dietary preference
 * @returns Array of PlaceVenue objects
 */
export async function searchRestaurants(
  destination: string,
  dietary: string = 'none'
): Promise<PlaceVenue[]> {
  const keyword = dietary !== 'none' ? `${dietary} restaurant` : 'restaurant';
  return searchVenues(keyword, destination, 'restaurant');
}

/**
 * Searches for hotels near the destination.
 * @param destination - Travel destination
 * @returns Array of PlaceVenue objects
 */
export async function searchHotels(destination: string): Promise<PlaceVenue[]> {
  return searchVenues('hotel', destination, 'lodging');
}

/**
 * Searches for attractions based on trip style.
 * @param destination - Travel destination
 * @param style - Travel style (Adventure, Cultural, Relaxation, etc.)
 * @returns Array of PlaceVenue objects
 */
export async function searchAttractions(
  destination: string,
  style: string = 'Cultural'
): Promise<PlaceVenue[]> {
  const styleToQuery: Record<string, string> = {
    Adventure: 'adventure activities outdoor',
    Relaxation: 'spa beach resort',
    Cultural: 'museum temple historical site',
    Honeymoon: 'romantic scenic viewpoint',
    Family: 'family friendly attraction park',
  };
  const query = styleToQuery[style] || 'tourist attraction';
  return searchVenues(query, destination, 'tourist_attraction');
}
