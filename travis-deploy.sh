#!/usr/bin/env bash
function waitForState() {
	retry=60
	state=""
	while [[ "$state" != "$1" ]] && [[ "$retry" -gt 0 ]]
	do
		state=$(curl -u "$RANCHER_ACCESS:$RANCHER_KEY" "$rancherURL" | jq -r '.state')
		retry=$((retry-1))
		sleep 1
	done

	if [[ "$retry" -eq 0 ]]; then
		echo "Maximum retries exceeded waiting for state $1"
		exit 1
	fi
}

echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin
docker build -t "$DOCKER_USERNAME"/fulib_scenarios:latest .
docker push "$DOCKER_USERNAME"/fulib_scenarios:latest

rancherURL="http://avocado.uniks.de:8080/v2-beta/projects/1a5/services/1s173"

echo "Upgrading Rancher ..."

curl -u "$RANCHER_ACCESS:$RANCHER_KEY" \
     -X POST \
     -H 'Content-Type: application/json' \
     -d '{"inServiceStrategy": { "startFirst": true, "secondaryLaunchConfigs": []}}' \
     "$rancherURL?action=upgrade"

waitForState "upgraded"

echo "Finishing Rancher Upgrade ..."

curl -u "$RANCHER_ACCESS:$RANCHER_KEY" \
     -X POST \
     "$rancherURL?action=finishupgrade"

waitForState "active"

echo "Rancher Upgrade finished."
