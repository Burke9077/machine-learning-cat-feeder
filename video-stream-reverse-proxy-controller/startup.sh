#!/bin/bash

# Sleep for a bit to wait for the containers to all start up
echo "Waiting for startup"
sleep 5

# Stop any running reverse proxy instances and start ours
echo "Stopping all other video stream reverse proxy instances"
docker ps \
  | grep "ml-catfeeder/video-stream-reverse-proxy " \
  | awk '{print $1}' \
  | xargs docker rm -f || true

# Start our container!
echo "Start the new container"
docker run \
  -p 12000:12000 \
  --restart=always \
  ml-catfeeder/video-stream-reverse-proxy
