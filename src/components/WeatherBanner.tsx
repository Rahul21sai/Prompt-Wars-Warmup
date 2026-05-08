/**
 * WeatherBanner Component
 * Displays weather forecast for a specific day using Open-Meteo data.
 * Shows temperature range, weather icon, and description.
 */

import type { DayWeather } from '../services/weatherService';

interface WeatherBannerProps {
  weather: DayWeather | null;
}

export default function WeatherBanner({ weather }: WeatherBannerProps) {
  if (!weather) return null;

  return (
    <div
      className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-800"
      role="status"
      aria-label={`Weather: ${weather.weatherDescription}, ${weather.tempMin}° to ${weather.tempMax}°C`}
    >
      <span className="text-lg" aria-hidden="true">{weather.icon}</span>
      <span className="font-medium">{weather.weatherDescription}</span>
      <span className="text-blue-600">
        {weather.tempMin}° — {weather.tempMax}°C
      </span>
    </div>
  );
}
