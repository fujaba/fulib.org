#!/bin/sh
wait_for_docker() {
	for _ in $(seq 1 20); do
		docker info >/dev/null 2>&1 && return 0
		sleep 1
	done
	return 1
}

dockerd --host tcp://0.0.0.0:2376 --tls=false || exit 1 &
export DOCKER_HOST=localhost:2376
wait_for_docker || exit 1

docker network create "$FULIB_PROJECTS_NETWORK"

if [ -n "$DOCKER_REGISTRY" ]; then
	docker login "$DOCKER_REGISTRY" -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"
fi

for tag in $(jq -r '.[].tag' <images.json); do
	docker pull "$tag" &
done

docker pull "$FULIB_PROJECTS_PROXY_IMAGE" && docker run -p 8080:80 --network="$FULIB_PROJECTS_NETWORK" "$FULIB_PROJECTS_PROXY_IMAGE" &
wait
