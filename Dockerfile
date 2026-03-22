FROM nginx:alpine
COPY index.html bookmarklet.js config.example.js /usr/share/nginx/html/
