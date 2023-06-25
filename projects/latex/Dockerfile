FROM registry.uniks.de/fulib/code-server-base

ARG EXTENSION
RUN code-server --install-extension $EXTENSION

# install some basic packages
RUN sudo apt-get update -y \
    && sudo apt-get install -y wget gnupg ca-certificates lsb-release \
    && sudo apt-get clean

# install latest texlive (2023)
RUN wget https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz \
    && tar -xzf install-tl-unx.tar.gz \
    && cd install-tl-*/ \
    # install \
    && sudo ./install-tl --no-interaction --scheme basic \
    # update PATH \
    && echo export PATH=/usr/local/texlive/*/bin/x86_64-linux:$PATH >> ~/.profile \
    # cleanup \
    && cd .. \
    && rm -rf install-tl-*

# add texlive to PATH
ARG TEXLIVE_VERSION
ARG TEXLIVE_PATH=/usr/local/texlive/$TEXLIVE_VERSION/bin/x86_64-linux
ENV PATH=$TEXLIVE_PATH:$PATH

# enable tlmgr usertree \
RUN sudo $TEXLIVE_PATH/tlmgr init-usertree

# install some basic packages
# see https://github.com/sekassel-research/thesis-template#installation
ARG TEXLIVE_PACKAGES
RUN sudo $TEXLIVE_PATH/tlmgr install $TEXLIVE_PACKAGES
