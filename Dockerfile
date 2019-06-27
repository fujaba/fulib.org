
FROM gradle:jdk8 as builder
COPY --chown=gradle:gradle . /scenarios
WORKDIR /scenarios
RUN gradle shadowJar

FROM openjdk
RUN mkdir /scenarios
WORKDIR /scenarios
COPY --from=builder /scenarios/build/libs/fulibDotOrg-*-all.jar fulibDotOrg-latest-all.jar
EXPOSE 4567
CMD ["java", "-jar", "fulibDotOrg-latest-all.jar"]
