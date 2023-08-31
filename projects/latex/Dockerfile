FROM registry.uniks.de/fulib/code-server-base

ARG EXTENSION
RUN code-server --install-extension $EXTENSION

# install some basic packages
RUN sudo apt-get update -y \
    && sudo apt-get install -y wget gnupg ca-certificates lsb-release \
    && sudo apt-get clean

# install latest texlive (2023)
ARG SCHEME
RUN wget https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz \
    && tar -xzf install-tl-unx.tar.gz \
    && cd install-tl-*/ \
    # install \
    && sudo ./install-tl --no-interaction --scheme $SCHEME \
    # cleanup \
    && cd .. \
    && rm -rf install-tl-*

RUN sudo ln -s /usr/local/texlive/*/bin/* /usr/local/texlive/current

ENV PATH=/usr/local/texlive/current:$PATH

# enable tlmgr usertree
RUN sudo /usr/local/texlive/current/tlmgr init-usertree

# install some basic packages
ARG TEXLIVE_PACKAGES
RUN sudo /usr/local/texlive/current/tlmgr install $TEXLIVE_PACKAGES

RUN echo "alias tlmgr='sudo /usr/local/texlive/current/tlmgr'" >> ~/.bashrc \
    && echo "alias tlmgr='sudo /usr/local/texlive/current/tlmgr'" >> ~/.zshrc
