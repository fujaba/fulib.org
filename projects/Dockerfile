FROM gradle:7.4-jdk17-alpine as preload
WORKDIR /opt/preload
COPY preload.build.gradle build.gradle
RUN gradle wrapper
RUN ./gradlew downloadDependencies
RUN ./gradlew --stop

FROM hacdias/webdav:latest as dav

FROM debian:latest

# Basic Dependencies
RUN apt-get update -y
# OpenJDK 17, 430 MB
RUN apt-get install -y openjdk-17-jdk-headless
# NodeJS 14, 50 MB + 140 MB
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
# Graphviz, 11 MB
RUN apt-get install -y graphviz
# minor tools
RUN apt-get install -y curl wget procps htop vim nano
# Clear Caches
RUN apt-get clean

# projects.jar
COPY ./build/libs/projects-*-all.jar /opt/projects/

# WebDAV
COPY --from=dav /webdav /opt/projects/webdav
COPY ./webdav.yaml /opt/projects/webdav.yaml

# Preload
COPY --from=preload /root/.gradle /root/.gradle

# Command
CMD mkdir -p "/projects/$PROJECT_ID" ; /opt/projects/webdav --config /opt/projects/webdav.yaml & java -jar /opt/projects/projects-*-all.jar
EXPOSE 80 4567
