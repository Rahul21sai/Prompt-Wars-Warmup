/**
 * useGemini Hook
 * Manages Gemini API state, including loading, error handling, and
 * request cancellation via AbortController for efficiency.
 */

import { useState, useRef, useCallback } from 'react';
import { generateItinerary, type GeminiPromptParams, type ParsedItinerary } from '../services/geminiService';

interface UseGeminiReturn {
  itinerary: ParsedItinerary | null;
  loading: boolean;
  error: string | null;
  generate: (params: GeminiPromptParams) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for interacting with the Gemini API.
 * Provides loading state, error handling, and automatic cancellation
 * of in-flight requests when a new generation is triggered.
 */
export function useGemini(): UseGeminiReturn {
  const [itinerary, setItinerary] = useState<ParsedItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (params: GeminiPromptParams) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await generateItinerary(params, controller.signal);
      if (!controller.signal.aborted) {
        setItinerary(result);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Request was cancelled — not an error
      }
      const message = err instanceof Error ? err.message : 'Failed to generate itinerary';
      setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setItinerary(null);
    setLoading(false);
    setError(null);
  }, []);

  return { itinerary, loading, error, generate, reset };
}
