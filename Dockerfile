FROM node:16-alpine

RUN apk add --update --no-cache imagemagick
RUN apk add --no-cache zbar
RUN apk add --no-cache poppler-utils

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
ENTRYPOINT ["node", "server.js"]
