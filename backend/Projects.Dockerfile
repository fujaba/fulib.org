FROM markhobson/maven-chrome:jdk-8
RUN apt-get update -y && apt-get install -y graphviz inotify-tools
CMD ["/bin/bash"]
