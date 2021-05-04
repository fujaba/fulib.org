FROM debian:latest

# Basic Dependencies
RUN apt-get update -y
RUN apt-get install -y chromium chromium-driver
RUN apt-get install -y openjdk-11-jdk-headless
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y nginx-full
RUN apt-get install -y graphviz
RUN apt-get install -y inotify-tools

# projects.jar
COPY ./build/libs/projects-*-all.jar /opt/projects/

# nginx
COPY nginx.conf /etc/nginx/sites-available/default
RUN sed -i 's/^user.*;$/user root;/' /etc/nginx/nginx.conf

# Command
CMD nginx -g 'daemon off;' & java -jar /opt/projects/projects-*-all.jar
EXPOSE 80 4567
