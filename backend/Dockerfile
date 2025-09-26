# ---- Builder Stage ----
FROM node:24-alpine AS builder

WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install dev dependencies for building TS
RUN npm install

# Copy rest of the source
COPY . .

# Fix: ensure TS build outputs to /app/dist
RUN npm run build

# ---- Runtime Stage ----
FROM node:24-alpine3.21 AS runtime

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy prisma schema
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.js"]
