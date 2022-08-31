FROM gradle as preload
WORKDIR /opt/preload
ARG BUILD_GRADLE
COPY $BUILD_GRADLE build.gradle
RUN gradle wrapper && ./gradlew downloadDependencies && ./gradlew --stop

FROM codercom/code-server
ARG EXTENSION
RUN code-server --install-extension $EXTENSION

#COPY only works with root
USER root
COPY --chown=coder vnc-viewer-0.0.1.vsix /home/coder/vnc-viewer.vsix
#install-extension command must be executed by coder user
USER coder
RUN code-server --install-extension /home/coder/vnc-viewer.vsix
USER root
RUN rm /home/coder/vnc-viewer.vsix


ARG APT_DEPENDENCIES
RUN apt-get update -y \
    && apt-get install -y \
        $APT_DEPENDENCIES \
    && apt-get clean
COPY --from=preload --chown=coder /root/.gradle /home/coder/.gradle


ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN=true
RUN apt-get install -y gnupg apt-transport-https wget software-properties-common i3 novnc websockify libxv1 libglu1-mesa xauth x11-utils xorg tightvncserver
RUN wget https://kumisystems.dl.sourceforge.net/project/virtualgl/2.6.5/virtualgl_2.6.5_amd64.deb && dpkg -i virtualgl_*.deb && rm virtualgl_*.deb
RUN wget https://kumisystems.dl.sourceforge.net/project/turbovnc/2.2.7/turbovnc_2.2.7_amd64.deb && dpkg -i turbovnc_*.deb && rm turbovnc_*.deb

# i3 window manager configuration
ARG CONF_I3=/root/.config/i3/config
RUN mkdir -p /root/.config/i3 && touch $CONF_I3 && \
    cp /etc/i3/config $CONF_I3 && \
    echo "workspace_layout tabbed" >> $CONF_I3 && \
    echo "exec --no-startup-id i3-sensible-terminal" >> $CONF_I3  && \
    sed -i 's/status_command i3status/mode invisible/' $CONF_I3


#using supervisor for process management (code-server and vnc-server)
RUN apt-get -y install supervisor
ARG CONF_SUPERVISOR
COPY $CONF_SUPERVISOR /etc/supervisor.conf

#custom vnc client.html
ARG CUSTOM_VNC_HTML
COPY $CUSTOM_VNC_HTML /usr/share/novnc/vnc_lite.html

EXPOSE 80
ENV DISPLAY=:1
USER coder
ENTRYPOINT ["supervisord" , "-c" , "/etc/supervisor.conf"]
