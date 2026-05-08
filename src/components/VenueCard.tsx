/**
 * VenueCard Component
 * Displays a single venue/activity with photo, rating, cost, and actions.
 * Uses Google Places photos via photo references when available.
 */

import type { ItineraryActivity } from '../services/geminiService';

interface VenueCardProps {
  activity: ItineraryActivity;
  timeSlot: string;
  photoUrl?: string | null;
}

/** Renders star rating from a numeric value */
function StarRating({ rating }: { rating: number }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<span key={i} className="text-yellow-400" aria-hidden="true">★</span>);
    } else if (i === fullStars && hasHalf) {
      stars.push(<span key={i} className="text-yellow-400" aria-hidden="true">★</span>);
    } else {
      stars.push(<span key={i} className="text-gray-300" aria-hidden="true">★</span>);
    }
  }

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {stars}
      <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function VenueCard({ activity, timeSlot, photoUrl }: VenueCardProps) {
  const timeIcons: Record<string, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌙',
  };

  const timeColors: Record<string, string> = {
    morning: 'bg-amber-50 text-amber-700 border-amber-200',
    afternoon: 'bg-blue-50 text-blue-700 border-blue-200',
    evening: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const icon = timeIcons[timeSlot] || '📍';
  const colorClass = timeColors[timeSlot] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className={`rounded-lg border p-4 transition-all hover:shadow-md ${colorClass}`}>
      <div className="flex gap-3">
        {/* Venue photo */}
        {photoUrl && (
          <img
            src={photoUrl}
            alt={`Photo of ${activity.venue}`}
            loading="lazy"
            className="h-20 w-20 rounded-lg object-cover"
          />
        )}

        <div className="flex-1">
          {/* Time slot badge */}
          <div className="mb-1 flex items-center gap-2">
            <span aria-hidden="true">{icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">
              {timeSlot}
            </span>
          </div>

          {/* Venue name */}
          <h4 className="text-sm font-bold text-gray-900">{activity.venue}</h4>

          {/* Description */}
          <p className="mt-0.5 text-xs text-gray-600">{activity.description}</p>

          {/* Details row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <StarRating rating={4.2} />
            <span className="font-medium text-emerald-600">
              ${activity.estimatedCost}
            </span>
            <span className="text-gray-400">⏱ {activity.duration}</span>
          </div>

          {/* Open in Google Maps link */}
          {activity.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${activity.location.lat},${activity.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              aria-label={`Open ${activity.venue} in Google Maps`}
            >
              📍 Open in Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
