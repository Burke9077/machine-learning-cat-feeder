FROM docker:latest

# Stop any running darknet decoders and start ours
CMD docker ps \
      | grep ml-catfeeder/darknet-decoder \
      | awk '{print $1}' \
      | xargs docker rm -f && \
    docker run \
      --net=host \
      --privileged=true \
      --restart=always \
      --env-file="/data/.env" \
      ml-catfeeder/darknet-decoder

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
