FROM nginx:alpine

COPY index.html style.css script.js /usr/share/nginx/html/
COPY public/ /usr/share/nginx/html/public/
