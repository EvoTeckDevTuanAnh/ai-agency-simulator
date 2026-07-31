FROM node:22-alpine AS base
RUN corepack disable && npm install -g pnpm@11.17.0
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json .npmrc ./
COPY apps/web-dashboard/ apps/web-dashboard/
RUN pnpm install --no-frozen-lockfile && cd apps/web-dashboard && pnpm run build

FROM nginx:alpine AS runner
COPY --from=build /app/apps/web-dashboard/dist /usr/share/nginx/html
COPY apps/web-dashboard/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
