FROM node:13

# Copy in dependency file so we can install packages before copying in app.
# This improves on Docker build times
COPY package-lock.json package.json ./

# Install required dependencies
RUN npm install

# Copy in our actual app (except what is blacklisted in .dockerignore)
COPY . .

# Set the app for node to run
CMD node app.js
