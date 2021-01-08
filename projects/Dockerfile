FROM markhobson/maven-chrome:jdk-8
RUN apt-get update -y && apt-get install -y graphviz inotify-tools nginx-full
RUN mkdir /projects
COPY nginx.conf /etc/nginx/sites-available/default
RUN sed -i 's/^user.*;$/user root;/' /etc/nginx/nginx.conf
COPY ./build/libs/projects-*-all.jar /opt/projects/
CMD java -jar /opt/projects/projects-*-all.jar & nginx -g 'daemon off;' & wait
EXPOSE 80
