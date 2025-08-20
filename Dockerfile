FROM node:20-alpine

WORKDIR /yeezy-coin-api

ADD . /yeezy-coin-api

RUN npm install

RUN npm run build

EXPOSE 3000
CMD ["/bin/sh", "-c", "npm run start"]