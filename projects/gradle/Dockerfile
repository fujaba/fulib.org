FROM gradle as preload
WORKDIR /opt/preload
ARG BUILD_GRADLE
COPY $BUILD_GRADLE build.gradle
RUN gradle wrapper && ./gradlew downloadDependencies && ./gradlew --stop

FROM codercom/code-server
ARG EXTENSION
RUN code-server --install-extension $EXTENSION

USER root
ARG APT_DEPENDENCIES
RUN apt-get update -y \
    && apt-get install -y \
        $APT_DEPENDENCIES \
    && apt-get clean
COPY --from=preload --chown=coder /root/.gradle /home/coder/.gradle


ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN=true
RUN echo "tzdata tzdata/Areas select America" > ~/tx.txt && \
	echo "tzdata tzdata/Zones/America select New York" >> ~/tx.txt && \
	debconf-set-selections ~/tx.txt
RUN apt-get install -y abiword gnupg apt-transport-https wget software-properties-common ratpoison novnc websockify libxv1 libglu1-mesa xauth x11-utils xorg tightvncserver
RUN wget https://kumisystems.dl.sourceforge.net/project/virtualgl/2.6.5/virtualgl_2.6.5_amd64.deb && dpkg -i virtualgl_*.deb && rm virtualgl_*.deb
RUN wget https://kumisystems.dl.sourceforge.net/project/turbovnc/2.2.7/turbovnc_2.2.7_amd64.deb && dpkg -i turbovnc_*.deb && rm turbovnc_*.deb
RUN mkdir ~/.vnc/ && \
	mkdir ~/.dosbox && \
	echo "set border 1" > ~/.ratpoisonrc  && \
    echo "exec rxvt" >> ~/.ratpoisonrc #rxvt terminalemulator for the X11 server
RUN openssl req -x509 -nodes -newkey rsa:2048 -keyout ~/novnc.pem -out ~/novnc.pem -days 3650 -subj "/C=US/ST=NY/L=NY/O=NY/OU=NY/CN=NY emailAddress=email@example.com"
EXPOSE 80

#using supervisor for process management (code-server and vnc-server)
RUN apt-get -y install supervisor
ARG CONF_SUPERVISOR
COPY $CONF_SUPERVISOR /etc/supervisor.conf

#custom vnc client.html
ARG CUSTOM_VNC_HTML
COPY $CUSTOM_VNC_HTML /usr/share/novnc/vnc_lite.html

ENV DISPLAY=:1
USER coder
ENTRYPOINT ["supervisord" , "-c" , "/etc/supervisor.conf"]
