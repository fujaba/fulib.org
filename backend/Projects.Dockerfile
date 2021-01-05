FROM markhobson/maven-chrome:jdk-8
RUN apt-get update -y && apt-get install -y graphviz inotify-tools nginx-full
RUN mkdir /projects
COPY ./projects.nginx.conf /etc/nginx/sites-available/default
RUN sed -i 's/^user.*;$/user root;/' /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
