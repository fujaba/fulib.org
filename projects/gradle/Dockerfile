FROM gradle as preload
WORKDIR /opt/preload
ARG BUILD_GRADLE
COPY $BUILD_GRADLE build.gradle
RUN gradle wrapper
RUN ./gradlew build && ./gradlew --stop

FROM registry.uniks.de/fulib/code-server-base

ARG APT_DEPENDENCIES
RUN sudo apt-get update -y \
    && sudo apt-get install -y $APT_DEPENDENCIES \
    && sudo apt-get clean

RUN code-server --install-extension redhat.java
RUN code-server --install-extension richardwillis.vscode-gradle

COPY --from=preload --chown=coder /home/gradle/.gradle /home/coder/.gradle
