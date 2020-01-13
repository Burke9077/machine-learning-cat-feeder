#!/bin/bash

# This program draws the 'zones' that the cats are allowed to be in to
#   visualize if the cat is in the right spot or not

IMAGE_INPUT_WIDTH=1280
IMAGE_INPUT_HEIGHT=720

# FFmpeg draws boxes from the top left, so calculate the
#   starting x point for each cat

BLACK_CAT_STARTING_X_COORD=$(echo "$IMAGE_INPUT_WIDTH * 0.05" | bc)
GREY_CAT_STARTING_X_COORD=$(echo "$IMAGE_INPUT_WIDTH * 0.55" | bc)

# Both cats will have the Y coordinate start at the same spot
CAT_ZONE_STARTING_Y_COORD=$(echo "$IMAGE_INPUT_HEIGHT*0.33" | bc)

# How wide and tall will the bounding boxes be?
CAT_ZONE_WIDTH=$(echo "$IMAGE_INPUT_WIDTH*0.4" | bc)
CAT_ZONE_HEIGHT=$(echo "$IMAGE_INPUT_HEIGHT*0.65" | bc)

ffserver -f ffserver.conf &

ffmpeg -i http://localhost:9080 http://localhost:7080/camera.ffm
