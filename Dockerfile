FROM openjdk:8-jdk-alpine
RUN mkdir /scenarios
WORKDIR /scenarios
COPY ./build/libs/fulibDotOrg-*-all.jar fulibDotOrg-latest-all.jar
EXPOSE 4567
CMD ["java", "-jar", "fulibDotOrg-latest-all.jar"]
