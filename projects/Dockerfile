FROM gradle:7.4.2-jdk17-alpine as preload
WORKDIR /opt/preload
COPY preload.build.gradle build.gradle
RUN gradle wrapper && ./gradlew downloadDependencies && ./gradlew --stop


FROM codercom/code-server

RUN sudo apt-get update -y \
    && sudo apt-get install -y \
        openjdk-17-jdk \
    && sudo apt-get clean

#Gradle
COPY --from=preload --chown=coder /root/.gradle /home/coder/.gradle

RUN code-server --install-extension redhat.java


USER root
ENV USER=root
ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN=true
RUN apt-get update
RUN echo "tzdata tzdata/Areas select America" > ~/tx.txt && \
	echo "tzdata tzdata/Zones/America select New York" >> ~/tx.txt && \
	debconf-set-selections ~/tx.txt
RUN apt-get install -y abiword gnupg apt-transport-https wget software-properties-common ratpoison novnc websockify libxv1 libglu1-mesa xauth x11-utils xorg tightvncserver
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && apt install -y ./google-chrome-stable_current_amd64.deb && rm ./google-chrome-stable_current_amd64.deb
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
COPY supervisor.conf /etc/supervisor.conf

USER coder
ENV USER=coder
ENV DISPLAY=:1

ENTRYPOINT ["supervisord" , "-c" , "/etc/supervisor.conf"]