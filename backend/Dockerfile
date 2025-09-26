# Backend1 Builder
FROM node:24-alpine AS builder-backend1
WORKDIR /app
COPY backend1/package*.json ./
RUN npm install
COPY backend1 ./
RUN npm run build

# Backend2 Builder
FROM node:24-alpine AS builder-backend2
WORKDIR /app
COPY backend2/package*.json ./
RUN npm install
COPY backend2 ./
RUN npm run build

# Backend1 Runtime
FROM node:24-alpine AS runtime-backend1
WORKDIR /app
COPY backend1/package*.json ./
RUN npm install --only=production
COPY backend1/prisma ./prisma
RUN npx prisma generate
COPY --from=builder-backend1 /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]

# Backend2 Runtime
FROM node:24-alpine AS runtime-backend2
WORKDIR /app
COPY backend2/package*.json ./
RUN npm install --only=production
COPY backend2/prisma ./prisma
RUN npx prisma generate
COPY --from=builder-backend2 /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
