/**
 * useFirestore Hook
 * Manages Firestore operations for saving, loading, and sharing itineraries.
 */

import { useState, useCallback } from 'react';
import {
  saveItinerary,
  loadItinerary,
  getShareableUrl,
  type SavedItinerary,
} from '../services/firestoreService';
import type { ParsedItinerary } from '../services/geminiService';

interface UseFirestoreReturn {
  savedId: string | null;
  savedItinerary: SavedItinerary | null;
  saving: boolean;
  loading: boolean;
  error: string | null;
  save: (itinerary: ParsedItinerary, destination: string, preferences: Record<string, unknown>) => Promise<string>;
  load: (id: string) => Promise<void>;
  getShareUrl: () => string | null;
}

/**
 * Custom hook for Firestore itinerary persistence.
 * Provides save, load, and share functionality with loading/error states.
 */
export function useFirestore(): UseFirestoreReturn {
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (
      itinerary: ParsedItinerary,
      destination: string,
      preferences: Record<string, unknown>
    ): Promise<string> => {
      setSaving(true);
      setError(null);

      try {
        const id = await saveItinerary(itinerary, destination, preferences);
        setSavedId(id);
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save itinerary';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loadItinerary(id);
      if (result) {
        setSavedItinerary(result);
        setSavedId(id);
      } else {
        setError('Itinerary not found');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load itinerary';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getShareUrl = useCallback((): string | null => {
    if (!savedId) return null;
    return getShareableUrl(savedId);
  }, [savedId]);

  return { savedId, savedItinerary, saving, loading, error, save, load, getShareUrl };
}
