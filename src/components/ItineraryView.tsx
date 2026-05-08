/**
 * ItineraryView Component
 * Renders the complete day-wise itinerary with venue cards,
 * weather banners, and budget tracking.
 */

import type { ParsedItinerary } from '../services/geminiService';
import type { DayWeather } from '../services/weatherService';
import VenueCard from './VenueCard';
import WeatherBanner from './WeatherBanner';
import BudgetTracker from './BudgetTracker';

interface ItineraryViewProps {
  itinerary: ParsedItinerary;
  weather: DayWeather[];
  totalBudget: number;
}

export default function ItineraryView({
  itinerary,
  weather,
  totalBudget,
}: ItineraryViewProps) {
  // Calculate total spent
  const totalSpent = itinerary.days.reduce(
    (sum, day) =>
      sum +
      day.activities.reduce((daySum, activity) => daySum + (activity.estimatedCost || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Budget Tracker */}
      <BudgetTracker totalBudget={totalBudget} spent={totalSpent} />

      {/* Day Cards */}
      {itinerary.days.map((day) => {
        const dayWeather = weather.find((w) => {
          // Match by index if no date
          const dayIndex = day.day - 1;
          return weather.indexOf(w) === dayIndex;
        });

        return (
          <div
            key={day.day}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Day Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Day {day.day}: {day.theme}
                </h3>
                {day.date && (
                  <p className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString()}</p>
                )}
              </div>
              {dayWeather && <WeatherBanner weather={dayWeather} />}
            </div>

            {/* Activity Cards */}
            <div className="space-y-3">
              {day.activities.map((activity, index) => {
                const timeSlots = ['morning', 'afternoon', 'evening'];
                const timeSlot = activity.time || timeSlots[index] || 'morning';

                return (
                  <VenueCard
                    key={`${day.day}-${index}`}
                    activity={activity}
                    timeSlot={timeSlot}
                  />
                );
              })}
            </div>

            {/* Day Cost Summary */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="text-gray-500">Day {day.day} estimated cost</span>
              <span className="font-bold text-emerald-600">
                $
                {day.activities
                  .reduce((sum, a) => sum + (a.estimatedCost || 0), 0)
                  .toFixed(0)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
