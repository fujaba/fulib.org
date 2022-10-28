FROM fulib/code-server-base

ARG APT_DEPENDENCIES
RUN sudo apt-get update -y \
    && sudo apt-get install -y $APT_DEPENDENCIES \
    && sudo apt-get clean

ARG EXTENSION
RUN code-server --install-extension $EXTENSION
