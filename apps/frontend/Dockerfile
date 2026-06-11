# syntax=docker/dockerfile:1
# 教育部藝術設計三大計畫入口網 — 前端（Next.js standalone）
# build context 為 monorepo 根目錄：
#   docker build -f apps/frontend/Dockerfile -t mead-frontend .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- 安裝相依 + 建置 ----
FROM base AS builder
# 複製整個 workspace（monorepo 建置需要 lockfile、workspace 設定、共用 packages）
COPY . .
RUN pnpm install --frozen-lockfile --filter @mead/frontend...
# NEXT_PUBLIC_* 在 build 時烘進 client bundle —— 以 build args 傳入（見 docker-compose.yml 的
# frontend.build.args，值由 .env.docker 插值），不依賴 Next.js 自動載入 .env 檔，故 runtime
# 設定檔可命名為 .env.prod（與 backend 一致）。
ARG NEXT_PUBLIC_GRAPHQL_ENDPOINT
ARG NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_ENABLE_2FA
ARG NEXT_PUBLIC_ENABLE_ANALYTICS
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_TELEMETRY_DISABLED=1
# 快取 Next 建置快取（含 next/font/google 抓取的字體子集）：gstatic 對上百個
# Noto Sans TC 子集的並發請求偶有節流／丟包，掛載快取讓已抓到的子集跨建置累積，
# 避免每次都得一次抓齊、降低字體抓取失敗導致 build 中斷的機率。
RUN --mount=type=cache,target=/app/apps/frontend/.next/cache \
  pnpm --filter @mead/frontend build

# ---- 執行階段（最小映像）----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# 以非 root 身分執行
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Next.js standalone 產出（含追蹤過的最小 node_modules）
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

USER nextjs
EXPOSE 3000
# standalone 於 monorepo 下的進入點
CMD ["node", "apps/frontend/server.js"]
