/**
 * Google Maps JavaScript API Service
 * Handles map initialization, marker management, route drawing, and InfoWindows.
 * Uses @googlemaps/js-api-loader for dynamic loading.
 */

import { Loader } from '@googlemaps/js-api-loader';

/** Day color scheme for markers */
const DAY_COLORS: Record<number, string> = {
  1: '#3B82F6', // Blue
  2: '#10B981', // Green
  3: '#F97316', // Orange
  4: '#8B5CF6', // Purple
  5: '#EF4444', // Red
  6: '#EC4899', // Pink
  7: '#14B8A6', // Teal
};

/** Marker data structure */
export interface MarkerData {
  position: { lat: number; lng: number };
  title: string;
  day: number;
  rating?: number;
  cost?: number;
  description?: string;
  placeId?: string;
}

let mapInstance: google.maps.Map | null = null;
let markersArray: google.maps.Marker[] = [];
let polylinesArray: google.maps.Polyline[] = [];
let infoWindowInstance: google.maps.InfoWindow | null = null;
let loaderInstance: Loader | null = null;

/**
 * Gets or creates the Google Maps API loader singleton.
 * Lazy loads the Maps JS API only when first needed.
 * @returns Loader instance
 */
function getLoader(): Loader {
  if (!loaderInstance) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in .env');
    }
    loaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }
  return loaderInstance;
}

/**
 * Initializes the Google Map on the given DOM element.
 * Centers on a default location until markers are added.
 * @param element - DOM element to render the map in
 * @param center - Initial center coordinates
 * @param zoom - Initial zoom level
 * @returns The map instance
 */
export async function initMap(
  element: HTMLElement,
  center: { lat: number; lng: number } = { lat: 20, lng: 0 },
  zoom: number = 3
): Promise<google.maps.Map> {
  const loader = getLoader();
  // Load Google Maps JS API with all required libraries
  await (loader as unknown as { load: () => Promise<void> }).load();

  mapInstance = new google.maps.Map(element, {
    center,
    zoom,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'simplified' }],
      },
    ],
  });

  infoWindowInstance = new google.maps.InfoWindow();

  return mapInstance;
}

/**
 * Clears all existing markers and polylines from the map.
 */
export function clearMapOverlays(): void {
  markersArray.forEach((marker) => {
    marker.setMap(null);
  });
  markersArray = [];
  polylinesArray.forEach((polyline) => polyline.setMap(null));
  polylinesArray = [];
}

/**
 * Adds color-coded markers to the map for each venue.
 * Day 1 = blue, Day 2 = green, Day 3 = orange, etc.
 * Clicking a marker opens an InfoWindow with venue details.
 * @param markers - Array of MarkerData objects
 */
export function addMarkers(markers: MarkerData[]): void {
  if (!mapInstance) return;

  clearMapOverlays();
  const bounds = new google.maps.LatLngBounds();

  markers.forEach((data) => {
    const color = DAY_COLORS[data.day] || '#6B7280';

    const marker = new google.maps.Marker({
      position: data.position,
      map: mapInstance!,
      title: data.title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        scale: 10,
      },
      label: {
        text: `${data.day}`,
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: 'bold',
      },
    });

    // InfoWindow content with venue details and "Open in Google Maps" link
    const content = `
      <div style="padding: 8px; max-width: 250px; font-family: sans-serif;">
        <h3 style="margin: 0 0 4px; font-size: 16px; color: #1f2937;">${data.title}</h3>
        <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px;">Day ${data.day}</p>
        ${data.rating ? `<p style="margin: 0 0 4px; font-size: 13px;">⭐ ${data.rating}/5</p>` : ''}
        ${data.cost ? `<p style="margin: 0 0 4px; font-size: 13px;">💰 $${data.cost}</p>` : ''}
        ${data.description ? `<p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">${data.description}</p>` : ''}
        <a href="https://www.google.com/maps/search/?api=1&query=${data.position.lat},${data.position.lng}${data.placeId ? `&query_place_id=${data.placeId}` : ''}"
           target="_blank" rel="noopener noreferrer"
           style="color: #3b82f6; font-size: 13px; text-decoration: none;">
          📍 Open in Google Maps
        </a>
      </div>
    `;

    marker.addListener('click', () => {
      if (infoWindowInstance) {
        infoWindowInstance.setContent(content);
        infoWindowInstance.open(mapInstance!, marker);
      }
    });

    markersArray.push(marker);
    bounds.extend(data.position);
  });

  // Fit map bounds to show all markers
  if (markers.length > 0) {
    mapInstance.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
  }
}

/**
 * Draws polyline routes connecting same-day stops on the map.
 * Each day gets a colored polyline matching the marker color.
 * @param markers - Array of MarkerData objects grouped by day
 */
export function drawRoutes(markers: MarkerData[]): void {
  if (!mapInstance) return;

  // Group markers by day
  const dayGroups = new Map<number, MarkerData[]>();
  markers.forEach((m) => {
    const group = dayGroups.get(m.day) || [];
    group.push(m);
    dayGroups.set(m.day, group);
  });

  // Draw polyline for each day
  dayGroups.forEach((dayMarkers, day) => {
    if (dayMarkers.length < 2) return;

    const color = DAY_COLORS[day] || '#6B7280';
    const path = dayMarkers.map((m) => m.position);

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: mapInstance!,
    });

    polylinesArray.push(polyline);
  });
}

/**
 * Gets the current map instance.
 * @returns The map instance or null
 */
export function getMapInstance(): google.maps.Map | null {
  return mapInstance;
}
