FROM node:16

WORKDIR /planning-poker-server

COPY package*.json ./

RUN npm ci --only=production

COPY dist .

CMD node server.js