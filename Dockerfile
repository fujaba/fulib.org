FROM markhobson/maven-chrome:jdk-8
RUN mkdir /scenarios
WORKDIR /scenarios
COPY ./build/libs/fulibDotOrg-*-all.jar fulibDotOrg-latest-all.jar
EXPOSE 4567
CMD ["java", "-Xmx4g", "-jar", "fulibDotOrg-latest-all.jar"]
