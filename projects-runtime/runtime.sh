#!/bin/sh
dockerd --host tcp://0.0.0.0:2376 --host unix:///var/run/docker.sock --tls=false & sleep 20

docker network create fulib-projects

docker pull clashsoft/fulib-projects:latest &
docker run -p 8080:80 --network=fulib-projects clashsoft/fulib-projects-proxy &
nginx -g 'daemon off;' &
wait
