FROM node:24-alpine AS base
WORKDIR /app
ADD package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
