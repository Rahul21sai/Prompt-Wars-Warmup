#!/bin/sh
# Generate config.js with runtime environment variables
# This injects API keys at container startup, not build time
cat > /usr/share/nginx/html/config.js <<EOF
window.__CONFIG__ = {
  GOOGLE_MAPS_API_KEY: "${VITE_GOOGLE_MAPS_API_KEY}",
  GEMINI_API_KEY: "${VITE_GEMINI_API_KEY}",
  FIREBASE_API_KEY: "${VITE_FIREBASE_API_KEY}",
  FIREBASE_AUTH_DOMAIN: "${VITE_FIREBASE_AUTH_DOMAIN}",
  FIREBASE_PROJECT_ID: "${VITE_FIREBASE_PROJECT_ID}",
  FIREBASE_STORAGE_BUCKET: "${VITE_FIREBASE_STORAGE_BUCKET}",
  FIREBASE_MESSAGING_SENDER_ID: "${VITE_FIREBASE_MESSAGING_SENDER_ID}",
  FIREBASE_APP_ID: "${VITE_FIREBASE_APP_ID}"
};
EOF

# Start Nginx
exec nginx -g 'daemon off;'
