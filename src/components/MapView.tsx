/**
 * MapView Component
 * Interactive Google Maps view using the Maps JavaScript API.
 * Lazy loaded via dynamic import for efficiency.
 * Displays day-clustered markers with color coding and route polylines.
 */

import { useEffect, useRef } from 'react';
import { initMap, addMarkers, drawRoutes, type MarkerData } from '../services/mapsService';
import type { ParsedItinerary } from '../services/geminiService';

interface MapViewProps {
  itinerary: ParsedItinerary | null;
}

export default function MapView({ itinerary }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (!mapRef.current || !itinerary || mapInitialized.current) return;

    const setupMap = async () => {
      try {
        // Initialize the map on the DOM element
        await initMap(mapRef.current!, { lat: 20, lng: 0 }, 3);
        mapInitialized.current = true;

        // Build marker data from itinerary
        const markers: MarkerData[] = [];
        itinerary.days.forEach((day) => {
          day.activities.forEach((activity) => {
            if (activity.location) {
              markers.push({
                position: { lat: activity.location.lat, lng: activity.location.lng },
                title: activity.venue,
                day: day.day,
                rating: 4.2,
                cost: activity.estimatedCost,
                description: activity.description,
              });
            }
          });
        });

        if (markers.length > 0) {
          addMarkers(markers);
          drawRoutes(markers);
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    setupMap();
  }, [itinerary]);

  // Update markers when itinerary changes (after initial load)
  useEffect(() => {
    if (!mapInitialized.current || !itinerary) return;

    const markers: MarkerData[] = [];
    itinerary.days.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.location) {
          markers.push({
            position: { lat: activity.location.lat, lng: activity.location.lng },
            title: activity.venue,
            day: day.day,
            rating: 4.2,
            cost: activity.estimatedCost,
            description: activity.description,
          });
        }
      });
    });

    if (markers.length > 0) {
      addMarkers(markers);
      drawRoutes(markers);
    }
  }, [itinerary]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg"
      role="application"
      aria-label="Trip map"
    >
      <div
        ref={mapRef}
        className="h-[400px] w-full bg-gray-100"
        id="google-map-container"
      >
        {/* Google Maps JS API renders here */}
        {!itinerary && (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p>Map will appear after generating your itinerary</p>
          </div>
        )}
      </div>

      {/* Day legend */}
      {itinerary && itinerary.days.length > 0 && (
        <div className="flex flex-wrap gap-3 bg-white px-4 py-3" aria-label="Map legend">
          {itinerary.days.map((day) => {
            const colors: Record<number, string> = {
              1: 'bg-blue-500',
              2: 'bg-emerald-500',
              3: 'bg-orange-500',
              4: 'bg-purple-500',
              5: 'bg-red-500',
              6: 'bg-pink-500',
              7: 'bg-teal-500',
            };
            return (
              <div key={day.day} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className={`inline-block h-3 w-3 rounded-full ${colors[day.day] || 'bg-gray-400'}`} aria-hidden="true" />
                Day {day.day}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
