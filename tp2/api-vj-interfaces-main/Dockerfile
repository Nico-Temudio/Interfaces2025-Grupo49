FROM node:24.4.1-alpine

USER node:node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

#RUN npm run build

RUN rm -rf src

CMD [ "npm", "run", "start"]