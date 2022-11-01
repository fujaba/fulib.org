FROM nginx
COPY proxy/nginx.conf /etc/nginx/conf.d/default.conf
COPY images.json /usr/share/nginx/html/images.json
CMD nginx -g 'daemon off;'
EXPOSE 80
