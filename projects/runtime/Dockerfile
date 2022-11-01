FROM docker:dind
RUN apk add jq

# runtime
WORKDIR /projects/
COPY runtime/runtime.sh images.json ./
RUN chmod +x runtime.sh
CMD ./runtime.sh
