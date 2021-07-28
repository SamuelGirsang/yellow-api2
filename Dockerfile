FROM node:12.22.3-alpine
WORKDIR /

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 7770
CMD ["npm", "start"]