#!/usr/bin/env bash
function waitForState() {
	retry=60
	state=""
	while [[ "$state" != "$1" ]] && [[ "$retry" -gt 0 ]]
	do
		state=$(curl -s -u "$RANCHER_ACCESS:$RANCHER_KEY" "$rancherURL" | jq -r '.state')
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

curl -s \
     -u "$RANCHER_ACCESS:$RANCHER_KEY" \
     -X POST \
     -H 'Content-Type: application/json' \
     -d '{"inServiceStrategy":{"secondaryLaunchConfigs": [], "launchConfig":{"blkioWeight": null,"capAdd": [],"capDrop": [],"cgroupParent": null,"count": null,"cpuCount": null,"cpuPercent": null,"cpuPeriod": null,"cpuQuota": null,"cpuRealtimePeriod": null,"cpuRealtimeRuntime": null,"cpuSet": null,"cpuSetMems": null,"cpuShares": null,"dataVolumes": [ ],"dataVolumesFrom": [ ],"description": null,"devices": [ ],"diskQuota": null,"dns": [ ],"dnsSearch": [ ],"domainName": null,"healthInterval": null,"healthRetries": null,"healthTimeout": null,"hostname": null,"imageUuid": "docker:zuendorf/fulib_scenarios:latest","instanceTriggeredStop": "stop","ioMaximumBandwidth": null,"ioMaximumIOps": null,"ip": null,"ip6": null,"ipcMode": null,"isolation": null,"kernelMemory": null,"kind": "container","labels": {"io.rancher.container.pull_image": "always"},"logConfig": {"type": "logConfig","config": { },"driver": null},"memory": null,"memoryMb": null,"memoryReservation": null,"memorySwap": null,"memorySwappiness": null,"milliCpuReservation": null,"networkMode": "managed","oomScoreAdj": null,"pidMode": null,"pidsLimit": null,"ports": [ ],"privileged": false,"publishAllPorts": false,"readOnly": false,"requestedIpAddress": null,"runInit": false,"secrets": [ ],"shmSize": null,"startOnCreate": true,"stdinOpen": true,"stopSignal": null,"stopTimeout": null,"system": false,"tty": true,"user": null,"userdata": null,"usernsMode": null,"uts": null,"version": "e14cb622-2acf-46c6-b72e-c30e1d691766","volumeDriver": null,"workingDir": null,"dataVolumesFromLaunchConfigs": [ ],"networkLaunchConfig": null,"vcpu": 1,"drainTimeoutMs": 0 }}}' \
     "$rancherURL?action=upgrade"

waitForState "upgraded"

echo "Finishing Rancher Upgrade ..."

curl -s \
     -u "$RANCHER_ACCESS:$RANCHER_KEY" \
     -X POST \
     "$rancherURL?action=finishupgrade"

waitForState "active"

echo "Rancher Upgrade finished."
