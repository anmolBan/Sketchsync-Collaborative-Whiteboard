# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json turbo.json ./
COPY apps/http-backend/package.json apps/http-backend/package.json
COPY apps/ws-backend/package.json apps/ws-backend/package.json
COPY packages/backend-common/package.json packages/backend-common/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN npm ci

FROM base AS prod-deps
COPY package.json package-lock.json turbo.json ./
COPY apps/http-backend/package.json apps/http-backend/package.json
COPY apps/ws-backend/package.json apps/ws-backend/package.json
COPY packages/backend-common/package.json packages/backend-common/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN npm ci --omit=dev

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run generate --workspace=@repo/db
RUN npm run build --workspace=@repo/backend_common
RUN npm run build --workspace=@repo/types
RUN npm run build --workspace=@repo/db
RUN npm run build --workspace=ws-backend

FROM base AS runner
ENV NODE_ENV=production
ENV WS_PORT=8080
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/ws-backend/package.json ./apps/ws-backend/package.json
COPY --from=builder /app/apps/ws-backend/dist ./apps/ws-backend/dist
COPY --from=builder /app/packages/backend-common/package.json ./packages/backend-common/package.json
COPY --from=builder /app/packages/backend-common/dist ./packages/backend-common/dist
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json
COPY --from=builder /app/packages/types/dist ./packages/types/dist
EXPOSE 8080
CMD ["node", "apps/ws-backend/dist/index.js"]
