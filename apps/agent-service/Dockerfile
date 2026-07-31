FROM node:22-alpine AS base
RUN corepack disable && npm install -g pnpm@11.17.0
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/validation/package.json packages/validation/
COPY apps/agent-service/package.json apps/agent-service/
RUN pnpm install --frozen-lockfile
COPY packages/contracts/tsconfig.json packages/contracts/
COPY packages/contracts/src packages/contracts/src
COPY packages/validation/tsconfig.json packages/validation/
COPY packages/validation/src packages/validation/src
COPY apps/agent-service/src apps/agent-service/src
COPY apps/agent-service/tsconfig.json apps/agent-service/tsconfig.build.json apps/agent-service/nest-cli.json apps/agent-service/
RUN pnpm --filter @ai-agency/contracts build && \
    pnpm --filter @ai-agency/validation build && \
    pnpm --filter @ai-agency/agent-service build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
ENV NODE_ENV=production

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/agent-service/package.json apps/agent-service/
COPY packages/contracts/package.json packages/contracts/
COPY packages/validation/package.json packages/validation/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/apps/agent-service/dist ./apps/agent-service/dist
COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/packages/validation/dist ./packages/validation/dist

RUN mkdir -p /app/data

EXPOSE 3002
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3002/health || exit 1

CMD ["node", "apps/agent-service/dist/main.js"]
