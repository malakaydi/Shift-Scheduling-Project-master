FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 50053

CMD ["node", "employeeMicroservice.js"]

