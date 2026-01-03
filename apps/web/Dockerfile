FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/contracts/package*.json ./packages/contracts/

RUN npm install

COPY apps/web ./apps/web
COPY packages ./packages
COPY tsconfig.json ./

WORKDIR /app/packages/shared
RUN npm run build || true

WORKDIR /app/packages/contracts
RUN npm run build || true

WORKDIR /app/apps/web
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
