FROM node:22.11.0

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon
COPY . .
CMD ["nodemon", "index.js"]