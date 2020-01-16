FROM node:latest

# Create the working environment
RUN mkdir -p /workdir
WORKDIR /workdir

# Add dependency files first and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app
COPY . ./

CMD node app.js
