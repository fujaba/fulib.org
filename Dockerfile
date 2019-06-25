
FROM gradle:jdk8 as builder
COPY --chown=gradle:gradle . /scenarios
WORKDIR /scenarios
RUN gradle shadowJar

FROM openjdk
RUN mkdir /scenarios
WORKDIR /scenarios
COPY --from=builder /scenarios/build/libs .
EXPOSE 4567
CMD ["java", "-jar", "fulibDotOrg-0.2.2.jar"]
