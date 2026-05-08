# WanderlustAI — Travel Planning & Experience Engine

An AI-powered travel planning web application that generates personalized, day-wise itineraries using Google Gemini, enriched with real venue data from Google Places, displayed on interactive Google Maps, and persistently stored via Firebase Firestore.

## Vertical

**Travel Planning & Experience Engine**

## Google Services Used

| Service | Purpose | Integration |
|---|---|---|
| **Google Maps JavaScript API** | Interactive route map with day-clustered markers, polyline routes, and InfoWindows | `@googlemaps/js-api-loader` SDK |
| **Google Places API** | Real venue search (hotels, restaurants, attractions) with photos, ratings, and pricing | REST API via `textsearch` endpoint |
| **Google Gemini API** | AI-powered itinerary generation using `gemini-1.5-flash` model | `@google/generative-ai` SDK |
| **Firebase Firestore** | Persistent storage for save/load/share itineraries | Firebase JavaScript SDK (v9+ modular) |
| **Google Cloud Run** | Production deployment target | Multi-stage Dockerfile with Nginx |

## Features

### Smart Preference Form
- **Destination** with input validation and sanitization (XSS prevention)
- **Date pickers** with future-date-only enforcement
- **Budget** with minimum $100 validation
- **Travel party** selection (Solo, Couple, Family, Group with size)
- **Travel style** (Adventure, Relaxation, Cultural, Honeymoon, Family)
- **Dietary preference** (None, Vegetarian, Vegan, Halal, Gluten-free)
- **Mobility** options (Standard, Wheelchair accessible, No stairs)
- **Interest chips** multi-select (beaches, museums, nightlife, nature, food, shopping, temples, adventure)
- Red inline error messages on validation failure

### AI Itinerary Generation
- Structured prompts sent to Google Gemini `gemini-1.5-flash`
- JSON response parsing with markdown code fence stripping
- Graceful error handling with retry button
- AbortController for cancelling in-flight requests

### Interactive Map (Google Maps JS API)
- Full-width interactive map with custom color-coded markers per day
- Day 1 = Blue, Day 2 = Green, Day 3 = Orange, etc.
- InfoWindow on marker click: venue name, rating, cost, "Open in Google Maps" deep link
- Polyline routes connecting same-day stops
- Automatic bounds fitting to show all markers

### Real Venue Data (Google Places API)
- Search hotels, restaurants, and attractions near destination
- Dietary-filtered restaurant search
- Style-based attraction search (museum/beach/park)
- Real Google star ratings and photos via photo references
- SessionStorage caching with 10-minute TTL

### Save & Share (Firebase Firestore)
- Save itinerary to Firestore with UUID document ID
- Load shared itinerary by URL query param (`?id=xxx`)
- "Share Trip" button copies shareable URL to clipboard
- "Saved ✓" badge after successful Firestore write

### Weather Forecast
- Daily weather forecast from Open-Meteo API (free, no key needed)
- Temperature range and weather condition icons per day

### Export
- Export itinerary as plain text to clipboard

## Constraint Engine

Five pure validation functions in `src/utils/constraints.ts`, called before API requests:

| Function | Purpose | Fires When |
|---|---|---|
| `validateDestination(destination)` | Ensures destination is non-empty, ≥ 2 chars | Form submission |
| `validateDates(startDate, endDate)` | Rejects past dates, end before start | Form submission |
| `validateBudget(totalCost, budget)` | Ensures cost ≤ budget, budget > 0 | Form submission, budget tracking |
| `filterByDietary(venues, dietary)` | Filters venues by dietary tag | After Places API results |
| `enforceActivityLimit(activities)` | Caps activities at 3 per day | During itinerary rendering |

All functions are **pure** (no side effects, no API calls) and are independently unit tested.

## Architecture

```
┌─────────────────┐
│  Preference Form │
│  (User Input)    │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ Constraint Engine│  ← validateDestination, validateDates, validateBudget
│ (Pure Functions) │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Google Gemini   │────►│  Itinerary JSON  │
│  (AI Generation) │     │  (Parsed Result) │
└─────────────────┘     └────────┬─────────┘
                                 │
                   ┌─────────────┼──────────────┐
                   ▼             ▼              ▼
          ┌──────────────┐ ┌──────────┐ ┌──────────────┐
          │ Google Places │ │ Maps JS  │ │  Firebase    │
          │ (Real Venues) │ │ (Map UI) │ │  Firestore   │
          └──────────────┘ └──────────┘ │ (Persistence)│
                                        └──────────────┘
```

## Efficiency Optimizations

- **Debounced input** — 400ms debounce on destination before triggering API calls
- **Lazy loading** — Google Maps JS API loaded only when results are displayed (`React.lazy`)
- **SessionStorage cache** — Places API results cached with 10-minute TTL
- **AbortController** — In-flight Gemini requests cancelled if user changes inputs
- **Image lazy loading** — `loading="lazy"` on all venue photos
- **Code splitting** — MapView component loaded via dynamic `import()`

## Security

- All API keys stored in `.env` (documented in `.env.example`)
- `.gitignore` includes: `.env`, `node_modules`, `dist`, `.DS_Store`
- Input sanitization: `<script>` and HTML tags stripped from user inputs
- Rate limiting: "Generate" button disabled for 3 seconds after click
- No `console.log` of API keys anywhere in codebase

## Accessibility

- All form inputs have matching `<label htmlFor>` + `id`
- Map container has `role="application"` and `aria-label="Trip map"`
- Loading state uses `aria-live="polite"` for screen reader announcements
- All buttons have descriptive `aria-label` attributes
- "Skip to main content" link at top of page
- Interest chips use `aria-pressed` for toggle state
- Error messages use `role="alert"` for immediate announcement
- WCAG AA color contrast compliance

## How to Run

```bash
# 1. Clone the repository
git clone https://github.com/Rahul21sai/Prompt-Wars-Warmup.git
cd Prompt-Wars-Warmup

# 2. Set up environment variables
cp .env.example .env
# Edit .env and fill in your API keys

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Run tests
npm run test

# 6. Build for production
npm run build
```

## Testing

Tests are located in `src/__tests__/` and use **Vitest** + **React Testing Library**.

| Test File | Description | Tests |
|---|---|---|
| `constraints.test.ts` | Budget, date, dietary, activity limit, destination validation | 17 tests |
| `gemini.test.ts` | Prompt builder, JSON response parser | 10 tests |
| `App.test.tsx` | App renders, key UI elements present | 6 tests |

Run all tests:
```bash
npm run test
```

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest + React Testing Library + jest-dom
- **AI:** Google Gemini API (`gemini-1.5-flash`)
- **Maps:** Google Maps JavaScript API (`@googlemaps/js-api-loader`)
- **Places:** Google Places API (Text Search)
- **Storage:** Firebase Firestore (v9+ modular SDK)
- **Weather:** Open-Meteo API (free, no key)
- **Deployment:** Google Cloud Run + Nginx

## Assumptions

1. Users have a modern browser with JavaScript enabled
2. Google API keys are configured with appropriate service restrictions
3. Firebase project has Firestore enabled with public read/write rules (for hackathon)
4. The Google Maps API key has Maps JavaScript API, Places API, and Geocoding API enabled
5. Budget is specified in USD
6. Trip duration is derived from start/end date selection
7. Weather data is approximate and based on Open-Meteo forecast models
8. Venue photos require a valid Google Places API key with photo service enabled
