FROM openjdk:17-alpine
RUN apk update && apk add graphviz
COPY build/libs/workflows-0.0.0.jar workflows.jar
EXPOSE 11356
ENTRYPOINT ["java","-jar","/workflows.jar"]
