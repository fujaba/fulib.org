FROM gradle:jdk17-alpine as builder
WORKDIR /fulib.org/backend
COPY build.gradle settings.gradle ./
RUN gradle --no-daemon dependencies
COPY . .
RUN gradle --no-daemon shadowJar

FROM openjdk:17-slim
RUN apt-get update -y && apt-get install -y graphviz && apt-get clean
WORKDIR /fulib.org/backend
COPY --from=builder /fulib.org/backend/build/libs/backend-*-all.jar backend-latest-all.jar
EXPOSE 4567
CMD ["java", "-Xmx4g", "-jar", "backend-latest-all.jar"]
