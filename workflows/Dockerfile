FROM openjdk:17-alpine
RUN apk update && apk add graphviz
COPY build/libs/backend-0.0.0.jar backend.jar
EXPOSE 94364
ENTRYPOINT ["java","-jar","/backend.jar"]
