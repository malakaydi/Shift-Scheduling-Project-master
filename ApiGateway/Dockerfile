FROM node:18

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install graphql @apollo/server express cors body-parser

# Copy all files including protos
COPY . .

EXPOSE 3000

RUN npm install -g nodemon

CMD ["nodemon", "apiGateway.js"]