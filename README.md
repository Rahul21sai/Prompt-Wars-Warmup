# WanderlustAI

WanderlustAI is an AI-powered travel planning and experience engine built with React, TypeScript, Vite, and Tailwind CSS. It leverages Google Gemini to generate highly contextual, multi-day travel itineraries based on detailed user preferences.

## Features
- **AI-Powered Itineraries:** Generates day-by-day travel plans using the Google Gemini API.
- **Interactive Maps:** Displays clustered, color-coded markers for each activity using the Google Maps JavaScript API.
- **Real Venues:** Integrates with Google Places API to find real hotels, restaurants, and attractions.
- **Trip Sharing:** Save and share itineraries via unique URLs powered by Firebase Firestore.
- **Budget Tracking:** Real-time cost breakdowns for the trip.
- **Weather Forecast:** Fetches weather conditions via Open-Meteo API.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **AI/APIs:** Google Gemini (`gemini-flash-latest`), Google Maps JS API, Google Places API
- **Database:** Firebase Firestore
- **Deployment:** Google Cloud Run (Nginx + `docker-entrypoint.sh` for runtime env injection)
- **Testing:** Vitest + React Testing Library

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd WanderlustAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. Run Development Server
```bash
npm run dev
```

## Testing
The application uses Vitest and React Testing Library for comprehensive unit and integration testing.
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run coverage
```

## Deployment
WanderlustAI is deployed on Google Cloud Run. The deployment utilizes Nginx to serve the built static files and a `docker-entrypoint.sh` script to inject runtime environment variables into the application configuration.

To manually deploy from Google Cloud Shell:
```bash
gcloud run deploy promptwarwarmup --source . --region europe-west1 --allow-unauthenticated
```
