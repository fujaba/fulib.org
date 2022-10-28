FROM codercom/code-server
RUN code-server --install-extension fulib.vnc-viewer

USER root

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN=true
RUN apt-get update -y && \
    apt-get install -y gnupg apt-transport-https wget software-properties-common i3 novnc websockify libxv1 libglu1-mesa xauth x11-utils xorg tightvncserver && \
    apt-get clean -y
RUN wget https://kumisystems.dl.sourceforge.net/project/virtualgl/2.6.5/virtualgl_2.6.5_amd64.deb && \
    dpkg -i virtualgl_*.deb && \
    rm virtualgl_*.deb
RUN wget https://kumisystems.dl.sourceforge.net/project/turbovnc/2.2.7/turbovnc_2.2.7_amd64.deb && \
    dpkg -i turbovnc_*.deb && \
    rm turbovnc_*.deb

# i3 window manager configuration
ARG CONF_I3=/root/.config/i3/config
RUN mkdir -p /root/.config/i3 && touch $CONF_I3 && \
    cp /etc/i3/config $CONF_I3 && \
    echo "workspace_layout tabbed" >> $CONF_I3 && \
    echo "exec --no-startup-id i3-sensible-terminal" >> $CONF_I3  && \
    sed -i 's/status_command i3status/mode invisible/' $CONF_I3

#using supervisor for process management (code-server and vnc-server)
RUN apt-get -y install supervisor
ARG CONF_SUPERVISOR=supervisor.conf
COPY $CONF_SUPERVISOR /etc/supervisor.conf

#custom vnc client.html
ARG CUSTOM_VNC_HTML=vnc_lite.html
COPY $CUSTOM_VNC_HTML /usr/share/novnc/vnc_lite.html

EXPOSE 80
ENV DISPLAY=:1
USER coder
ENTRYPOINT ["supervisord" , "-c" , "/etc/supervisor.conf"]
