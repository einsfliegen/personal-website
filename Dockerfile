FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3100
CMD [ "node", "app.js"]
ENV NODE_ENV = production