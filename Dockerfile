FROM nginx:alpine

# Copy our html to a template file
COPY index.html /usr/share/nginx/html/index.html.template

# Replace the placeholder in the HTML with the actual environment variable at runtime
CMD envsubst '${GOOGLE_MAPS_API_KEY}' < /usr/share/nginx/html/index.html.template > /usr/share/nginx/html/index.html && nginx -g 'daemon off;'
