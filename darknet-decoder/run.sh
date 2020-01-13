#!/bin/bash

./darknet detector demo \
  /model/obj.data \
  /model/obj.cfg \
  /model/backup/obj.weights \
  -dont_show \
  -json_port 9070 \
  -mjpeg_port 9080 \
  -ext_output \
  ${MJPEG_STREAM_URL}/?action=stream&dummy=param.mjpg >/dev/null 2>&1

# Check to make sure the process is still running
while :
do
  sleep 5
  port_in_use=$(curl --max-time 10 --silent http://localhost:9070 | wc -l 2>/dev/null)
  if [[ "$port_in_use" -lt 10 ]]; then
    echo "Port is no longer serving traffic, system is probably down."
    exit 1
  fi
done
