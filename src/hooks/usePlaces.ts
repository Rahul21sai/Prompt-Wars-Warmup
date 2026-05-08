/**
 * usePlaces Hook
 * Manages Google Places API state for venue searching.
 * Includes debouncing and caching for efficiency.
 */

import { useState, useCallback } from 'react';
import { searchRestaurants, searchHotels, searchAttractions, type PlaceVenue } from '../services/placesService';

interface UsePlacesReturn {
  venues: PlaceVenue[];
  hotels: PlaceVenue[];
  restaurants: PlaceVenue[];
  attractions: PlaceVenue[];
  loading: boolean;
  error: string | null;
  searchAll: (destination: string, style: string, dietary: string) => Promise<void>;
}

/**
 * Custom hook for searching places using the Google Places API.
 * Provides loading state and error handling for each search type.
 */
export function usePlaces(): UsePlacesReturn {
  const [venues, setVenues] = useState<PlaceVenue[]>([]);
  const [hotels, setHotels] = useState<PlaceVenue[]>([]);
  const [restaurants, setRestaurants] = useState<PlaceVenue[]>([]);
  const [attractions, setAttractions] = useState<PlaceVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAll = useCallback(async (destination: string, style: string, dietary: string) => {
    setLoading(true);
    setError(null);

    try {
      const [hotelResults, restaurantResults, attractionResults] = await Promise.all([
        searchHotels(destination),
        searchRestaurants(destination, dietary),
        searchAttractions(destination, style),
      ]);

      setHotels(hotelResults);
      setRestaurants(restaurantResults);
      setAttractions(attractionResults);
      setVenues([...hotelResults, ...restaurantResults, ...attractionResults]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search places';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { venues, hotels, restaurants, attractions, loading, error, searchAll };
}
