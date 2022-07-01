FROM codercom/code-server
ARG NODE_VERSION
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
ARG APT_DEPENDENCIES
RUN sudo apt-get update -y \
    && sudo apt-get install -y \
        $APT_DEPENDENCIES \
    && sudo apt-get clean
