FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3100 80 443
CMD [ "node", "app.js"]