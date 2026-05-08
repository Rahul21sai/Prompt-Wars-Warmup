/**
 * Weather Service
 * Fetches weather forecast data from Open-Meteo API (free, no key needed).
 * Provides daily weather summaries for the travel destination.
 */

import { getCache, setCache } from '../utils/cache';

/** Daily weather data structure */
export interface DayWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  weatherDescription: string;
  icon: string;
}

/** Weather code to description and emoji mapping */
const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Icy fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow', icon: '🌨️' },
  73: { description: 'Moderate snow', icon: '🌨️' },
  75: { description: 'Heavy snow', icon: '❄️' },
  80: { description: 'Rain showers', icon: '🌦️' },
  81: { description: 'Moderate showers', icon: '🌧️' },
  82: { description: 'Violent showers', icon: '⛈️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

/**
 * Fetches weather forecast for a specific location and date range.
 * Uses the Open-Meteo API which requires no API key.
 * Results are cached with a 10-minute TTL.
 * @param lat - Latitude
 * @param lng - Longitude
 * @param startDate - ISO date string for forecast start
 * @param endDate - ISO date string for forecast end
 * @returns Array of daily weather data
 */
export async function getWeatherForecast(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<DayWeather[]> {
  const cacheKey = `weather_${lat}_${lng}_${startDate}_${endDate}`;
  const cached = getCache<DayWeather[]>(cacheKey);
  if (cached) return cached;

  const start = startDate.split('T')[0];
  const end = endDate.split('T')[0];

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${start}&end_date=${end}&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.daily) return [];

    const weather: DayWeather[] = data.daily.time.map((date: string, i: number) => {
      const code = data.daily.weathercode[i];
      const info = WEATHER_CODES[code] || { description: 'Unknown', icon: '🌡️' };

      return {
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: code,
        weatherDescription: info.description,
        icon: info.icon,
      };
    });

    setCache(cacheKey, weather);
    return weather;
  } catch (error) {
    console.error('Weather API error:', error);
    return [];
  }
}
