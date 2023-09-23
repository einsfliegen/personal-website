FROM node:18-alpine
WORKDIR /app
EXPOSE 3100 80 443
CMD [ "node", "app.js"]
COPY package.json /app
RUN npm install --production
COPY . /app