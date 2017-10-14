FROM mhart/alpine-node:latest

COPY package.json /tmp/package.json
RUN cd /tmp && yarn
RUN mkdir -p /usr/app && cp -a /tmp/node_modules /usr/app

WORKDIR /usr/app
COPY ./ /usr/app

CMD ["node", "index.js"]