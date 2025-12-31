FROM node:18-alpine
WORKDIR /app
EXPOSE 3100 80 443
#COPY package.json /app
COPY . /app
RUN npm install --production
#COPY . /app
CMD [ "node", "app.js"]