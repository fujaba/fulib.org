#!/usr/bin/env bash
function waitForState() {
	retry=60
	state=""
	while [[ "$state" != "$1" ]] && [[ "$retry" -gt 0 ]]; do
		state=$(curl -s -u "$RANCHER_ACCESS:$RANCHER_KEY" "$RANCHER_SERVICE_URL" | jq -r '.state')
		retry=$((retry - 1))
		sleep 1
	done

	if [[ "$retry" -eq 0 ]]; then
		echo "Maximum retries exceeded waiting for state $1"
		exit 1
	fi
}

rm build/libs/fulibDotOrg-*-all.jar
./gradlew shadowJar

echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin
docker build -t "$DOCKER_USERNAME"/fulib_scenarios_"$DOCKER_VERSION":latest .
docker push "$DOCKER_USERNAME"/fulib_scenarios_"$DOCKER_VERSION":latest

echo "Upgrading Rancher ..."

config="$(sed "\
s|<FULIB_ORG_MONGODB_HOST>|$FULIB_ORG_MONGODB_HOST|g;\
s|<FULIB_ORG_MONGODB_USER>|$FULIB_ORG_MONGODB_USER|g;\
s|<FULIB_ORG_MONGODB_PASSWORD>|$FULIB_ORG_MONGODB_PASSWORD|g;\
s|<RANCHER_UPDATE_IMAGE>|$RANCHER_UPDATE_IMAGE|g;\
" rancher_config.json)"

curl -s \
	-u "$RANCHER_ACCESS:$RANCHER_KEY" \
	-X POST \
	-H 'Content-Type: application/json' \
	-d "$config" \
	"$RANCHER_SERVICE_URL?action=upgrade"

waitForState "upgraded"

echo "Finishing Rancher Upgrade ..."

curl -s \
	-u "$RANCHER_ACCESS:$RANCHER_KEY" \
	-X POST \
	"$RANCHER_SERVICE_URL?action=finishupgrade"

waitForState "active"

echo "Rancher Upgrade finished."
