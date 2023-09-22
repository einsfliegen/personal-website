FROM node:18-alpine
WORKDIR /app
COPY . .
ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm install
EXPOSE 3100 80 443
CMD [ "node", "app.js"]
