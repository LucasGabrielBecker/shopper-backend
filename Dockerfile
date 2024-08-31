FROM node:20.9.0-alpine3.18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . . 
RUN npx prisma generate
RUN npm run build
EXPOSE 3333

CMD [ "npm", "start" ]