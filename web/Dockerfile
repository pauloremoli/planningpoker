
# Build

FROM node:alpine as build

WORKDIR /planning-poker

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "npm", "run", "build" ]


# NGINX server
FROM nginx as prod

COPY --from=build /planning-poker/build /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
