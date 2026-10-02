# -------- Stage 1: Build --------
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# -------- Stage 2: Production --------
FROM node:20-slim

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/prisma/dev.db"

WORKDIR /app

# Install OpenSSL and tini
RUN apt-get update \
&& apt-get install -y openssl tini \
&& rm -rf /var/lib/apt/lists/*

# Package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy Next build
COPY --from=builder /app/.next ./.next

# Copy public assets
COPY --from=builder /app/public ./public

# Copy Prisma schema and database
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Optional SQLite permissions
RUN chmod -R 777 ./prisma

ENTRYPOINT ["/usr/bin/tini","--"]

EXPOSE 3000

CMD ["npm","start"]