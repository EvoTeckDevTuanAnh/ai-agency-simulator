FROM node:22-alpine AS base
RUN corepack disable && npm install -g pnpm@11.17.0
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/auth-service/package.json apps/auth-service/
RUN pnpm install --frozen-lockfile
COPY apps/auth-service/src apps/auth-service/src
COPY apps/auth-service/tsconfig.json apps/auth-service/tsconfig.build.json apps/auth-service/nest-cli.json apps/auth-service/
RUN pnpm --filter @ai-agency/auth-service build

FROM node:22-alpine AS runner
RUN corepack disable && npm install -g pnpm@11.17.0
WORKDIR /app
ENV NODE_ENV=production

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/auth-service/package.json apps/auth-service/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/apps/auth-service/dist ./apps/auth-service/dist

EXPOSE 3003
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3003/health || exit 1

CMD ["node", "apps/auth-service/dist/main.js"]
