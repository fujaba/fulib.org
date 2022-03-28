FROM openjdk:17-slim
RUN apt-get update -y && apt-get install -y graphviz && apt-get clean
RUN mkdir -p /fulib.org/backend
WORKDIR /fulib.org/backend
COPY ./build/libs/backend-*-all.jar backend-latest-all.jar
EXPOSE 4567
CMD ["java", "-Xmx4g", "-jar", "backend-latest-all.jar"]
