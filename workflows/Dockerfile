FROM openjdk:17-slim
RUN apt-get update -y && apt-get install -y graphviz && apt-get clean
COPY build/libs/workflows-*.jar workflows.jar
EXPOSE 11356
ENTRYPOINT ["java","-jar","/workflows.jar"]
