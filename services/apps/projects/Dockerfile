FROM codercom/code-server

RUN sudo apt-get update -y \
    && sudo apt-get install -y \
        openjdk-17-jdk-headless # OpenJDK 17, 430 MB \
    && sudo apt-get clean

RUN code-server --install-extension redhat.java



