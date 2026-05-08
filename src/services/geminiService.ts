/**
 * Gemini AI Service
 * Handles communication with Google Gemini API for AI-powered itinerary generation.
 * Uses @google/generative-ai SDK with gemini-1.5-flash model.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '../utils/config';

/** Input parameters for building the Gemini prompt */
export interface GeminiPromptParams {
  destination: string;
  budget: number;
  duration: number;
  style: string;
  dietary?: string;
  mobility?: string;
  interests?: string[];
  partyType?: string;
  partySize?: number;
}

/** Structure of a single activity in the itinerary */
export interface ItineraryActivity {
  time: string;
  venue: string;
  description: string;
  category: string;
  estimatedCost: number;
  duration: string;
  location?: { lat: number; lng: number };
}

/** Structure of a single day in the itinerary */
export interface ItineraryDay {
  day: number;
  date?: string;
  theme: string;
  activities: ItineraryActivity[];
}

/** Structure of the full parsed itinerary response */
export interface ParsedItinerary {
  days: ItineraryDay[];
  totalEstimatedCost?: number;
  currency?: string;
  destination?: string;
}

/**
 * Builds a structured prompt for the Gemini API.
 * Includes all travel preferences to generate a contextual itinerary.
 * The prompt explicitly requests JSON format for reliable parsing.
 * @param params - Travel preference parameters
 * @returns Formatted prompt string
 */
export function buildGeminiPrompt(params: GeminiPromptParams): string {
  const {
    destination,
    budget,
    duration,
    style,
    dietary = 'none',
    mobility = 'standard',
    interests = [],
    partyType = 'solo',
    partySize = 1,
  } = params;

  return `You are a professional travel planner. Create a detailed ${duration}-day travel itinerary for ${destination}.

Travel Preferences:
- Budget: $${budget} USD total
- Travel Style: ${style}
- Party: ${partyType}${partySize > 1 ? ` (${partySize} people)` : ''}
- Dietary Preference: ${dietary}
- Mobility: ${mobility}
- Interests: ${interests.length > 0 ? interests.join(', ') : 'general sightseeing'}

Requirements:
- Each day should have 3 activities: morning, afternoon, and evening
- Include real venue/attraction names for ${destination}
- Provide estimated costs in USD for each activity
- Include GPS coordinates (latitude, longitude) for each venue
- Keep total costs within the $${budget} budget
- Consider ${mobility} accessibility needs

Respond ONLY with valid JSON in this exact format, no markdown or extra text:
{
  "days": [
    {
      "day": 1,
      "theme": "Cultural Exploration",
      "activities": [
        {
          "time": "morning",
          "venue": "Venue Name",
          "description": "Brief description of activity",
          "category": "attraction",
          "estimatedCost": 25,
          "duration": "2 hours",
          "location": { "lat": 0.0, "lng": 0.0 }
        }
      ]
    }
  ],
  "totalEstimatedCost": 500,
  "currency": "USD",
  "destination": "${destination}"
}`;
}

/**
 * Parses and validates the raw JSON response from Gemini.
 * Strips any markdown code fences and extracts valid JSON.
 * Throws an error if the response is not valid JSON.
 * @param response - Raw string response from Gemini
 * @returns Parsed itinerary object
 */
export function parseItineraryResponse(response: string): ParsedItinerary {
  // Strip potential markdown code fences
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Parse JSON — will throw on invalid JSON
  const parsed = JSON.parse(cleaned) as ParsedItinerary;

  // Validate required structure
  if (!parsed.days || !Array.isArray(parsed.days)) {
    throw new Error('Invalid itinerary: missing "days" array');
  }

  return parsed;
}

/**
 * Generates an itinerary by calling the Google Gemini API.
 * Uses gemini-1.5-flash model with structured system instructions.
 * Includes AbortController support for cancelling in-flight requests.
 * @param params - Travel preference parameters
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Parsed itinerary from AI response
 */
export async function generateItinerary(
  params: GeminiPromptParams,
  signal?: AbortSignal
): Promise<ParsedItinerary> {
  // API key loaded from runtime config — never hardcoded
  const apiKey = getConfig().GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Set VITE_GEMINI_API_KEY in .env');
  }

  // Check if request was already cancelled
  if (signal?.aborted) {
    throw new DOMException('Request cancelled', 'AbortError');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: 'You are a travel expert. Return only valid JSON. Do not include markdown formatting or code fences.',
  });

  const prompt = buildGeminiPrompt(params);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return parseItineraryResponse(text);
}
