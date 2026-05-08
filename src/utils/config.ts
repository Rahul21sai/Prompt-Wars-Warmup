/**
 * Runtime Configuration
 * Reads API keys from either:
 * 1. Runtime-injected window.__CONFIG__ (production / Cloud Run)
 * 2. Vite's import.meta.env (local development)
 * This allows secure injection of API keys at container startup
 * without baking them into the build.
 */

interface AppConfig {
  GOOGLE_MAPS_API_KEY: string;
  GEMINI_API_KEY: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
}

declare global {
  interface Window {
    __CONFIG__?: AppConfig;
  }
}

/**
 * Gets the app configuration, preferring runtime-injected values
 * over build-time environment variables.
 */
export function getConfig(): AppConfig {
  // Runtime config injected by container startup script (production)
  if (window.__CONFIG__) {
    return window.__CONFIG__;
  }

  // Fallback to Vite env vars (local development)
  return {
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
    FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
    FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
}
