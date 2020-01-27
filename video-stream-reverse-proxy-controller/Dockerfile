FROM docker:latest

# Stop any running reverse proxy instances and start ours
CMD docker ps \
      | grep ml-catfeeder/video-stream-reverse-proxy \
      | awk '{print $1}' \
      | xargs docker rm -f && \
    docker run \
      --net=host \
      --restart=always \
      --env-file="/data/.env" \
      ml-catfeeder/video-stream-reverse-proxy

# darknet-decoder:
#   build:
#       context: ./darknet-decoder
#   image:
#   network_mode: "host"
#   env_file: .env
#   ports:
#   - "9080:9080"
#   - "9070:9070"
#   privileged: true
#   deploy:
#     restart_policy:
#       condition: any
#       delay: 5s
#       max_attempts: 100
#       window: 10s
