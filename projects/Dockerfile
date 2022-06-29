FROM gradle:7.4.2-jdk17-alpine as preload
WORKDIR /opt/preload
COPY preload.build.gradle build.gradle
RUN gradle wrapper && ./gradlew downloadDependencies && ./gradlew --stop


FROM codercom/code-server

RUN sudo apt-get update -y \
    && sudo apt-get install -y \
        openjdk-17-jdk-headless # OpenJDK 17, 430 MB \
    && sudo apt-get clean

#Gradle
COPY --from=preload --chown=coder /root/.gradle /home/coder/.gradle

RUN code-server --install-extension redhat.java



