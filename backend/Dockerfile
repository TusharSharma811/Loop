FROM node:24-alpine AS builder
WORKDIR /app
ADD package*.json ./
RUN npm install 
COPY . .
RUN npm run build

FROM node:24-alpine3.21 AS runtime

WORKDIR /app


COPY package*.json ./
RUN npm install --only=production
COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist


EXPOSE 3000

CMD ["node", "dist/server.js"]

