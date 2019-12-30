FROM node:13

# This is a node app that makes calls to python since the python wemo library is
# better supported than what I can find from npm.
# Install the python dependency stuff first.
#
# This code:
# - updates apt
# - installs python3 and python3-pip
# - deletes the apt cache so it doesn't take up unneeded space
# - installs the pywemo package we wanted
RUN apt-get update && \
  apt-get -qq install \
    python3 \
    python3-pip && \
  rm -rf /var/lib/apt/lists/* && \
  pip3 install pywemo

# Copy in dependency file so we can install packages before copying in app.
# This improves on Docker build times
COPY package-lock.json package.json ./

# Install required dependencies
RUN npm install

# Copy in our actual app (except what is blacklisted in .dockerignore)
COPY . .

# Set the app for node to run
CMD node app.js
