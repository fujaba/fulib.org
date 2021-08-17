FROM openjdk:8-jdk-slim
RUN mkdir -p /fulib.org/projects-backend
WORKDIR /fulib.org/projects-backend
COPY ./build/libs/projects-backend-*-all.jar projects-backend.jar
EXPOSE 4568
CMD ["java", "-Xmx1g", "-jar", "projects-backend.jar"]
