FROM nginx:alpine

# Copy our html to a template file
COPY index.html /usr/share/nginx/html/index.html.template

# Replace the placeholder in the HTML with the actual environment variable at runtime
# Also configure Nginx to listen on the PORT provided by Cloud Run (default is 8080)
CMD sed -i "s/listen  *80;/listen ${PORT:-8080};/g" /etc/nginx/conf.d/default.conf && \
    envsubst '${GOOGLE_MAPS_API_KEY}' < /usr/share/nginx/html/index.html.template > /usr/share/nginx/html/index.html && \
    nginx -g 'daemon off;'
