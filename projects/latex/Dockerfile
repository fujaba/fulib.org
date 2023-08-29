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
    && echo export PATH="$(echo /usr/local/texlive/*/bin/*/):$PATH" >> ~/.profile \
    # cleanup \
    && cd .. \
    && rm -rf install-tl-*

# enable tlmgr usertree \
RUN sudo /usr/local/texlive/*/bin/*/tlmgr init-usertree

# install some basic packages
ARG TEXLIVE_PACKAGES
RUN sudo /usr/local/texlive/*/bin/*/tlmgr install $TEXLIVE_PACKAGES
