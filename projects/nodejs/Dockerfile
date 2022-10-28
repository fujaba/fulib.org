FROM fulib/code-server-base
ARG NODE_VERSION
RUN curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
RUN sudo apt-get update -y \
    && sudo apt-get install -y nodejs \
    && sudo apt-get clean
