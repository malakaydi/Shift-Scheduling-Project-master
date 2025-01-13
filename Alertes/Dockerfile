FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Match the port with docker-compose
EXPOSE 50051

CMD ["node", "alerteMsgMicroservice.js"]

