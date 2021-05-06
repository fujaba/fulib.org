#!/bin/sh
dockerd --host tcp://0.0.0.0:2376 --tls=false & sleep 20

export DOCKER_HOST=localhost:2376
docker network create fulib-projects

docker pull "$FULIB_PROJECTS_CONTAINER_IMAGE":latest &
docker run -p 8080:80 --network=fulib-projects "$FULIB_PROJECTS_PROXY_IMAGE" &
nginx -g 'daemon off;' &
wait
