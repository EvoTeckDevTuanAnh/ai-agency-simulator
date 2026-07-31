FROM node:22-alpine AS base
RUN corepack disable && npm install -g pnpm@11.17.0
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api-gateway/package.json apps/api-gateway/
RUN pnpm install --frozen-lockfile
COPY apps/api-gateway/src apps/api-gateway/src
COPY apps/api-gateway/tsconfig.json apps/api-gateway/tsconfig.build.json apps/api-gateway/nest-cli.json apps/api-gateway/
RUN pnpm --filter @ai-agency/api-gateway build

FROM node:22-alpine AS runner
RUN corepack disable && npm install -g pnpm@11.17.0
WORKDIR /app
ENV NODE_ENV=production

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-gateway/package.json apps/api-gateway/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/apps/api-gateway/dist ./apps/api-gateway/dist

EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "apps/api-gateway/dist/main.js"]
