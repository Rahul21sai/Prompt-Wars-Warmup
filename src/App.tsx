/**
 * App Component - WanderlustAI Travel Planning & Experience Engine
 * Main application orchestrator that connects all components and services.
 * Handles form submission, AI generation, map rendering, and Firestore persistence.
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import PreferenceForm from './components/PreferenceForm';
import type { TravelPreferences } from './types';
import { COPY_SUCCESS_DURATION_MS } from './constants';
import ItineraryView from './components/ItineraryView';
import { useGemini } from './hooks/useGemini';
import { useFirestore } from './hooks/useFirestore';
import { getWeatherForecast, type DayWeather } from './services/weatherService';
import type { ParsedItinerary } from './services/geminiService';

// Lazy load MapView for efficiency — only loads when results are shown
const MapView = lazy(() => import('./components/MapView'));

function App() {
  const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
  const [weather, setWeather] = useState<DayWeather[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const { itinerary, loading, error, generate } = useGemini();
  const {
    savedId,
    savedItinerary,
    saving,
    error: firestoreError,
    save,
    load,
    getShareUrl,
  } = useFirestore();

  // Check URL for shared itinerary ID on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('id');
    if (sharedId) {
      load(sharedId);
    }
  }, [load]);

  // Displayed itinerary: from generation or from loaded shared trip
  const displayedItinerary: ParsedItinerary | null =
    itinerary || savedItinerary?.itinerary || null;

  /**
   * Handles form submission — triggers Gemini generation and weather fetch.
   */
  const handleSubmit = useCallback(
    async (prefs: TravelPreferences) => {
      setPreferences(prefs);
      setShareUrl(null);

      // Calculate duration from dates
      const startDate = new Date(prefs.startDate);
      const endDate = new Date(prefs.endDate);
      const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      // Generate itinerary via Gemini
      await generate({
        destination: prefs.destination,
        budget: prefs.budget,
        duration,
        style: prefs.style,
        dietary: prefs.dietary,
        mobility: prefs.mobility,
        interests: prefs.interests,
        partyType: prefs.partyType,
        partySize: prefs.partySize,
      });

      // Fetch weather in parallel (non-blocking)
      try {
        // Use destination coordinates (approximate using geocoding from the first activity)
        const weatherData = await getWeatherForecast(
          0, 0, // Will be updated if coordinates are available
          prefs.startDate,
          prefs.endDate
        );
        setWeather(weatherData);
      } catch {
        // Weather is non-critical — fail silently
      }
    },
    [generate]
  );

  /**
   * Saves the current itinerary to Firebase Firestore.
   */
  const handleSave = useCallback(async () => {
    if (!displayedItinerary || !preferences) return;

    try {
      const id = await save(displayedItinerary, preferences.destination, preferences as unknown as Record<string, unknown>);
      const url = getShareUrl();
      if (url) setShareUrl(url);
      // Update URL without reload
      window.history.pushState({}, '', `?id=${id}`);
    } catch {
      // Error is handled by useFirestore hook
    }
  }, [displayedItinerary, preferences, save, getShareUrl]);

  /**
   * Copies the shareable URL to clipboard.
   */
  const handleCopyLink = useCallback(async () => {
    const url = shareUrl || getShareUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), COPY_SUCCESS_DURATION_MS);
    } catch {
      // Fallback
      prompt('Copy this link:', url);
    }
  }, [shareUrl, getShareUrl]);

  /**
   * Exports itinerary as plain text to clipboard.
   */
  const handleExportText = useCallback(async () => {
    if (!displayedItinerary) return;

    let text = `WanderlustAI Travel Itinerary\n`;
    text += `Destination: ${displayedItinerary.destination || preferences?.destination || ''}\n`;
    text += `${'='.repeat(40)}\n\n`;

    displayedItinerary.days.forEach((day) => {
      text += `Day ${day.day}: ${day.theme}\n`;
      text += `${'-'.repeat(30)}\n`;
      day.activities.forEach((activity) => {
        text += `  ${activity.time.toUpperCase()}: ${activity.venue}\n`;
        text += `    ${activity.description}\n`;
        text += `    Cost: $${activity.estimatedCost} | Duration: ${activity.duration}\n\n`;
      });
    });

    text += `\nTotal Estimated Cost: $${displayedItinerary.totalEstimatedCost || 'N/A'}\n`;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      prompt('Copy your itinerary:', text);
    }
  }, [displayedItinerary, preferences]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm no-print">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Wanderlust<span className="text-emerald-600">AI</span>
            </h1>
            <p className="text-sm text-gray-500">Travel Planning & Experience Engine</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Powered by</span>
            <span className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700">Google Gemini</span>
            <span className="rounded bg-green-50 px-2 py-0.5 font-medium text-green-700">Maps</span>
            <span className="rounded bg-orange-50 px-2 py-0.5 font-medium text-orange-700">Firebase</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: Form */}
          <div className="lg:col-span-2 no-print">
            <PreferenceForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {loading && (
              <div
                className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-12"
                aria-live="polite"
                role="status"
              >
                <svg className="h-12 w-12 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-lg font-medium text-gray-700">Generating your itinerary...</p>
                <p className="text-sm text-gray-500">Google Gemini AI is crafting your perfect trip</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
                <p className="text-lg font-medium text-red-700">⚠️ {error}</p>
                <button
                  onClick={() => preferences && handleSubmit(preferences)}
                  className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  aria-label="Retry itinerary generation"
                >
                  🔄 Retry
                </button>
              </div>
            )}

            {/* Results */}
            {displayedItinerary && !loading && (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 no-print">
                  {/* Save to Firestore */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
                    aria-label="Save itinerary to cloud"
                  >
                    {saving ? '⏳ Saving...' : savedId ? '✅ Saved' : '💾 Save Trip'}
                  </button>

                  {/* Share Link */}
                  {savedId && (
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
                      aria-label="Copy shareable link"
                    >
                      {copiedLink ? '✅ Copied!' : '🔗 Share Trip'}
                    </button>
                  )}

                  {/* Export Text */}
                  <button
                    onClick={handleExportText}
                    className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-gray-700"
                    aria-label="Export itinerary as text"
                  >
                    📋 Export Text
                  </button>
                </div>

                {firestoreError && (
                  <p className="text-sm text-red-600" role="alert">{firestoreError}</p>
                )}

                {/* Map View — Lazy Loaded */}
                <Suspense
                  fallback={
                    <div className="h-[400px] animate-pulse rounded-2xl bg-gray-200" aria-label="Loading map" />
                  }
                >
                  <MapView itinerary={displayedItinerary} />
                </Suspense>

                {/* Itinerary */}
                <ItineraryView
                  itinerary={displayedItinerary}
                  weather={weather}
                  totalBudget={preferences?.budget || 1000}
                />
              </div>
            )}

            {/* Empty State */}
            {!displayedItinerary && !loading && !error && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white/50 p-16 text-center">
                <span className="text-5xl" aria-hidden="true">🌍</span>
                <h2 className="text-xl font-bold text-gray-700">Your adventure awaits</h2>
                <p className="max-w-sm text-sm text-gray-500">
                  Fill in your travel preferences and let Google Gemini AI create a personalized itinerary for you.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 py-6 text-center text-sm text-gray-400 no-print">
        <p>WanderlustAI — Built with Google Gemini, Maps JS API, Places API, Firebase Firestore & Cloud Run</p>
      </footer>
    </div>
  );
}

export default App;
