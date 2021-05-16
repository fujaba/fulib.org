FROM gradle:jre11 as preload
WORKDIR /opt/preload
COPY preload.build.gradle build.gradle
RUN gradle wrapper
RUN ./gradlew downloadDependencies
RUN ./gradlew --stop

FROM debian:latest

# Basic Dependencies
RUN apt-get update -y
# Chromium, 675 MB
RUN apt-get install -y chromium chromium-driver
# OpenJDK 11, 430 MB
RUN apt-get install -y openjdk-11-jdk-headless
# NodeJS 14, 50 MB + 140 MB
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
# nginx (full for DAV), 15 MB
RUN apt-get install -y nginx-full
# Graphviz, 11 MB
RUN apt-get install -y graphviz
# curl, 5 MB
RUN apt-get install -y curl
# Clear Caches
RUN apt-get clean

# projects.jar
COPY ./build/libs/projects-*-all.jar /opt/projects/

# nginx
COPY nginx.conf /etc/nginx/sites-available/default
RUN sed -i 's/^user.*;$/user root;/' /etc/nginx/nginx.conf

# Preload
COPY --from=preload /root/.gradle /root/.gradle

# Command
CMD mkdir -p "/projects/$PROJECT_ID" ; nginx -g 'daemon off;' & java -jar /opt/projects/projects-*-all.jar
EXPOSE 80 4567
