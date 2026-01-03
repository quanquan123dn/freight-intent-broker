FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/contracts/package*.json ./packages/contracts/

# Install dependencies
RUN npm install

# Copy source
COPY apps/api ./apps/api
COPY packages ./packages
COPY tsconfig.json ./

# Build packages first
WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/packages/contracts
RUN npm run build

# Build API
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

CMD ["node", "dist/main.js"]
