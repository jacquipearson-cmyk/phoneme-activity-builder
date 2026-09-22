# -------- Stage 1: Build --------
FROM node:lts-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Next.js (App Router)
RUN npm run build

# -------- Stage 2: Production --------
FROM node:lts-alpine

# Install tini for proper signal handling
RUN apk add --no-cache tini

ENV NODE_ENV=production

WORKDIR /app

# Copy only what we need for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Expose Next.js port
EXPOSE 3000

CMD ["npm", "start"]
