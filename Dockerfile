# Use the lightweight Nginx Alpine image
FROM nginx:alpine

# Copy all project files to the Nginx default HTML directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Nginx starts automatically
